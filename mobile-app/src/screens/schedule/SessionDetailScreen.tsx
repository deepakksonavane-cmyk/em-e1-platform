import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { api } from '../../api';
import { Session } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate } from '../../utils/dates';
import { ScheduleStackParamList } from '../../navigation/types';
import { scheduleSessionReminder } from '../../notifications/notifications';

type Props = NativeStackScreenProps<ScheduleStackParamList, 'SessionDetail'>;

export default function SessionDetailScreen({ route }: Props) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<Session | null>(null);

  const load = useCallback(async () => {
    setSession(await api.getSession(sessionId));
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!session) {
    return (
      <Screen>
        <Text style={typography.body}>Loading session…</Text>
      </Screen>
    );
  }

  const onJoin = async () => {
    if (!session.meetingLink) return;
    const canOpen = await Linking.canOpenURL(session.meetingLink);
    if (canOpen) {
      Linking.openURL(session.meetingLink);
    } else {
      Alert.alert('Unable to open link', session.meetingLink);
    }
  };

  const onOpenRecording = async () => {
    if (!session.recordingUrl) return;
    Linking.openURL(session.recordingUrl);
  };

  const onSetReminder = async () => {
    const id = await scheduleSessionReminder(session);
    if (id) {
      Alert.alert('Reminder set', 'We will notify you 30 minutes before this session starts.');
    } else {
      Alert.alert('Could not schedule reminder', 'This session may already be in the past, or notification permission was denied.');
    }
  };

  return (
    <Screen>
      <View style={styles.badgeRow}>
        <Badge label={session.code} tone="neutral" />
        <Badge label={session.subjectCode} tone="info" />
        <Badge
          label={session.status}
          tone={session.status === 'completed' ? 'success' : session.status === 'live' ? 'danger' : 'amber'}
        />
      </View>

      <Text style={styles.topic}>{session.topic}</Text>
      <Text style={styles.meta}>
        {formatDate(session.scheduledDate!)} · {session.startTime}–{session.endTime} · {session.hours}h
      </Text>
      <Text style={styles.metaSecondary}>
        {session.module}: {session.moduleName} · Week {session.week}
      </Text>

      {session.status !== 'completed' && (
        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <Button label="Join Live Session" onPress={onJoin} />
          </View>
        </View>
      )}
      {session.status !== 'completed' && (
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Remind Me 30 Min Before" onPress={onSetReminder} variant="outline" />
        </View>
      )}
      {session.status === 'completed' && session.recordingUrl && (
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Watch Recording" onPress={onOpenRecording} variant="secondary" />
        </View>
      )}

      <Card style={{ marginTop: spacing.xl }}>
        <Text style={styles.sectionTitle}>Key Topics</Text>
        {session.keyTopics.map((t) => (
          <View key={t} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{t}</Text>
          </View>
        ))}
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Teaching Method</Text>
        <Text style={styles.body}>{session.teachingMethod}</Text>
      </Card>

      {session.assessmentNote && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Assessment</Text>
          <Text style={styles.body}>{session.assessmentNote}</Text>
        </Card>
      )}

      {session.resources && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <Text style={styles.body}>{session.resources}</Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  topic: { ...typography.h2, color: colors.navy, marginBottom: spacing.xs },
  meta: { ...typography.body, color: colors.textSecondary, marginBottom: 2 },
  metaSecondary: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg },
  actionsRow: { flexDirection: 'row', marginTop: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.navy, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textPrimary },
  bulletRow: { flexDirection: 'row', marginBottom: 6 },
  bulletDot: { color: colors.amberDark, marginRight: 8, fontWeight: '700' },
  bulletText: { ...typography.body, color: colors.textPrimary, flex: 1 },
});
