# EM&TL E1 — Faculty Admin Panel

Faculty/admin web app for the **Event Management & Team Leadership E1** diploma
program (420 hours · 24 weeks · 6 subjects · 74 sessions · 3 in-person
weekends). Built with Next.js 14 (App Router, TypeScript), Prisma ORM +
PostgreSQL, Tailwind CSS, and real cookie/JWT session auth with bcrypt-hashed
passwords.

This app and the sibling Student LMS both connect to the **same PostgreSQL
database** using the same canonical `prisma/schema.prisma` (copied verbatim
from `/home/claude/em_e1_platform/shared/prisma/schema.prisma`, plus one
sandbox-only generator tweak — see "What's stubbed" below).

## Features

- **Auth** — faculty/admin login, bcrypt password hashes, JWT session cookie
  (via `jose`, edge-compatible), route-protected via `middleware.ts`.
- **Dashboard** — assigned sessions this week/today, pending-to-grade count,
  active student count, quick "take attendance" shortcuts, recent
  announcements.
- **Session Management** — all 74 sessions, filterable by subject/status;
  per-session detail page to set the meeting link, mark status
  (upcoming/live/completed/cancelled), upload notes/slides/recording URLs
  (`Material` model), and a bulk attendance-taking checklist
  (present/absent/late/excused) writing to `Attendance`.
- **Assessment Management** — 6 weekly assignments, 8 case studies, the
  capstone project, and the internship report, each with a rubric (stored as
  JSON) rendered in the UI; a grading modal (score + written feedback) that
  writes to `Submission` + `Grade`, with an "ungraded first" sort toggle.
- **Student Management** — searchable/filterable roster (name, ID, email,
  batch, status); a full student profile page with attendance %, weighted
  grade breakdown, submission history, and internship progress.
- **Reports** — attendance report (subject + date range → table, Excel, PDF)
  and grades report (program-wide or per-subject, per-student, weighted per
  the program's assessment weightages — 20% assignments / 20% case studies /
  20% internship / 25% capstone / 10% participation / 5% final evaluation) —
  both exportable to real `.xlsx` (via `exceljs`) and `.pdf`
  (via `@react-pdf/renderer`) files.
- **Communication** — direct messaging to students (`Message` model, inbox +
  compose) and a broadcast announcement tool that creates a `Notification`
  for every (or one batch of) active student at once.

## Tech stack

Next.js 14 (App Router) · TypeScript · Prisma ORM · PostgreSQL · Tailwind CSS
· `bcryptjs` · `jose` (JWT) · `exceljs` · `@react-pdf/renderer` · `date-fns`

## Setup

```bash
cd admin-panel
npm install                 # also runs `prisma generate` via postinstall
```

### Environment variables (`.env`)

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/em_e1_admin?schema=public"
JWT_SECRET="a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

See `.env.example`. A local Postgres instance and database are required —
this repo's dev database was created with:

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE em_e1_admin;"
```

### Apply the schema and seed data

```bash
npm run prisma:migrate      # applies prisma/init.sql (see note below)
npm run prisma:seed         # seeds subjects, faculty, 74 sessions, weekends,
                             # assessments, 10 demo students, attendance,
                             # submissions/grades, internship records, messages
```

### Run

```bash
npm run dev      # http://localhost:3000
# or
npm run build && npm run start
```

## Demo credentials

**Faculty / admin (password for all: `Faculty@2026`)**

| Subject | Name | Email |
|---|---|---|
| E1-S1 Foundations of Event Management & Leadership | Priya Nair | priya.nair@em-e1.edu |
| E1-S2 Event Planning & Budgeting | Arjun Mehta | arjun.mehta@em-e1.edu |
| E1-S3 Marketing & Branding for Events | Sana Kapoor | sana.kapoor@em-e1.edu |
| E1-S4 Event Production, Operations & Logistics | Rohan Deshmukh | rohan.deshmukh@em-e1.edu |
| E1-S5 Team Leadership & Digital Events | Ananya Iyer | ananya.iyer@em-e1.edu |
| E1-S6 Business, Entrepreneurship & Career Development | Vikram Rao | vikram.rao@em-e1.edu |
| Program Admin (sees all subjects) | Dr. Kavita Rao | admin@em-e1.edu |

**Students** (password for all: `Student@2026`, 10 demo students E1-001…E1-010
— for reference; students log in through the sibling LMS app, not this one).

The full credential list is also printed at the end of `npm run prisma:seed`.

## What's stubbed / needs real infra before production

- **Sandbox-only Prisma engine workaround** — this development sandbox's
  network egress policy blocks `binaries.prisma.sh`, so the Prisma CLI cannot
  download its native query-engine/schema-engine binaries. To make
  `npm install` / `npm run build` actually work here, the generator in
  `prisma/schema.prisma` uses `engineType = "client"` (a Rust-free client that
  runs on the WASM query compiler already bundled inside `@prisma/client`,
  connected via `@prisma/adapter-pg` + a plain `pg` `Pool` — see
  `lib/prisma.ts`), two empty placeholder files are created at the expected
  engine paths by `scripts/prepare-engine-stubs.js` (wired into
  `postinstall`) purely so the CLI's existence check passes, and
  `prisma/init.sql` (applied by `npm run prisma:migrate` via `psql`,
  see `scripts/apply-schema.sh`) stands in for `prisma migrate dev`, whose
  schema-engine binary is one of the things that can't be downloaded here.
  **In any environment where `binaries.prisma.sh` is reachable**, delete the
  two `PRISMA_QUERY_ENGINE_LIBRARY` / `PRISMA_SCHEMA_ENGINE_BINARY` lines from
  `.env`, drop the `engineType = "client"` line from the generator block (plain
  `prisma-client-js` is fine), and use `prisma migrate dev --name init` as
  normal — `prisma/schema.prisma` is the real source of truth and
  `prisma/init.sql` was hand-derived from it 1:1 for this sandbox only.
- **Email provider** — announcements/messages/grade notifications only ever
  write `Notification`/`Message` rows to the database; nothing sends an actual
  email or push notification. Wire up something like Postmark/SendGrid/SES.
- **Cloud file storage** — `Material.url`, `Submission.fileUrl`, session
  slides/notes/recording links, and internship report/evaluation URLs are all
  plain string fields. There is no real file upload — the UI accepts a URL
  you paste in (seed data points at placeholder `https://drive.example.com/...`
  and `https://recordings.example.com/...` links). Wire up S3/GCS/Cloudinary
  and a real upload flow before production.
- **Zoom/Google Meet integration** — `Session.meetingLink` is a free-text URL
  field with no calendar or video-conferencing API wired up (no auto-created
  meetings, no attendance-from-Zoom sync).
- **Certificate generation** — the `Certificate` model exists and is
  seed-populated as "not issued," but there's no PDF certificate generator or
  admin UI to issue one yet (the attendance/grades PDF exporters in
  `lib/pdf/` could be extended for this).
- **Rate limiting / audit logging / 2FA** — not implemented; add before any
  real deployment.

## Project structure

```
admin-panel/
├── app/
│   ├── login/                     # public login page
│   ├── (app)/                     # everything behind middleware auth
│   │   ├── dashboard/
│   │   ├── sessions/[id]/         # edit form, materials, attendance grid
│   │   ├── assessments/[id]/      # rubric + grading modal
│   │   ├── students/[id]/         # profile, grade breakdown, internship
│   │   ├── reports/attendance/    # reports/grades/
│   │   ├── messages/
│   │   └── announcements/
│   └── api/                       # auth, sessions, submissions, messages,
│                                   # announcements, report exports
├── components/Sidebar.tsx
├── lib/                           # prisma client, auth, grade weighting,
│   └── pdf/                       # @react-pdf/renderer report templates
├── prisma/
│   ├── schema.prisma               # copied from shared/prisma/schema.prisma
│   ├── init.sql                    # sandbox-only DDL (see note above)
│   └── seed.ts
└── scripts/                        # engine-stub + schema-apply helpers
```
