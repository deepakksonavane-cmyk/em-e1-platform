import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { clearAuthSession } from '../api/client';
import { Student } from '../types';
import { getJSON, StorageKeys } from '../utils/storage';
import { registerForPushNotificationsAsync, scheduleAllUpcomingReminders } from '../notifications/notifications';

interface AuthContextValue {
  student: Student | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshStudent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function setupNotificationsForSession() {
  try {
    await registerForPushNotificationsAsync();
    const [sessions, assessments] = await Promise.all([api.getSessions(), api.getAssessments()]);
    await scheduleAllUpcomingReminders(sessions, assessments);
  } catch (err) {
    console.warn('[auth] Failed to set up notifications:', err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const studentId = await getJSON<string | null>(StorageKeys.AUTH_STUDENT_ID, null);
      if (studentId) {
        try {
          const dashboard = await api.getDashboard();
          setStudent({
            id: studentId,
            studentId: dashboard.studentIdCode,
            userId: studentId,
            user: { id: studentId, email: '', role: 'STUDENT', name: dashboard.studentName, isActive: true },
            batch: 'Batch A',
            registrationDate: new Date().toISOString(),
            status: 'ACTIVE',
          } as Student);
          setupNotificationsForSession();
        } catch {
          // stale session, ignore
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setStudent(result.student);
    setupNotificationsForSession();
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }) => {
      const result = await api.register(input);
      setStudent(result.student);
      setupNotificationsForSession();
    },
    []
  );

  const logout = useCallback(async () => {
    await clearAuthSession();
    setStudent(null);
  }, []);

  const refreshStudent = useCallback(async () => {
    const dashboard = await api.getDashboard();
    setStudent((prev) => (prev ? { ...prev, studentId: dashboard.studentIdCode } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ student, isLoading, isAuthenticated: !!student, login, register, logout, refreshStudent }),
    [student, isLoading, login, register, logout, refreshStudent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
