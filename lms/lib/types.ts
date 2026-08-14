// ============================================================================
// Hand-written TypeScript types mirroring prisma/schema.prisma models.
//
// These exist because `prisma generate` cannot run in this sandboxed build
// environment (binaries.prisma.sh — required by the Prisma CLI in every
// version — is blocked by outbound network policy). prisma/schema.prisma
// remains the canonical model definition; these types are kept in lockstep
// with it by hand. See prisma/init.sql for the matching DDL and lib/db.ts
// for the query layer. In a normal deployment, `npx prisma generate` would
// produce these types automatically from the same schema.
// ============================================================================

export type Role = "STUDENT" | "FACULTY" | "ADMIN";
export type StudentStatus =
  | "APPLIED"
  | "REGISTERED"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "WITHDRAWN";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type SubmissionStatus =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "LATE"
  | "GRADED"
  | "RETURNED";
export type AssessmentType =
  | "ASSIGNMENT"
  | "CASE_STUDY"
  | "CAPSTONE"
  | "INTERNSHIP_REPORT";
export type NotificationType =
  | "SESSION_REMINDER"
  | "DEADLINE_REMINDER"
  | "GRADE_POSTED"
  | "ANNOUNCEMENT"
  | "ATTENDANCE"
  | "GENERAL";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Faculty {
  id: string;
  facultyId: string;
  userId: string;
  specialization: string | null;
  bio: string | null;
  createdAt: Date;
}

export interface Student {
  id: string;
  studentId: string;
  userId: string;
  batch: string;
  city: string | null;
  state: string | null;
  registrationDate: Date;
  status: StudentStatus;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  lecturerId: string | null;
  totalSessions: number;
  totalHours: number;
  weeksLabel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  sessionNumber: number;
  code: string;
  week: number;
  day: string;
  module: string;
  moduleName: string;
  topic: string;
  hours: number;
  keyTopics: string[];
  teachingMethod: string;
  assessmentNote: string | null;
  resources: string | null;
  scheduledDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  meetingLink: string | null;
  recordingUrl: string | null;
  notesUrl: string | null;
  slidesUrl: string | null;
  status: string;
  subjectId: string;
  facultyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  sessionId: string;
  title: string;
  type: string;
  url: string;
  uploadedById: string | null;
  createdAt: Date;
}

export interface Weekend {
  id: string;
  code: string;
  name: string;
  week: number;
  focus: string;
  totalHours: number;
  activities: string[];
  venueName: string | null;
  venueAddress: string | null;
  venueMapUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}

export interface Attendance {
  id: string;
  studentId: string;
  sessionId: string;
  status: AttendanceStatus;
  markedAt: Date;
  markedById: string | null;
  notes: string | null;
}

export interface WeekendAttendance {
  id: string;
  studentId: string;
  weekendId: string;
  fridayPresent: boolean;
  saturdayPresent: boolean;
  sundayPresent: boolean;
  notes: string | null;
}

export interface AssessmentDefinition {
  id: string;
  type: AssessmentType;
  title: string;
  description: string;
  guidelines: string | null;
  subjectCode: string | null;
  maxScore: number;
  weightagePercent: number;
  dueOffsetWeek: number | null;
  rubric: unknown;
  createdAt: Date;
}

export interface Submission {
  id: string;
  studentId: string;
  assessmentId: string;
  fileUrl: string | null;
  textContent: string | null;
  status: SubmissionStatus;
  submittedAt: Date | null;
  score: number | null;
  feedback: string | null;
  gradedById: string | null;
  gradedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  submissionId: string | null;
  category: string;
  score: number;
  maxScore: number;
  letterGrade: string | null;
  comments: string | null;
  createdAt: Date;
}

export interface InternshipRecord {
  id: string;
  studentId: string;
  organization: string | null;
  supervisorName: string | null;
  supervisorEmail: string | null;
  supervisorPhone: string | null;
  startDate: Date | null;
  endDate: Date | null;
  requiredHours: number;
  loggedHours: number;
  status: string;
  reportUrl: string | null;
  supervisorEvaluationUrl: string | null;
  createdAt: Date;
}

export interface InternshipLog {
  id: string;
  internshipId: string;
  date: Date;
  hoursLogged: number;
  activityDescription: string;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  studentId: string;
  issued: boolean;
  issueDate: Date | null;
  certificateNo: string | null;
  fileUrl: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string | null;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}

export interface Application {
  id: string;
  studentId: string | null;
  fullName: string;
  email: string;
  phone: string;
  dob: Date | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  highestQualification: string | null;
  workExperience: string | null;
  motivationStatement: string | null;
  status: string;
  createdAt: Date;
}
