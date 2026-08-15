import AsyncStorage from '@react-native-async-storage/async-storage';

// Thin typed wrapper around AsyncStorage used for auth session persistence
// and for persisting mock-mode "backend" mutations (submissions, internship
// logs, sent messages) between app restarts.

export const StorageKeys = {
  AUTH_TOKEN: 'em_e1.auth.token',
  AUTH_STUDENT_ID: 'em_e1.auth.studentId',
  MOCK_SUBMISSIONS: 'em_e1.mock.submissions',
  MOCK_INTERNSHIP_LOGS: 'em_e1.mock.internshipLogs',
  MOCK_MESSAGES: 'em_e1.mock.messages',
  MOCK_NOTIFICATIONS_READ: 'em_e1.mock.notificationsRead',
  PUSH_TOKEN: 'em_e1.push.token',
} as const;

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort persistence only
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
