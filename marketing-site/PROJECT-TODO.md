# E1 Marketing Site — Running To-Do List

Last updated: 2026-08-17. Kept in the repo so it survives between sessions —
update this file (don't just talk about changes) whenever something is
finished, deferred, or newly discovered. Ping Claude to re-sort priority as
the picture changes.

**How to read this:** items are grouped by priority, not by when they were
found. "Deferred (base-stage)" means real issues that were consciously
postponed because the site is still early — not forgotten, not solved.

---

## 🔴 Critical — before this site is shown to real applicants

- [ ] **Replace the placeholder admissions email.** Footer + Contact page
      currently show `admissions@eventmanagement-e1.example.edu` —
      `.example.edu` is a placeholder domain, not real. *(Deferred by user
      2026-08-17 — base stage, revisit before launch.)*
- [ ] **Real faculty names, photos, and bios** to replace "Lecturer 1"
      through "Lecturer 6" on the Faculty page and homepage curriculum
      section. *(Deferred by user 2026-08-17 — base stage, revisit before
      launch.)*
- [ ] **Wire up a real email provider** (Resend/SendGrid/Postmark) so the
      Contact form and Feedback form actually deliver email instead of
      logging to the server console in mock mode. See `src/lib/email.ts`.
- [ ] **Wire up real Razorpay credentials** for live payment — the Apply
      flow currently runs in mock payment mode. See `src/lib/payment.ts`.

## 🟠 High — meaningfully hurts trust or conversion right now

- [ ] Surface the ₹1,30,000 fee earlier — it's clear on `/program` but
      invisible from the homepage. A compact fee strip near the hero would
      fix this without a full redesign.
- [ ] Add a line on the `/apply` page explaining what happens after
      submission (review timeline, next contact, no interview vs.
      interview).
- [ ] State the accreditation situation explicitly, even if the honest
      answer is "not currently accredited by an external body" — silence
      reads worse than a plain answer.
- [ ] State where the 3 in-person weekends are held (or when that info is
      shared) — several reviewers flagged not knowing this as a dealbreaker
      for non-local applicants.

## 🟡 Medium — worth fixing, not urgent

- [ ] Investigate the large blank whitespace gap on `/contact` between the
      "Send a Message" form and the footer — looks like a layout bug,
      unrelated to the redesign.
- [ ] `src/data/testimonials.ts` is now unused (replaced by Career
      Pathways) — safe to delete once confirmed nothing else imports it.
- [ ] Consider a secondary CTA next to "Apply Now" (e.g. "Download
      Brochure") for visitors not ready to commit yet.

## 🟢 Low / nice-to-have

- [ ] Add real event/team photography once available — current design is
      typography-heavy with no human imagery, which a couple of reviewers
      felt was cold for an education brand.
- [ ] Revisit copy on a few generic lines (flagged by external AI review)
      once faculty/accreditation content is real — rewriting copy before
      the substance exists is wasted work.

## ✅ Done

- [x] Migrated off Vercel (payment card issue) to Netlify
- [x] Fixed Netlify 404 via `netlify.toml` + `@netlify/plugin-nextjs`
- [x] Renamed Netlify subdomain → `emlp-e1.netlify.app`
- [x] Added visible Fees section to `/program` page
- [x] Replaced `/testimonials` with honest `/career-pathways` page (8 pathways)
- [x] Full Apple-inspired visual redesign (typography, color tokens, spacing)
      across all pages via shared design tokens
- [x] Built `/faq` page (21 questions across 5 categories)
- [x] Built `/feedback` page + server action (email delivery still mock —
      see Critical list)
- [x] Rotated exposed OmniRoute API key and Neon DB password after
      accidental chat exposure
- [x] Cross-checked site against 3 independent AI reviews (Copilot, Gemini,
      DeepSeek) — see summary in chat history 2026-08-17

---

## 🔴 Critical — scope clarification (added 2026-08-18)

- [ ] **Clarify marketing-site vs. LMS/operational app scope.** A friend's
      feedback on the marketing-site link assumed it should be the
      operational student/faculty portal (sign in → see records). That's a
      different app — the `lms` and `admin-panel` folders already exist in
      the project but haven't been started yet. Confirm with the user
      whether/when to start scoping the actual LMS (auth, student records,
      faculty tools) as a separate build track from the marketing site.
- [ ] User is considering having a friend (professional designer) help
      polish the marketing-site. If that happens, make sure it works off
      the same repo/branch rather than a parallel copy, to avoid divergence.

## Notes for next session

- User is intentionally working base-first, polish-later — don't push
  faculty/email fixes until they raise it again.
- If the user mentions something new that should be tracked, add it here
  under the right priority *and* confirm out loud that it's been added —
  don't just remember it in-conversation.
