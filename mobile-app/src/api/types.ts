import {
  Conversation,
  Grade,
  InternshipLog,
  InternshipRecord,
  Message,
  Notification,
  ProgramInfo,
  Session,
  Student,
  Submission,
  Subject,
  Weekend,
  AssessmentDefinition,
  Attendance,
} from '../types';

export interface LoginResult {
  token: string;
  student: Student;
}

export interface DashboardSummary {
  program: ProgramInfo;
  studentName: string;
  studentIdCode: string;
  hoursCompleted: number;
  hoursTotal: number;
  weeksElapsed: number;
  weeksTotal: number;
  subjectsCompleted: number;
  subjectsTotal: number;
  attendancePercent: number;
  nextSession: Session | null;
  nextDeadline: AssessmentDefinition | null;
  overallScore: number;
}

// The shape every backend implementation (mock or real HTTP) must satisfy.
// Mirrors the REST surface the Next.js/Prisma LMS backend exposes under
// /api/* for entities: Student, Session, Subject, Weekend, Submission,
// Grade, InternshipRecord, InternshipLog, Notification, Message.
export interface Api {
  login(email: string, password: string): Promise<LoginResult>;
  register(input: { name: string; email: string; password: string; phone?: string }): Promise<LoginResult>;

  getDashboard(): Promise<DashboardSummary>;

  getSubjects(): Promise<Subject[]>;
  getSessions(): Promise<Session[]>;
  getSession(id: string): Promise<Session | null>;

  getWeekends(): Promise<Weekend[]>;

  getAssessments(): Promise<AssessmentDefinition[]>;
  getSubmissions(): Promise<Submission[]>;
  submitAssessment(assessmentId: string, payload: { fileUri: string; fileName: string }): Promise<Submission>;

  getGrades(): Promise<Grade[]>;
  getOverallScore(): Promise<{ score: number; breakdown: { label: string; weight: number; score: number | null }[] }>;

  getInternship(): Promise<InternshipRecord>;
  addInternshipLog(input: { date: string; hoursLogged: number; activityDescription: string }): Promise<InternshipLog>;

  getConversations(): Promise<Conversation[]>;
  sendMessage(facultyId: string, body: string): Promise<Message>;

  getAttendanceHistory(): Promise<Attendance[]>;

  getNotifications(): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;

  updateProfile(input: Partial<{ name: string; phone: string; city: string; state: string }>): Promise<Student>;

  registerPushToken(token: string): Promise<void>;
}
