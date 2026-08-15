"use client";

import { useState } from "react";

/**
 * Submit button that immediately shows a pending state on click.
 *
 * Why this exists: the LMS runs on Vercel's serverless tier backed by a
 * Neon Postgres database that can "cold start" after a period of
 * inactivity. That means the very first request after some idle time
 * (a fresh sign-in, or a sign-out first thing after opening the app) can
 * take a couple of seconds to come back — the click DID register, the
 * server is just waking up. Without any visual feedback, that delay looks
 * exactly like the button silently did nothing, so people click it again.
 * This component removes that ambiguity: the moment the button is
 * pressed, it disables itself and swaps its label to a pending message,
 * so it's obvious the action is in flight rather than broken.
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
      onClick={() => setPending(true)}
      className={`${className ?? ""} ${pending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
