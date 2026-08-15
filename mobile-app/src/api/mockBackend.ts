// Mock backend: serves the app entirely from the bundled seed-data.json
// (via src/data/mockData.ts) plus a small amount of locally-persisted state
// (AsyncStorage) so that submitting an assignment, logging internship hours,
// or sending a faculty message "sticks" across app restarts even with no
// live LMS backend. This lets the app demo standalone.

import {
  ASSESSMENT_DEFINITIONS,
  DEMO_ACCOUNTS,
  PROGRAM,
  SESSIONS,
  SUBJECTS,
  WEEKENDS,
  attendancePercent,
  generateAttendance,
  generateConversations,
  generateGrades,
  generateInternship,
  generateNotifications,
  generateSubmissions,
  overallWeightedScore,
} from '../data/mockData';
import { InternshipLog, Message, Submission } from '../types';
import { getJSON, setJSON, StorageKeys } from '../utils/storage';
import { isPast, mondayOfWeek } from '../utils/dates';
import { Api, DashboardSummary, LoginResult } from './types';

let currentStudentId: string | null = null;

async function requireStudentId(): Promise<string> {
  if (currentStudentId) return currentStudentId;
  const stored = await getJSON<string | null>(StorageKeys.AUTH_STUDENT_ID, null);
  if (stored) {
    currentStudentId = stored;
    return stored;
  }
  throw new Error('Not authenticated');
}

function findAccountByStudentId(studentId: string) {
  const account = DEMO_ACCOUNTS.find((a) => a.student.id === studentId);
  if (!account) throw new Error('Unknown demo account');
  return account;
}

// --- locally persisted mutable overlays ------------------------------------

async function loadExtraSubmissions(): Promise<Record<string, Submission>> {
  return getJSON(StorageKeys.MOCK_SUBMISSIONS, {} as Record<string, Submission>);
}
async function saveExtraSubmissions(map: Record<string, Submission>) {
  await setJSON(StorageKeys.MOCK_SUBMISSIONS, map);
}

async function loadExtraLogs(): Promise<Record<string, InternshipLog[]>> {
  return getJSON(StorageKeys.MOCK_INTERNSHIP_LOGS, {} as Record<string, InternshipLog[]>);
}
async function saveExtraLogs(map: Record<string, InternshipLog[]>) {
  await setJSON(StorageKeys.MOCK_INTERNSHIP_LOGS, map);
}

async function loadExtraMessages(): Promise<Record<string, Message[]>> {
  return getJSON(StorageKeys.MOCK_MESSAGES, {} as Record<string, Message[]>);
}
async function saveExtraMessages(map: Record<string, Message[]>) {
  await setJSON(StorageKeys.MOCK_MESSAGES, map);
}

async function loadReadNotifications(): Promise<string[]> {
  return getJSON(StorageKeys.MOCK_NOTIFICATIONS_READ, [] as string[]);
}
async function saveReadNotifications(ids: string[]) {
  await setJSON(StorageKeys.MOCK_NOTIFICATIONS_READ, ids);
}

export const mockApi: Api = {
  async login(email, password) {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.credentials.email.toLowerCase() === email.trim().toLowerCase() && a.credentials.password === password
    );
    if (!account) {
      throw new Error(
        'Invalid credentials. Try demo account priya.sharma@student.emleadership.edu / Student@123'
      );
    }
    currentStudentId = account.student.id;
    await setJSON(StorageKeys.AUTH_STUDENT_ID, account.student.id);
    return { token: `mock-token-${account.student.id}`, student: account.student };
  },

  async register(input) {
    // Mock signup: simulate creating a new student mapped onto demo account 1's
    // data shape so every other screen still has content to show.
    const base = DEMO_ACCOUNTS[0];
    const student = {
      ...base.student,
      id: `student-new-${Date.now()}`,
      studentId: `E1-${Math.floor(100 + Math.random() * 800)}`,
      user: { ...base.user, name: input.name, email: input.email, phone: input.phone ?? null },
    };
    currentStudentId = student.id;
    await setJSON(StorageKeys.AUTH_STUDENT_ID, student.id);
    // Register this synthetic id against DEMO_ACCOUNTS in-memory so
    // requireStudentId()/findAccountByStudentId() keep working this session.
    DEMO_ACCOUNTS.push({ credentials: { email: input.email, password: input.password }, user: student.user, student });
    return { token: `mock-token-${student.id}`, student };
  },

  async getDashboard(): Promise<DashboardSummary> {
    const studentId = await requireStudentId();
    const account = findAccountByStudentId(studentId);

    const completedSessions = SESSIONS.filter((s) => s.status === 'completed');
    const hoursCompleted = completedSessions.reduce((sum, s) => sum + s.hours, 0);
    const hoursTotal = PROGRAM.totalHours;

    const currentWeek = Math.max(
      1,
      Math.min(PROGRAM.durationWeeks, Math.floor((Date.now() - mondayOfWeek(1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1)
    );

    const subjectsCompleted = SUBJECTS.filter((subj) => {
      const subjSessions = SESSIONS.filter((s) => s.subjectCode === subj.code);
      return subjSessions.length > 0 && subjSessions.every((s) => s.status === 'completed');
    }).length;

    const nextSession = SESSIONS.find((s) => s.status === 'upcoming') ?? null;

    const submissions = await mockApi.getSubmissions();
    const nextDeadline =
      ASSESSMENT_DEFINITIONS.filter((d) => {
        if (isPast(new Date(d.dueDate))) return false;
        const sub = submissions.find((s) => s.assessmentId === d.id);
        return !sub || sub.status === 'NOT_SUBMITTED';
      }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] ?? null;

    const { score } = await mockApi.getOverallScore();

    return {
      program: PROGRAM,
      studentName: account.user.name,
      studentIdCode: account.student.studentId,
      hoursCompleted,
      hoursTotal,
      weeksElapsed: Math.min(currentWeek, PROGRAM.durationWeeks),
      weeksTotal: PROGRAM.durationWeeks,
      subjectsCompleted,
      subjectsTotal: PROGRAM.totalSubjects,
      attendancePercent: attendancePercent(studentId),
      nextSession,
      nextDeadline,
      overallScore: score,
    };
  },

  async getSubjects() {
    return SUBJECTS;
  },

  async getSessions() {
    return SESSIONS;
  },

  async getSession(id) {
    return SESSIONS.find((s) => s.id === id) ?? null;
  },

  async getWeekends() {
    return WEEKENDS;
  },

  async getAssessments() {
    return ASSESSMENT_DEFINITIONS;
  },

  async getSubmissions() {
    const studentId = await requireStudentId();
    const generated = generateSubmissions(studentId);
    const overlay = await loadExtraSubmissions();
    return generated.map((s) => overlay[s.id] ?? s);
  },

  async submitAssessment(assessmentId, payload) {
    const studentId = await requireStudentId();
    const def = ASSESSMENT_DEFINITIONS.find((d) => d.id === assessmentId);
    if (!def) throw new Error('Unknown assessment');
    const submittedAt = new Date().toISOString();
    const overdue = isPast(new Date(def.dueDate));
    const submission: Submission = {
      id: `sub-${studentId}-${assessmentId}`,
      studentId,
      assessmentId,
      assessment: def,
      fileUrl: payload.fileUri,
      fileName: payload.fileName,
      status: overdue ? 'LATE' : 'SUBMITTED',
      submittedAt,
      score: null,
      feedback: null,
      gradedAt: null,
    };
    const overlay = await loadExtraSubmissions();
    overlay[submission.id] = submission;
    await saveExtraSubmissions(overlay);
    return submission;
  },

  async getGrades() {
    const studentId = await requireStudentId();
    return generateGrades(studentId);
  },

  async getOverallScore() {
    const studentId = await requireStudentId();
    return overallWeightedScore(studentId);
  },

  async getInternship() {
    const studentId = await requireStudentId();
    const record = generateInternship(studentId);
    const overlay = await loadExtraLogs();
    const extra = overlay[studentId] ?? [];
    const logs = [...extra, ...record.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const loggedHours = Math.round(logs.reduce((sum, l) => sum + l.hoursLogged, 0) * 10) / 10;
    return {
      ...record,
      logs,
      loggedHours,
      status: loggedHours >= record.requiredHours ? 'submitted' : loggedHours > 0 ? 'in_progress' : record.status,
    };
  },

  async addInternshipLog(input) {
    const studentId = await requireStudentId();
    const log: InternshipLog = {
      id: `log-manual-${Date.now()}`,
      internshipId: `internship-${studentId}`,
      date: input.date,
      hoursLogged: input.hoursLogged,
      activityDescription: input.activityDescription,
      createdAt: new Date().toISOString(),
    };
    const overlay = await loadExtraLogs();
    overlay[studentId] = [log, ...(overlay[studentId] ?? [])];
    await saveExtraLogs(overlay);
    return log;
  },

  async getConversations() {
    const studentId = await requireStudentId();
    const generated = generateConversations(studentId);
    const overlay = await loadExtraMessages();
    return generated.map((c) => {
      const extra = overlay[c.facultyId] ?? [];
      if (extra.length === 0) return c;
      const messages = [...c.messages, ...extra];
      return { ...c, messages, lastMessage: messages[messages.length - 1] };
    });
  },

  async sendMessage(facultyId, body) {
    const studentId = await requireStudentId();
    const message: Message = {
      id: `msg-manual-${Date.now()}`,
      senderId: studentId,
      senderName: 'You',
      recipientId: facultyId,
      recipientName: facultyId,
      subject: null,
      body,
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    const overlay = await loadExtraMessages();
    overlay[facultyId] = [...(overlay[facultyId] ?? []), message];
    await saveExtraMessages(overlay);
    return message;
  },

  async getAttendanceHistory() {
    const studentId = await requireStudentId();
    return generateAttendance(studentId);
  },

  async getNotifications() {
    const studentId = await requireStudentId();
    const generated = generateNotifications(studentId);
    const readIds = await loadReadNotifications();
    return generated.map((n) => (readIds.includes(n.id) ? { ...n, isRead: true } : n));
  },

  async markNotificationRead(id) {
    const readIds = await loadReadNotifications();
    if (!readIds.includes(id)) {
      readIds.push(id);
      await saveReadNotifications(readIds);
    }
  },

  async updateProfile(input) {
    const studentId = await requireStudentId();
    const account = findAccountByStudentId(studentId);
    if (input.name) account.user.name = input.name;
    if (input.phone) account.user.phone = input.phone;
    if (input.city) account.student.city = input.city;
    if (input.state) account.student.state = input.state;
    account.student.user = account.user;
    return account.student;
  },

  async registerPushToken(token) {
    // TODO(backend): POST this Expo push token to the LMS backend, e.g.
    // PUT /api/students/me/push-token, so a server-side job can send
    // session-reminder / grade-posted pushes via Expo's push service.
    // In mock mode we just persist it locally for inspection/debugging.
    await setJSON(StorageKeys.PUSH_TOKEN, token);
    console.log('[mock] registerPushToken (would POST to backend):', token);
  },
};
