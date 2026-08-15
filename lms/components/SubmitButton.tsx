"use client";

import { useState } from "react";

/**
 * Submit button that shows a pending state right after it's clicked.
 *
 * Why this exists: the LMS runs on Vercel's serverless tier backed by a
 * Neon Postgres database that can "cold start" after a period of
 * inactivity. That means the very first request after some idle time
 * (a fresh sign-in, or a sign-out first thing after opening the app) can
 * take a couple of seconds to come back — the click DID register, the
 * server is just waking up. Without any visual feedback, that delay looks
 * exactly like the button silently did nothing, so people click it again.
 * This component removes that ambiguity by swapping the label to a
 * pending message and disabling further clicks once the submit is under
 * way.
 *
 * IMPORTANT gotcha this component works around: a <button type="submit">
 * is what tells the browser to submit its parent <form>. If that same
 * button becomes `disabled` before the browser finishes acting on the
 * click that triggered it, some browsers cancel the submission entirely —
 * the element that "activated" the submit is no longer a valid submitter.
 * Setting `disabled` synchronously inside onClick can lose the race and
 * silently swallow every submission (the button happily shows "Signing
 * in…" forever, but no request ever goes out). Deferring the disable by
 * one tick (setTimeout 0) lets the browser start the real form submission
 * first; disabling a moment later is harmless since the page is already
 * navigating away by then.
 */
export default function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={() => {
        setTimeout(() => setPending(true), 0);
      }}
      className={`${className ?? ""} ${pending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
