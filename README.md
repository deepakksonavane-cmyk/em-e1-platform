# Event Management & Team Leadership E1 — Complete Digital Platform

Generated from the real program documents (syllabus, 6-subject/74-session breakdown,
master timetable, student handbook, application/registration forms, faculty schedule, etc.)
Source data lives in `shared/seed-data.json`, derived directly from
`WEEKLY ONLINE SESSIONS TOPICS (BASE).xlsx` and the syllabus/6-subjects docs.

## What's included

| Folder | App | Stack |
|---|---|---|
| `lms/` | Student Portal / LMS | Next.js 14 + TypeScript + Tailwind + PostgreSQL |
| `admin-panel/` | Faculty Admin Panel | Next.js 14 + TypeScript + Tailwind + PostgreSQL (Prisma) |
| `marketing-site/` | Public marketing website + application form | Next.js 14 + TypeScript + Tailwind |
| `mobile-app/` | Student mobile app | Expo (React Native) + TypeScript |
| `shared/` | Canonical Prisma schema + seed-data.json used by all four apps | — |
| `docs_extracted/` | Your original .docx/.xlsx files converted to Markdown/CSV, for reference | — |

Each app folder has its own `README.md` with exact setup steps, environment variables,
demo login credentials, and a "What's stubbed / needs real credentials before production"
section (payment gateway keys, email provider, Zoom/Meet API, cloud file storage, push
notification sending service, app store signing).

## Quick start (all apps)

`node_modules/` and build output were stripped from this archive to keep the download
size reasonable. For each app:

```bash
cd <app-folder>
npm install
```

Then follow that app's own README for env vars and (for lms/admin-panel) database setup.

## Data model

`shared/prisma/schema.prisma` is the single canonical data model for the LMS and Admin
Panel — both are meant to point at the same PostgreSQL database in production. The
Marketing Site and Mobile App also reference `shared/seed-data.json` for real program
content (74 sessions, 6 subjects, 3 weekends, assessment structure) so nothing was
invented — it all traces back to your uploaded documents.

## Honest status

These are real, working, build-verified codebases (each was `npm run build`-tested, or
`tsc --noEmit`-tested for the mobile app) — not visual mockups. They are strong MVP
foundations, not yet production-hardened: several integration points (payments, email,
Zoom/Meet, cloud storage, push notification delivery) are wired with clear interfaces but
need real API credentials, which weren't available in this session. See each app's README
for the specific list.
