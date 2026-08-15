// Real expo-notifications wiring: local scheduled reminders for sessions and
// assignment deadlines, plus the remote push-token registration flow.
//
// Local notifications work fully offline/standalone (no backend needed).
// Remote push (server-initiated) requires a backend push-sending service —
// see the TODO in registerForPushNotificationsAsync() and
// api/client.ts#registerPushToken.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from '../api';
import { Session } from '../types';

// Show alerts/sounds while the app is foregrounded too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let status = settings.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F5A623',
    });
  }

  return status === 'granted';
}

/**
 * Registers this device for remote (server-sent) push notifications and
 * returns the Expo push token, or null if unavailable (simulator / denied).
 *
 * TODO(backend): send the returned token to the LMS backend via
 * api.registerPushToken(token) so a server-side job/worker can push
 * SESSION_REMINDER / DEADLINE_REMINDER / GRADE_POSTED / ANNOUNCEMENT
 * notifications using Expo's push API (https://docs.expo.dev/push-notifications/sending-notifications/).
 * That backend service does not exist yet — this only wires the client half.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[notifications] Push notifications require a physical device; skipping token registration.');
    return null;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) return null;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;
    await api.registerPushToken(token);
    return token;
  } catch (err) {
    console.warn('[notifications] Failed to get Expo push token:', err);
    return null;
  }
}

const SESSION_REMINDER_MINUTES_BEFORE = 30;

function sessionNotificationId(sessionId: string) {
  return `session-reminder-${sessionId}`;
}

/**
 * Schedules a local notification N minutes before a session's start time.
 * Safe to call repeatedly — cancels any existing reminder for the same
 * session first, and silently no-ops if the session already started.
 */
export async function scheduleSessionReminder(session: Session): Promise<string | null> {
  if (!session.scheduledDate) return null;
  const granted = await ensureNotificationPermissions();
  if (!granted) return null;

  await cancelSessionReminder(session.id);

  const startTime = new Date(session.scheduledDate).getTime();
  const triggerTime = startTime - SESSION_REMINDER_MINUTES_BEFORE * 60 * 1000;
  if (triggerTime <= Date.now()) return null; // already too close / in the past

  const identifier = sessionNotificationId(session.id);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: `Starts in ${SESSION_REMINDER_MINUTES_BEFORE} minutes`,
      body: `${session.topic} (${session.subjectCode}) — tap to join.`,
      data: { type: 'SESSION_REMINDER', sessionId: session.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(triggerTime),
    },
  });

  return identifier;
}

export async function cancelSessionReminder(sessionId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(sessionNotificationId(sessionId)).catch(() => undefined);
}

const DEADLINE_REMINDER_HOURS_BEFORE = 24;

function deadlineNotificationId(assessmentId: string) {
  return `deadline-reminder-${assessmentId}`;
}

/**
 * Schedules a local notification 24 hours before an assessment's due date.
 */
export async function scheduleDeadlineReminder(assessment: {
  id: string;
  title: string;
  dueDate: string;
}): Promise<string | null> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return null;

  await cancelDeadlineReminder(assessment.id);

  const dueTime = new Date(assessment.dueDate).getTime();
  const triggerTime = dueTime - DEADLINE_REMINDER_HOURS_BEFORE * 60 * 60 * 1000;
  if (triggerTime <= Date.now()) return null;

  const identifier = deadlineNotificationId(assessment.id);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: 'Deadline tomorrow',
      body: `"${assessment.title}" is due in ${DEADLINE_REMINDER_HOURS_BEFORE} hours.`,
      data: { type: 'DEADLINE_REMINDER', assessmentId: assessment.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(triggerTime),
    },
  });

  return identifier;
}

export async function cancelDeadlineReminder(assessmentId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(deadlineNotificationId(assessmentId)).catch(() => undefined);
}

/**
 * Bulk-schedules reminders for all upcoming sessions and unsubmitted
 * assessment deadlines. Called once on login / app start.
 */
export async function scheduleAllUpcomingReminders(
  sessions: Session[],
  assessments: { id: string; title: string; dueDate: string }[]
): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming');
  await Promise.all(upcomingSessions.map((s) => scheduleSessionReminder(s)));

  const upcomingAssessments = assessments.filter((a) => new Date(a.dueDate).getTime() > Date.now());
  await Promise.all(upcomingAssessments.map((a) => scheduleDeadlineReminder(a)));
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
