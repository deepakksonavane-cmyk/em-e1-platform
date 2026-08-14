-- ============================================================================
-- EM&LP E1 Platform — Hand-authored SQL DDL mirroring prisma/schema.prisma
--
-- WHY THIS FILE EXISTS: `prisma generate` / `prisma migrate` / `prisma db push`
-- all require downloading a native "schema-engine" binary from
-- binaries.prisma.sh at runtime (true across every Prisma major version,
-- 4.x through 7.x — verified). In this sandboxed build environment that host
-- is blocked by outbound network policy (403 on every CONNECT), so the
-- Prisma CLI cannot run at all, in any version.
--
-- Workaround used in this app: prisma/schema.prisma remains the CANONICAL,
-- unmodified source of truth for the data model (shared with the Faculty
-- Admin Panel). This file is a manually-maintained, field-for-field SQL
-- translation of that schema, applied directly with psql. Application code
-- talks to Postgres via `pg` (node-postgres) with hand-written TypeScript
-- types in lib/types.ts that mirror the Prisma models exactly.
--
-- Once network access to binaries.prisma.sh is available (e.g. in a normal
-- deployment), the standard flow works unmodified:
--   npx prisma generate && npx prisma db push && npx prisma db seed
-- and lib/db.ts can be swapped for a real `PrismaClient`.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('STUDENT', 'FACULTY', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StudentStatus" AS ENUM ('APPLIED', 'REGISTERED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'WITHDRAWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'LATE', 'GRADED', 'RETURNED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AssessmentType" AS ENUM ('ASSIGNMENT', 'CASE_STUDY', 'CAPSTONE', 'INTERNSHIP_REPORT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('SESSION_REMINDER', 'DEADLINE_REMINDER', 'GRADE_POSTED', 'ANNOUNCEMENT', 'ATTENDANCE', 'GENERAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  role          "Role" NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT,
  "avatarUrl"   TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Faculty" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "facultyId"     TEXT UNIQUE NOT NULL,
  "userId"        TEXT UNIQUE NOT NULL REFERENCES "User"(id),
  specialization  TEXT,
  bio             TEXT,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Student" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId"   TEXT UNIQUE NOT NULL,
  "userId"      TEXT UNIQUE NOT NULL REFERENCES "User"(id),
  batch         TEXT NOT NULL DEFAULT 'Batch A',
  city          TEXT,
  state         TEXT,
  "registrationDate" TIMESTAMP NOT NULL DEFAULT now(),
  status        "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
  "emergencyContactName" TEXT,
  "emergencyContactPhone" TEXT,
  "emergencyContactRelation" TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- PROGRAM STRUCTURE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Subject" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  "lecturerId"  TEXT REFERENCES "Faculty"(id),
  "totalSessions" INTEGER NOT NULL,
  "totalHours"    INTEGER NOT NULL,
  "weeksLabel"    TEXT NOT NULL,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Session" (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionNumber" INTEGER UNIQUE NOT NULL,
  code           TEXT UNIQUE NOT NULL,
  week           INTEGER NOT NULL,
  day            TEXT NOT NULL,
  module         TEXT NOT NULL,
  "moduleName"   TEXT NOT NULL,
  topic          TEXT NOT NULL,
  hours          INTEGER NOT NULL DEFAULT 2,
  "keyTopics"    TEXT[] NOT NULL DEFAULT '{}',
  "teachingMethod" TEXT NOT NULL,
  "assessmentNote" TEXT,
  resources      TEXT,
  "scheduledDate" TIMESTAMP,
  "startTime"    TEXT,
  "endTime"      TEXT,
  "meetingLink"  TEXT,
  "recordingUrl" TEXT,
  "notesUrl"     TEXT,
  "slidesUrl"    TEXT,
  status         TEXT NOT NULL DEFAULT 'upcoming',
  "subjectId"    TEXT NOT NULL REFERENCES "Subject"(id),
  "facultyId"    TEXT REFERENCES "Faculty"(id),
  "createdAt"    TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Material" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId"   TEXT NOT NULL REFERENCES "Session"(id),
  title         TEXT NOT NULL,
  type          TEXT NOT NULL,
  url           TEXT NOT NULL,
  "uploadedById" TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Weekend" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  week        INTEGER NOT NULL,
  focus       TEXT NOT NULL,
  "totalHours" INTEGER NOT NULL,
  activities  TEXT[] NOT NULL DEFAULT '{}',
  "venueName"    TEXT,
  "venueAddress" TEXT,
  "venueMapUrl"  TEXT,
  "startDate" TIMESTAMP,
  "endDate"   TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Attendance" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT NOT NULL REFERENCES "Student"(id),
  "sessionId" TEXT NOT NULL REFERENCES "Session"(id),
  status      "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
  "markedAt"  TIMESTAMP NOT NULL DEFAULT now(),
  "markedById" TEXT,
  notes       TEXT,
  UNIQUE ("studentId", "sessionId")
);

CREATE TABLE IF NOT EXISTS "WeekendAttendance" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT NOT NULL REFERENCES "Student"(id),
  "weekendId" TEXT NOT NULL REFERENCES "Weekend"(id),
  "fridayPresent"   BOOLEAN NOT NULL DEFAULT false,
  "saturdayPresent" BOOLEAN NOT NULL DEFAULT false,
  "sundayPresent"   BOOLEAN NOT NULL DEFAULT false,
  notes       TEXT,
  UNIQUE ("studentId", "weekendId")
);

-- ---------------------------------------------------------------------------
-- ASSESSMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssessmentDefinition" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type         "AssessmentType" NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  guidelines   TEXT,
  "subjectCode" TEXT,
  "maxScore"   INTEGER NOT NULL DEFAULT 100,
  "weightagePercent" DOUBLE PRECISION NOT NULL,
  "dueOffsetWeek" INTEGER,
  rubric       JSONB,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Submission" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId"  TEXT NOT NULL REFERENCES "Student"(id),
  "assessmentId" TEXT NOT NULL REFERENCES "AssessmentDefinition"(id),
  "fileUrl"    TEXT,
  "textContent" TEXT,
  status       "SubmissionStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
  "submittedAt" TIMESTAMP,
  score        DOUBLE PRECISION,
  feedback     TEXT,
  "gradedById" TEXT REFERENCES "Faculty"(id),
  "gradedAt"   TIMESTAMP,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE ("studentId", "assessmentId")
);

CREATE TABLE IF NOT EXISTS "Grade" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId"  TEXT NOT NULL REFERENCES "Student"(id),
  "submissionId" TEXT UNIQUE REFERENCES "Submission"(id),
  category     TEXT NOT NULL,
  score        DOUBLE PRECISION NOT NULL,
  "maxScore"   DOUBLE PRECISION NOT NULL DEFAULT 100,
  "letterGrade" TEXT,
  comments     TEXT,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- INTERNSHIP
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "InternshipRecord" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId"   TEXT UNIQUE NOT NULL REFERENCES "Student"(id),
  organization  TEXT,
  "supervisorName" TEXT,
  "supervisorEmail" TEXT,
  "supervisorPhone" TEXT,
  "startDate"   TIMESTAMP,
  "endDate"     TIMESTAMP,
  "requiredHours" INTEGER NOT NULL DEFAULT 30,
  "loggedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'not_started',
  "reportUrl"   TEXT,
  "supervisorEvaluationUrl" TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "InternshipLog" (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "internshipId" TEXT NOT NULL REFERENCES "InternshipRecord"(id),
  date           TIMESTAMP NOT NULL,
  "hoursLogged"  DOUBLE PRECISION NOT NULL,
  "activityDescription" TEXT NOT NULL,
  "createdAt"    TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- CERTIFICATE / COMMS / APPLICATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Certificate" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId"   TEXT UNIQUE NOT NULL REFERENCES "Student"(id),
  issued        BOOLEAN NOT NULL DEFAULT false,
  "issueDate"   TIMESTAMP,
  "certificateNo" TEXT UNIQUE,
  "fileUrl"     TEXT
);

CREATE TABLE IF NOT EXISTS "Message" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "senderId"   TEXT NOT NULL REFERENCES "User"(id),
  "recipientId" TEXT NOT NULL REFERENCES "User"(id),
  subject      TEXT,
  body         TEXT NOT NULL,
  "isRead"     BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Notification" (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"   TEXT NOT NULL REFERENCES "User"(id),
  type       "NotificationType" NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  "isRead"   BOOLEAN NOT NULL DEFAULT false,
  link       TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Application" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT UNIQUE REFERENCES "Student"(id),
  "fullName"  TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  dob         TIMESTAMP,
  gender      TEXT,
  city        TEXT,
  state       TEXT,
  "pinCode"   TEXT,
  "highestQualification" TEXT,
  "workExperience" TEXT,
  "motivationStatement" TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_subject ON "Session"("subjectId");
CREATE INDEX IF NOT EXISTS idx_attendance_student ON "Attendance"("studentId");
CREATE INDEX IF NOT EXISTS idx_submission_student ON "Submission"("studentId");
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS idx_message_recipient ON "Message"("recipientId");
