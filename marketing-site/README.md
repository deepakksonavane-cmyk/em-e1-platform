# Event Management & Team Leadership E1 — Marketing Website

Public marketing site for the **Event Management & Team Leadership E1**
diploma program (420 hours, 24 weeks, 6 subjects, 74 sessions, 6 lecturers,
3 in-person weekends). Built with Next.js 14 (App Router, TypeScript) and
Tailwind CSS.

## Setup

```bash
cd marketing-site
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Environment variables

None are required to run the site in its default demo mode. Optional
variables for production:

| Variable | Purpose |
| --- | --- |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Enables live Razorpay payments in `src/lib/payment.ts`. Without these, payments run in **mock mode** (simulated success, no real charge). |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client-side Razorpay key, needed once the real Checkout widget is wired up. |

Create a `.env.local` file at the project root to set these.

## How form submissions are stored

There is no live database provisioned for this site. All form submissions
are persisted as **append-only JSON files** under `/data` at the project
root, via `src/lib/storage.ts`:

- `data/applications.json` — Apply Now submissions (personal info,
  education, professional background, program preferences, consent, and
  payment status/IDs once paid).
- `data/contact-messages.json` — Contact page messages.
- `data/newsletter-subscribers.json` — Footer newsletter signups.

Writes are serialized per-file with an in-process queue so concurrent
submissions don't clobber each other. `/data/*.json` is git-ignored (only
`.gitkeep` is committed) so no real applicant PII ends up in version
control.

**Swapping in a real database:** the shared Prisma schema at
`/home/claude/em_e1_platform/shared/prisma/schema.prisma` already defines
an `Application` model that the LMS/Admin Panel use. To plug this site into
that same Postgres database, replace the implementations in
`src/lib/applications.ts` (and the newsletter/contact actions) with
`prisma.application.create(...)` calls — the public function signatures
were written so callers (the API routes, the form components) would not
need to change.

## Application flow (`/apply`)

The form is a single-page, multi-section flow that mirrors the institute's
real paper Application Form / Student Registration Form
(`docs_extracted/7bbca413-...` and `3c7c66f0-...`):

1. **Personal Information** (name, DOB, contact, address, ID proof)
2. **Educational Background** (qualification, institution, documents)
3. **Professional Background** (employment status, experience)
4. **Program Preferences** (motivation, batch, weekend city)
5. **Declaration & Consent** (communication consent, photo/video consent,
   Terms & Conditions)
6. **Payment** — see below

Client-side required-field validation runs first; the server independently
re-validates the same data with `zod` (`src/lib/validations.ts`) in the
`POST /api/applications` route before anything is persisted — the client
never has to be trusted.

Document upload fields (ID proof, marksheets, photo) are present in the UI
but are **simulated only** — no file is actually stored. Wiring real file
uploads (e.g. to S3 or a similar object store) is a TODO before production.

## Payment flow

`src/lib/payment.ts` is the single integration point for payments, written
against the shape of the **Razorpay** Orders API (a sensible default for an
India-based, INR-priced program). It runs in one of two modes:

- **Mock mode (default, no credentials set):** `createPaymentOrder` and
  `verifyPayment` simulate a full Razorpay checkout — order creation +
  signature verification — and always succeed, so the entire apply → pay →
  confirmation flow can be demoed end-to-end without real credentials.
- **Live mode (once `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are set):** the
  real Razorpay SDK call shapes are written out in comments directly next
  to the mock branches — wiring them up is a mechanical change (install
  `razorpay`, uncomment the real calls, add a webhook route for signature
  verification).

## Blog

Blog content lives in `src/data/blog-posts.ts` as a typed array (no CMS/DB
dependency) with an index page (`/blog`) and statically generated post
pages (`/blog/[slug]`). Four seed posts are included, written around the
real curriculum themes (leadership skills, budgeting, hybrid events,
pricing an event business).

## What's stubbed / needs real credentials or content before production

- **Payment gateway** — Razorpay runs in mock/test mode; needs real
  `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`, the `razorpay` npm package, a
  client-side Checkout integration, and a signature-verification webhook
  route. See `src/lib/payment.ts`.
- **Transactional email** — `src/lib/email.ts` only logs to the server
  console. Needs a real provider (Resend/SendGrid/Postmark/SES) wired in
  for contact-form notifications and application confirmation emails.
- **Faculty bios & photos** — the six lecturer profiles on `/faculty`
  (`src/lib/program.ts` → `lecturerProfiles`) are placeholder bios
  generated from each lecturer's assigned subject area. Real names,
  photos, and credentials from the training institute must replace these.
- **Testimonials** — `src/data/testimonials.ts` contains illustrative
  sample testimonials, clearly marked as placeholders. Replace with real,
  consented graduate testimonials before launch.
- **Document uploads** — application form file inputs (ID proof,
  marksheets, photo) are UI-only; no file storage backend is wired up.
- **Fonts** — the build environment used to create this site has no
  outbound access to Google Fonts, so `next/font/google` (Playfair
  Display + Inter) was swapped for an equivalent system font stack in
  `src/app/globals.css`. Restore `next/font/google` in
  `src/app/layout.tsx` once building with internet access, for
  self-hosted, zero-layout-shift fonts.
- **Social links & contact details** — footer/contact page social URLs,
  phone number, WhatsApp number, and office address are placeholders.
- **Database** — form submissions persist to local JSON files, not a
  real database. See "How form submissions are stored" above for the
  migration path to the shared Prisma/Postgres schema.

## Project structure

```
src/
  app/
    page.tsx                 Homepage
    program/page.tsx          Full curriculum, weekends, assessments, policies
    faculty/page.tsx          Lecturer profiles (placeholder bios)
    testimonials/page.tsx     Sample testimonials (placeholder)
    apply/page.tsx            Multi-section application form + payment
    contact/page.tsx          Contact form + map + office details
    blog/page.tsx             Blog index
    blog/[slug]/page.tsx      Individual blog posts
    api/applications/         Application submit + payment API routes
    actions/                  Server Actions (contact, newsletter)
  components/                 UI, layout, apply, contact, program components
  lib/
    program.ts                Typed accessors over the real seed data
    validations.ts             zod schemas (application, contact, newsletter)
    storage.ts                 JSON-file persistence layer
    applications.ts            Application record read/write helpers
    payment.ts                 Razorpay integration point (mock + real shape)
    email.ts                   Email notification stub
  data/
    program-data.json          Copy of shared/seed-data.json (source of truth)
    testimonials.ts             Placeholder testimonials
    blog-posts.ts               Seed blog content
data/                          JSON "database" (git-ignored, .gitkeep only)
```
