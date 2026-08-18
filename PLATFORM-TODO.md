# EMLP E1 — Whole-Platform Status & To-Do

Last updated: 2026-08-18. This sits at the `LMS/` root because it covers all
four sub-projects, not just the marketing site (see
`marketing-site/PROJECT-TODO.md` for that app's own list).

## Big finding worth knowing

This is **not** just a marketing site with three empty folders next to it.
`admin-panel`, `lms`, and `mobile-app` are already substantially built —
real login, dashboards, grading, attendance, messaging, internship
logbooks, reports, and more. They are not connected to real
infrastructure yet (no live database, no real email/file storage/Zoom),
so nobody can actually sign in and use them today — which is exactly what
your friend noticed when he said the site "doesn't seem operational."
The operational app *exists in code* — it just isn't deployed or wired to
real services yet. That's the actual gap, not a missing app.

---

## The four sub-projects

| App | What it is | Status |
|---|---|---|
| `marketing-site` | Public brochure site (curriculum, fees, apply, FAQ) | **Live** on Netlify at emlp-e1.netlify.app |
| `admin-panel` | Faculty/admin web app — sessions, grading, attendance, reports, messaging | Built, not deployed, not connected to a real database |
| `lms` | Student web app — dashboard, courses, sessions, assessments, internship logbook, profile | Built, not deployed, not connected to a real database |
| `mobile-app` | Expo/React Native companion app for students | Built, currently running in demo/mock-data mode only |

`admin-panel` and `lms` share one canonical database schema
(`shared/prisma/schema.prisma`) — they're meant to point at the *same*
Postgres database so faculty and students see the same live data.

---

## 🔴 Critical — needed before any of the operational apps can go live

- [ ] **Provision a real production Postgres database** for `admin-panel`
      + `lms` to share. (You already have a Neon Postgres account from the
      marketing-site setup — likely simplest to add a second database on
      that same Neon project rather than open a new provider account.)
- [ ] **Deploy `admin-panel` and `lms` somewhere that runs a real Node
      server** — Netlify (used for marketing-site) is fine for static/edge
      sites but these two apps use Prisma + Server Actions + a Postgres
      connection, which needs a proper Node host: Vercel, Railway, or
      Render are the natural fits. Pick one.
  - Note: both READMEs mention a sandbox-only Prisma workaround
    (`engineType = "client"`, hand-written `init.sql`) because *this*
    build sandbox couldn't reach `binaries.prisma.sh`. On your own
    machine/host that restriction won't exist — switch back to the
    normal `prisma migrate dev` flow per each README's instructions.
- [ ] **Wire a real email provider** (Resend/SendGrid/Postmark) — needed
      by `marketing-site`, `admin-panel`, and `lms` alike. One provider
      account can serve all three.
- [ ] **Wire real cloud file storage** (S3/Cloudinary/GCS) — `admin-panel`
      materials/submissions and `lms` file uploads currently write to
      local disk or accept pasted URLs only.

## 🟠 High — needed for a genuinely usable first real cohort

- [ ] Zoom/Google Meet integration — session `meetingLink` fields are
      free-text placeholders today, no real meeting auto-creation.
- [ ] Certificate PDF generation — the data model and UI exist
      (issued flag, download button) but nothing actually renders a
      certificate PDF yet.
- [ ] Push notification backend for the mobile app — local on-device
      reminders already work with no backend; *remote* push (grade
      posted, announcement) needs a server-side job that reads stored
      Expo push tokens and sends via Expo's push API.
- [ ] Reconcile mobile app's expected REST route names
      (`src/api/client.ts`) against whatever routes actually get built on
      the `lms` backend once it's deployed.

## 🟡 Medium

- [ ] Rate limiting / audit logging / 2FA on `admin-panel` before any real
      faculty data goes through it.
- [ ] Mobile app store builds — no EAS build profile, no Apple/Google
      signing credentials, placeholder bundle identifier. Only needed once
      you're ready to actually publish to app stores (Expo Go / a dev
      build works fine before that).

## ✅ Already working today (don't re-build)

- [x] Full faculty/admin feature set in code: dashboard, session
      management, attendance, grading with rubrics, student profiles,
      attendance/grade report exports (Excel + PDF), messaging,
      announcements.
- [x] Full student feature set in code: dashboard, courses, sessions with
      live-join windows, assessments/submissions, internship logbook,
      profile, notifications, faculty messaging.
- [x] Mobile app fully functional in demo/mock mode — usable standalone
      today with the two demo accounts, no backend required.
- [x] Demo login credentials exist for every role (see each app's README)
      — useful for you to actually click through and see what's built
      before deciding what to prioritize.

---

## Suggested order of operations for next sessions

1. Actually **click through the demo logins** yourself (both apps run
   locally with `npm run dev` once a local Postgres is set up per each
   README) so you can see what's already there before deciding what's
   missing from *your* perspective, not just the README's.
2. Decide hosting: reuse Neon for the database, pick Vercel/Railway/Render
   for `admin-panel` + `lms`.
3. Get one of the two (probably `lms`, since students are the primary
   audience) live with a real database before touching email/file
   storage/Zoom polish.
4. Then admin-panel, then mobile app pointed at the real backend instead
   of mock mode.
