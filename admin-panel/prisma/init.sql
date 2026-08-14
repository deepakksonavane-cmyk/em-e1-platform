-- ============================================================================
-- EM&TL E1 Faculty Admin Panel — hand-authored DDL matching prisma/schema.prisma
-- exactly (table/column names, types, constraints).
--
-- WHY THIS FILE EXISTS: this sandbox's network egress policy blocks
-- binaries.prisma.sh, so the Prisma "schema-engine" binary that normally
-- powers `prisma migrate dev` / `prisma db push` cannot be downloaded (see
-- README.md "What's stubbed" section). This file is the migration in its
-- place, applied directly with `psql`. In any environment where
-- binaries.prisma.sh is reachable, delete this file and use
-- `prisma migrate dev --name init` instead — the Prisma schema is the single
-- source of truth and this SQL is derived from it 1:1.
-- ============================================================================

CREATE TYPE "Role" AS ENUM ('STUDENT', 'FACULTY', 'ADMIN');
CREATE TYPE "StudentStatus" AS ENUM ('APPLIED', 'REGISTERED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'WITHDRAWN');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'LATE', 'GRADED', 'RETURNED');
CREATE TYPE "AssessmentType" AS ENUM ('ASSIGNMENT', 'CASE_STUDY', 'CAPSTONE', 'INTERNSHIP_REPORT');
CREATE TYPE "NotificationType" AS ENUM ('SESSION_REMINDER', 'DEADLINE_REMINDER', 'GRADE_POSTED', 'ANNOUNCEMENT', 'ATTENDANCE', 'GENERAL');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "avatarUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Faculty" (
  "id" TEXT PRIMARY KEY,
  "facultyId" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id"),
  "specialization" TEXT,
  "bio" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Subject" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "lecturerId" TEXT REFERENCES "Faculty"("id"),
  "totalSessions" INTEGER NOT NULL,
  "totalHours" INTEGER NOT NULL,
  "weeksLabel" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "sessionNumber" INTEGER NOT NULL UNIQUE,
  "code" TEXT NOT NULL UNIQUE,
  "week" INTEGER NOT NULL,
  "day" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "moduleName" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "hours" INTEGER NOT NULL DEFAULT 2,
  "keyTopics" TEXT[] NOT NULL,
  "teachingMethod" TEXT NOT NULL,
  "assessmentNote" TEXT,
  "resources" TEXT,
  "scheduledDate" TIMESTAMP(3),
  "startTime" TEXT,
  "endTime" TEXT,
  "meetingLink" TEXT,
  "recordingUrl" TEXT,
  "notesUrl" TEXT,
  "slidesUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'upcoming',
  "subjectId" TEXT NOT NULL REFERENCES "Subject"("id"),
  "facultyId" TEXT REFERENCES "Faculty"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Material" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "Session"("id"),
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "uploadedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Weekend" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "week" INTEGER NOT NULL,
  "focus" TEXT NOT NULL,
  "totalHours" INTEGER NOT NULL,
  "activities" TEXT[] NOT NULL,
  "venueName" TEXT,
  "venueAddress" TEXT,
  "venueMapUrl" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Student" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id"),
  "batch" TEXT NOT NULL DEFAULT 'Batch A',
  "city" TEXT,
  "state" TEXT,
  "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
  "emergencyContactName" TEXT,
  "emergencyContactPhone" TEXT,
  "emergencyContactRelation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Attendance" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "Student"("id"),
  "sessionId" TEXT NOT NULL REFERENCES "Session"("id"),
  "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
  "markedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "markedById" TEXT,
  "notes" TEXT,
  UNIQUE ("studentId", "sessionId")
);

CREATE TABLE "WeekendAttendance" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "Student"("id"),
  "weekendId" TEXT NOT NULL REFERENCES "Weekend"("id"),
  "fridayPresent" BOOLEAN NOT NULL DEFAULT false,
  "saturdayPresent" BOOLEAN NOT NULL DEFAULT false,
  "sundayPresent" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  UNIQUE ("studentId", "weekendId")
);

CREATE TABLE "AssessmentDefinition" (
  "id" TEXT PRIMARY KEY,
  "type" "AssessmentType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "guidelines" TEXT,
  "subjectCode" TEXT,
  "maxScore" INTEGER NOT NULL DEFAULT 100,
  "weightagePercent" DOUBLE PRECISION NOT NULL,
  "dueOffsetWeek" INTEGER,
  "rubric" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Submission" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "Student"("id"),
  "assessmentId" TEXT NOT NULL REFERENCES "AssessmentDefinition"("id"),
  "fileUrl" TEXT,
  "textContent" TEXT,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
  "submittedAt" TIMESTAMP(3),
  "score" DOUBLE PRECISION,
  "feedback" TEXT,
  "gradedById" TEXT REFERENCES "Faculty"("id"),
  "gradedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  UNIQUE ("studentId", "assessmentId")
);

CREATE TABLE "Grade" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "Student"("id"),
  "submissionId" TEXT UNIQUE REFERENCES "Submission"("id"),
  "category" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "letterGrade" TEXT,
  "comments" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "InternshipRecord" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL UNIQUE REFERENCES "Student"("id"),
  "organization" TEXT,
  "supervisorName" TEXT,
  "supervisorEmail" TEXT,
  "supervisorPhone" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "requiredHours" INTEGER NOT NULL DEFAULT 30,
  "loggedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'not_started',
  "reportUrl" TEXT,
  "supervisorEvaluationUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "InternshipLog" (
  "id" TEXT PRIMARY KEY,
  "internshipId" TEXT NOT NULL REFERENCES "InternshipRecord"("id"),
  "date" TIMESTAMP(3) NOT NULL,
  "hoursLogged" DOUBLE PRECISION NOT NULL,
  "activityDescription" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Certificate" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL UNIQUE REFERENCES "Student"("id"),
  "issued" BOOLEAN NOT NULL DEFAULT false,
  "issueDate" TIMESTAMP(3),
  "certificateNo" TEXT UNIQUE,
  "fileUrl" TEXT
);

CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL REFERENCES "User"("id"),
  "recipientId" TEXT NOT NULL REFERENCES "User"("id"),
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "link" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "Application" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT UNIQUE REFERENCES "Student"("id"),
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "dob" TIMESTAMP(3),
  "gender" TEXT,
  "city" TEXT,
  "state" TEXT,
  "pinCode" TEXT,
  "highestQualification" TEXT,
  "workExperience" TEXT,
  "motivationStatement" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE INDEX "Session_subjectId_idx" ON "Session"("subjectId");
CREATE INDEX "Session_facultyId_idx" ON "Session"("facultyId");
CREATE INDEX "Attendance_sessionId_idx" ON "Attendance"("sessionId");
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");
CREATE INDEX "Submission_assessmentId_idx" ON "Submission"("assessmentId");
CREATE INDEX "Submission_studentId_idx" ON "Submission"("studentId");
CREATE INDEX "Grade_studentId_idx" ON "Grade"("studentId");
CREATE INDEX "Message_recipientId_idx" ON "Message"("recipientId");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
