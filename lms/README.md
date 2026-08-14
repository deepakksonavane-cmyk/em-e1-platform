# Event Management & Team Leadership E1 — Student LMS

A real, working Student Learning Management System for the 420-hour, 24-week,
6-subject, 74-session "Event Management & Team Leadership E1" diploma
program. Built with Next.js 14 (App Router, TypeScript), PostgreSQL,
Tailwind CSS, JWT-based auth (bcrypt password hashing), and Server Actions
for all mutations.

## Data model & Prisma

`prisma/schema.prisma` is copied verbatim from the shared canonical schema
(`/home/claude/em_e1_platform/shared/prisma/schema.prisma`) and is the source
of truth for the data model, shared with the Faculty Admin Panel.

**Important caveat — read before you run `npx prisma ...` commands:** in the
sandboxed environment this app was built in, the Prisma CLI could not be
used for `generate` / `db push` / `migrate` / `db seed` in **any** version
(4.x through 7.x were all tried) because every one of those commands
downloads a native "schema-engine" binary from `binaries.prisma.sh` at
runtime, and that host is blocked by outbound network policy (403 on every
CONNECT). This is a network-policy limitation of the build sandbox, not a
code issue.

Workaround used here, fully documented inline:
- `prisma/init.sql` — a hand-written, field-for-field SQL translation of
  `schema.prisma` (tables, enums, constraints, indexes). Applied directly
  with `psql` instead of `prisma db push`.
- `lib/types.ts` — hand-written TypeScript interfaces mirroring every Prisma
  model, in place of the generated Prisma Client types.
- `lib/db.ts` — a thin, typed query layer over `pg` (node-postgres) with a
  connection pool, used everywhere in place of `PrismaClient`.
- `prisma/seed.ts` — seeds the database directly via `pg`, reading the same
  canonical `shared/seed-data.json`, in place of `prisma db seed`.

**In a normal deployment with network access**, the standard Prisma flow
works unmodified — nothing about the schema was changed to make this
workaround possible:
```
npx prisma generate
npx prisma db push
npx prisma db seed   # or: npm run db:seed
```
and `lib/db.ts` can be swapped for a real generated `PrismaClient` without
touching the schema.

## Setup

1. **Postgres**: create a database and user.
   ```sql
   CREATE USER lms_user WITH PASSWORD 'lms_pass' SUPERUSER;
   CREATE DATABASE em_e1_lms OWNER lms_user;
   ```
2. **Environment variables** — copy/edit `.env` (already present with dev
   defaults):
   ```
   DATABASE_URL="postgresql://lms_user:lms_pass@localhost:5432/em_e1_lms?schema=public"
   JWT_SECRET="<random secret — change in production>"
   PROGRAM_START_DATE="2026-06-08"   # Monday the 24-week program timeline is anchored to
   NEXT_PUBLIC_APP_NAME="Event Management & Team Leadership E1 - Student LMS"
   ```
3. **Install dependencies**:
   ```
   npm install
   ```
4. **Apply the schema** (see caveat above — this replaces `prisma db push`):
   ```
   npm run db:apply-schema
   # equivalent to: psql "$DATABASE_URL" -f prisma/init.sql
   ```
5. **Seed the database** (replaces `prisma db seed`):
   ```
   npm run db:seed
   ```
   This seeds all 6 Subjects, 74 Sessions (dates computed from
   `PROGRAM_START_DATE` + week/day), 3 Weekends, 16 AssessmentDefinitions
   (6 assignments, 8 case studies, 1 capstone, 1 internship report), 6
   Faculty accounts, and 5 demo Student accounts with realistic pre-seeded
   attendance, submissions, grades, internship logs, notifications, and
   messages. It prints demo credentials at the end (also listed below).
6. **Run the app**:
   ```
   npm run dev       # http://localhost:3000
   # or
   npm run build && npm run start
   ```

## Demo login credentials

**Students** (role STUDENT), password for all: `Student@123`
| Student ID | Email |
|---|---|
| E1-001 | aarav.sharma@student.em-e1.edu |
| E1-002 | diya.patel@student.em-e1.edu |
| E1-003 | kabir.singh@student.em-e1.edu |
| E1-004 | meera.reddy@student.em-e1.edu |
| E1-005 | ishaan.verma@student.em-e1.edu |

**Faculty** (role FACULTY), password for all: `Faculty@123` — lecturer1@em-e1.edu
… lecturer6@em-e1.edu. Faculty accounts exist so the Messages feature has a
real recipient; logging in as faculty in this app shows a short notice
redirecting them to the (separate) Faculty Admin Panel, since this build is
scoped to the student experience per the project brief.

New students can also self-register at `/register`.

## Features implemented

- **Auth**: email/password registration & login, bcrypt-hashed passwords,
  JWT session cookie (`jose`), route protection via `middleware.ts`.
- **Dashboard**: program progress (hours/weeks/sessions), next 5 upcoming
  sessions, upcoming assessment deadlines, attendance %, grade summary.
- **My Courses**: the 6 subjects with lecturer, session count/hours, and a
  per-subject progress bar.
- **Sessions**: all 74 sessions, filterable by subject/week; detail page
  with topic, key topics, teaching method, assessment note, resources,
  "Join Live Session" button (enabled only inside the scheduled time window,
  otherwise shows a countdown), recording archive, downloadable notes/slides.
- **Assessments**: 6 assignments + 8 case studies with real guidelines,
  file/text submission (persisted to disk, see Stubs below), status
  tracking, grades & feedback once graded. Capstone project has its own page.
- **In-Person Weekends**: 3 weekend cards (Week 1/12/24) with Fri/Sat/Sun
  schedule, venue + live Google Maps embed, travel/accommodation guidance,
  and read-only per-student attendance.
- **Internship**: guidelines (30-hour minimum), logbook CRUD (date/hours/
  activity), running total vs. required hours, report submission, supervisor
  evaluation status.
- **Profile**: edit basic info & emergency contact, change password,
  attendance history table, certificate download (gated on completion
  progress), and a faculty messaging inbox (send/receive via the `Message`
  model).
- **Notifications**: bell with unread badge in the header + full list page,
  mark-as-read.

## What's stubbed / needs real credentials before production

- **Zoom/Meet links** — `meetingLink` is a placeholder Google Meet-style URL
  generated in `prisma/seed.ts`. Wire up real Zoom/Meet API integration to
  generate/store real meeting links.
- **Email sending** — `lib/email.ts` only logs to the server console. It has
  a clearly commented integration point for Nodemailer or Resend; no SMTP
  credentials are configured.
- **File storage** — `lib/upload.ts` saves uploaded files to
  `/public/uploads` on local disk (not faked — files are genuinely written
  and served). Swap for real S3/R2/GCS signed-upload storage before
  production; the TODO is documented inline in that file.
- **Certificate PDF generation** — the `Certificate` model/UI is fully wired
  (issued flag, issue date, file URL, download button gated on completion),
  but no certificate rendering/PDF-generation pipeline is implemented; the
  admin side would set `fileUrl` once a cert is generated.
- **Payment gateway** — not applicable to this program (no paid checkout in
  scope).

## Project structure

```
lms/
  prisma/
    schema.prisma      # canonical data model (unmodified)
    init.sql            # hand-written SQL DDL (workaround, see above)
    seed.ts              # seed script (workaround, see above)
  lib/
    db.ts               # pg pool + typed query helpers
    types.ts             # hand-written types mirroring schema.prisma
    auth.ts               # bcrypt + JWT session helpers
    student.ts             # requireStudent() guard + PROGRAM constants
    actions.ts               # all Server Actions (submissions, internship, messages, profile, notifications)
    email.ts                  # stubbed email sender
    upload.ts                  # local-disk file upload (stubbed cloud storage)
    sessionWindow.ts             # live/upcoming/past session windowing
  app/
    login/, register/            # public auth pages
    api/auth/…                    # login/register/logout route handlers
    faculty-notice/                # shown to FACULTY accounts
    (app)/                          # protected student shell (sidebar + topbar)
      dashboard/, courses/, sessions/, assessments/, weekends/,
      internship/, profile/, notifications/, messages/
  middleware.ts                     # route protection
  components/                        # Sidebar, Card, ProgressBar, StatusBadge
```
