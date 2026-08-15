// TypeScript types mirroring shared/prisma/schema.prisma
// Kept in sync with the Student LMS backend's data model so this app is a
// real client for that API (see src/api/client.ts).

export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type StudentStatus =
  | 'APPLIED'
  | 'REGISTERED'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'WITHDRAWN';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type SubmissionStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'LATE'
  | 'GRADED'
  | 'RETURNED';

export type AssessmentType =
  | 'ASSIGNMENT'
  | 'CASE_STUDY'
  | 'CAPSTONE'
  | 'INTERNSHIP_REPORT';

export type NotificationType =
  | 'SESSION_REMINDER'
  | 'DEADLINE_REMINDER'
  | 'GRADE_POSTED'
  | 'ANNOUNCEMENT'
  | 'ATTENDANCE'
  | 'GENERAL';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
}

export interface Student {
  id: string;
  studentId: string; // E1-001
  userId: string;
  user: User;
  batch: string;
  city?: string | null;
  state?: string | null;
  registrationDate: string;
  status: StudentStatus;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
}

export interface Faculty {
  id: string;
  facultyId: string;
  userId: string;
  user: User;
  specialization?: string | null;
  bio?: string | null;
}

export interface Subject {
  id: string;
  code: string; // E1-S1 ... E1-S6
  name: string;
  lecturerId?: string | null;
  lecturerName?: string;
  totalSessions: number;
  totalHours: number;
  weeksLabel: string;
}

export interface Session {
  id: string;
  sessionNumber: number; // 1..74
  code: string; // S01..S74
  week: number;
  day: string;
  module: string;
  moduleName: string;
  topic: string;
  hours: number;
  keyTopics: string[];
  teachingMethod: string;
  assessmentNote?: string | null;
  resources?: string | null;
  scheduledDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  meetingLink?: string | null;
  recordingUrl?: string | null;
  notesUrl?: string | null;
  slidesUrl?: string | null;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  subjectId: string;
  subjectCode: string;
  facultyId?: string | null;
}

export interface Weekend {
  id: string;
  code: string; // W1, W2, W3
  name: string;
  week: number;
  focus: string;
  totalHours: number;
  activities: string[];
  venueName?: string | null;
  venueAddress?: string | null;
  venueMapUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  days: { day: string; hours: number }[];
}

export interface Attendance {
  id: string;
  studentId: string;
  sessionId: string;
  sessionCode: string;
  sessionTopic: string;
  status: AttendanceStatus;
  markedAt: string;
  notes?: string | null;
}

export interface WeekendAttendance {
  id: string;
  studentId: string;
  weekendId: string;
  fridayPresent: boolean;
  saturdayPresent: boolean;
  sundayPresent: boolean;
}

export interface AssessmentDefinition {
  id: string;
  type: AssessmentType;
  title: string;
  description: string;
  guidelines?: string | null;
  subjectCode?: string | null;
  maxScore: number;
  weightagePercent: number;
  dueDate: string; // ISO date
}

export interface Submission {
  id: string;
  studentId: string;
  assessmentId: string;
  assessment: AssessmentDefinition;
  fileUrl?: string | null;
  fileName?: string | null;
  textContent?: string | null;
  status: SubmissionStatus;
  submittedAt?: string | null;
  score?: number | null;
  feedback?: string | null;
  gradedAt?: string | null;
}

export interface Grade {
  id: string;
  studentId: string;
  submissionId?: string | null;
  category: string;
  score: number;
  maxScore: number;
  letterGrade?: string | null;
  comments?: string | null;
  createdAt: string;
}

export interface InternshipLog {
  id: string;
  internshipId: string;
  date: string;
  hoursLogged: number;
  activityDescription: string;
  createdAt: string;
}

export interface InternshipRecord {
  id: string;
  studentId: string;
  organization?: string | null;
  supervisorName?: string | null;
  supervisorEmail?: string | null;
  supervisorPhone?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  requiredHours: number;
  loggedHours: number;
  status: 'not_started' | 'in_progress' | 'submitted' | 'evaluated';
  reportUrl?: string | null;
  logs: InternshipLog[];
}

export interface Certificate {
  id: string;
  studentId: string;
  issued: boolean;
  issueDate?: string | null;
  certificateNo?: string | null;
  fileUrl?: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject?: string | null;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  facultyId: string;
  facultyName: string;
  facultyRole: string;
  subjectCode?: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface ProgramInfo {
  programName: string;
  programCode: string;
  durationWeeks: number;
  durationMonths: number;
  totalHours: number;
  totalSessions: number;
  totalSubjects: number;
  totalLecturers: number;
  mode: string;
  level: string;
  attendancePolicy: string;
  gradingScale: { grade: string; range: string }[];
  keyDates: { event: string; week: number | string }[];
}
