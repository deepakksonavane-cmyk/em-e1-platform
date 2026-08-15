# EM&L E1 Student App

Expo (React Native + TypeScript) companion mobile app for the **Event
Management & Team Leadership E1** diploma program (420 hours, 24 weeks, 6
subjects, 74 sessions, 3 in-person weekends). This is a real client for the
sibling Student LMS backend (Next.js + Prisma/Postgres) — it is not a static
mockup.

## Setup

```bash
cd mobile-app
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, `w` for web, or
scan the QR code with Expo Go on a physical device.

## Pointing at a real backend vs. mock mode

The app reads two Expo public env vars (see `.env.example`):

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_USE_MOCK_DATA=true
```

- **`EXPO_PUBLIC_USE_MOCK_DATA=true`** (default) — every screen is served
  entirely from the bundled `src/data/seed-data.json` (a copy of
  `shared/seed-data.json`) via `src/data/mockData.ts` and
  `src/api/mockBackend.ts`. Two demo student accounts are pre-seeded (see the
  login screen). Submissions, internship log entries, and sent messages are
  persisted locally with `AsyncStorage` so they survive app restarts, even
  with no server running. The app is fully demoable standalone.
- **`EXPO_PUBLIC_USE_MOCK_DATA=false`** — the app calls the real LMS backend
  at `EXPO_PUBLIC_API_BASE_URL` via `src/api/client.ts` (REST routes named
  after the Prisma models: `/auth/*`, `/students/me/*`, `/sessions`,
  `/subjects`, `/weekends`, `/assessments`, `/messages`, `/notifications`,
  etc.). If any individual request fails (backend down, route not built yet,
  no network), `src/api/index.ts` transparently falls back to mock data for
  that call so the app never dead-ends mid-demo.

Copy `.env.example` to `.env` (or export the vars in your shell) before
running `npx expo start` to override the defaults.

**Demo accounts (mock mode):**
| Email | Password |
|---|---|
| `priya.sharma@student.emleadership.edu` | `Student@123` |
| `arjun.verma@student.emleadership.edu` | `Student@123` |

## Project structure

```
App.tsx                      Root component (providers + navigation)
src/
  api/
    config.ts                EXPO_PUBLIC_* env config, USE_MOCK_DATA flag
    types.ts                 Api interface shared by both backends
    client.ts                Real HTTP client (fetch, matches LMS REST routes)
    mockBackend.ts            Mock backend (seed data + AsyncStorage overlay)
    index.ts                  Picks mock vs real, with automatic fallback
  data/
    seed-data.json            Bundled copy of shared/seed-data.json
    mockData.ts                Typed fixtures generated from seed data
  types/index.ts              TypeScript types mirroring shared/prisma/schema.prisma
  context/AuthContext.tsx     Auth state, session persistence, notif. bootstrap
  notifications/notifications.ts  expo-notifications: local reminders + push token stub
  navigation/                 React Navigation stacks + bottom tabs
  screens/                    auth, dashboard, schedule, assignments,
                               internship, weekends, messages, profile
  components/                 Card, Button, Badge, ProgressBar, Screen, Input…
  theme/theme.ts               Deep navy + amber brand palette, spacing, type scale
  utils/                       dates.ts (curriculum→calendar projection), storage.ts
```

## Features implemented

- **Auth** — login + registration screens calling `api.login` / `api.register`;
  mock mode validates against the two demo accounts above.
- **Dashboard** — program progress (weeks/hours/subjects), attendance %,
  next-session card, next-deadline card, projected overall score.
- **Schedule** — all 74 sessions, filterable by subject and week, with a
  detail screen (key topics, teaching method, resources, "Join Live Session"
  via `Linking.openURL`, recording link once completed).
- **Session reminders & push** — real `expo-notifications` local scheduling:
  a reminder 30 minutes before each upcoming session's start time and 24
  hours before each assignment deadline (`src/notifications/notifications.ts`,
  wired up automatically on login and from the session detail screen). Remote
  push token registration is implemented client-side
  (`registerForPushNotificationsAsync`) and posts the token to
  `api.registerPushToken` — see Stubs below.
- **Assignments/Grades** — list with status (not submitted / submitted /
  graded), detail screen, submission flow using `expo-document-picker`, and a
  grades screen with per-category scores/feedback plus a weighted overall
  projected score.
- **Internship Logbook** — list of logged entries, "Add Entry" form with a
  native date picker (`@react-native-community/datetimepicker`) and hours
  input, running total vs. the required 30 hours with a progress bar.
- **In-Person Weekends** — 3 weekend screens (schedule by day, venue with a
  "Open in Google Maps" `Linking` button built from the venue address,
  activities list).
- **Faculty Communication** — threaded conversations list and a chat-style
  thread screen; sending calls `api.sendMessage`.
- **Profile** — view/edit basic info, attendance history list, certificate
  status.

## Build checks

- `npx tsc --noEmit` passes cleanly (0 errors).
- `npm install` completes successfully; all navigation/notification/picker
  packages are pinned to versions compatible with the installed Expo SDK
  (57.0.12).
- Metro/Expo dev server was not run end-to-end inside this sandbox (no
  device/simulator available here), but the project structure, imports, and
  types are verified consistent — `npx expo start` should run normally in a
  standard dev environment.

## What's stubbed / needs real infra before production

1. **Push notification backend.** This app registers an Expo push token
   client-side (`registerForPushNotificationsAsync` →
   `api.registerPushToken`), but there is no server-side service yet that
   reads stored tokens and actually sends `SESSION_REMINDER` /
   `DEADLINE_REMINDER` / `GRADE_POSTED` / `ANNOUNCEMENT` pushes via Expo's
   push API. The LMS/admin panel backend needs a scheduled job or queue
   worker for this. Local on-device scheduled notifications (session/deadline
   reminders) work today with no backend at all.
2. **Real file upload storage.** `submitAssessment` in mock mode stores a
   `mock://` URI reference only — no actual file bytes leave the device. The
   real client (`client.ts`) posts a `multipart/form-data` request to
   `/assessments/:id/submissions`, but the LMS backend needs real object
   storage (S3/GCS/Azure Blob or similar) behind that route, plus
   virus-scanning/size-limit policy, before going to production.
3. **App store builds/signing.** No EAS Build profile, Apple/Google
   signing credentials, or App Store/Play Store listing assets are set up.
   `app.json` has placeholder bundle identifiers
   (`com.emleadershipacademy.e1student`) and an empty `extra.eas.projectId` —
   run `eas build:configure` and supply real credentials before shipping.
4. **Backend route naming.** `src/api/client.ts` assumes REST paths matching
   the Prisma model names (e.g. `/students/me/dashboard`,
   `/students/me/internship/logs`). Once the actual LMS backend routes land,
   reconcile any naming differences in that one file.
5. **Auth security.** Mock login/registration do no real password hashing or
   validation beyond matching the two demo accounts; the real backend client
   assumes a JWT-style bearer token returned from `/auth/login`.
