// Real HTTP client for the Student LMS backend (Next.js + Prisma/Postgres),
// talking to EXPO_PUBLIC_API_BASE_URL (default http://localhost:3000/api).
//
// Endpoint shapes assume REST routes named after the Prisma models in
// shared/prisma/schema.prisma: /auth/*, /students/*, /sessions, /subjects,
// /weekends, /assessments, /submissions, /grades, /internship, /messages,
// /notifications. Adjust paths here if the LMS backend's actual route
// naming differs once it lands.

import { getJSON, removeKey, setJSON, StorageKeys } from '../utils/storage';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import { Api, DashboardSummary, LoginResult } from './types';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getJSON<string | null>(StorageKeys.AUTH_TOKEN, null);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status} ${res.statusText}: ${text || path}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const realApi: Api = {
  async login(email, password) {
    const result = await request<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setJSON(StorageKeys.AUTH_TOKEN, result.token);
    await setJSON(StorageKeys.AUTH_STUDENT_ID, result.student.id);
    return result;
  },

  async register(input) {
    const result = await request<LoginResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    await setJSON(StorageKeys.AUTH_TOKEN, result.token);
    await setJSON(StorageKeys.AUTH_STUDENT_ID, result.student.id);
    return result;
  },

  getDashboard() {
    return request<DashboardSummary>('/students/me/dashboard');
  },

  getSubjects() {
    return request('/subjects');
  },

  getSessions() {
    return request('/sessions');
  },

  getSession(id) {
    return request(`/sessions/${id}`);
  },

  getWeekends() {
    return request('/weekends');
  },

  getAssessments() {
    return request('/assessments');
  },

  getSubmissions() {
    return request('/students/me/submissions');
  },

  async submitAssessment(assessmentId, payload) {
    // Real upload flow: multipart/form-data with the picked document, so we
    // bypass the JSON `request()` helper here.
    const token = await getJSON<string | null>(StorageKeys.AUTH_TOKEN, null);
    const form = new FormData();
    form.append('file', {
      uri: payload.fileUri,
      name: payload.fileName,
      type: 'application/octet-stream',
    } as any);

    const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/submissions`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // NOTE: do not set Content-Type manually for multipart/form-data —
        // fetch sets the correct boundary automatically.
      },
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
    return res.json();
  },

  getGrades() {
    return request('/students/me/grades');
  },

  getOverallScore() {
    return request('/students/me/grades/overall');
  },

  getInternship() {
    return request('/students/me/internship');
  },

  addInternshipLog(input) {
    return request('/students/me/internship/logs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  getConversations() {
    return request('/messages/conversations');
  },

  sendMessage(facultyId, body) {
    return request(`/messages`, {
      method: 'POST',
      body: JSON.stringify({ recipientId: facultyId, body }),
    });
  },

  getAttendanceHistory() {
    return request('/students/me/attendance');
  },

  getNotifications() {
    return request('/notifications');
  },

  markNotificationRead(id) {
    return request(`/notifications/${id}/read`, { method: 'POST' });
  },

  updateProfile(input) {
    return request('/students/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  registerPushToken(token) {
    // TODO(backend): the LMS/admin panel needs a server-side push-sending
    // service (e.g. a cron/queue worker calling Expo's push API) that reads
    // these stored tokens and sends SESSION_REMINDER / DEADLINE_REMINDER /
    // GRADE_POSTED notifications server-side, in addition to the local
    // on-device scheduled notifications this app already sets up.
    return request('/students/me/push-token', {
      method: 'PUT',
      body: JSON.stringify({ token }),
    });
  },
};

export async function clearAuthSession() {
  await removeKey(StorageKeys.AUTH_TOKEN);
  await removeKey(StorageKeys.AUTH_STUDENT_ID);
}
