// ============================================================================
// Email sending — wired up to Resend (https://resend.com).
//
// If RESEND_API_KEY is not set (e.g. local dev with no env configured), this
// silently falls back to logging the intended email to the server console,
// so nothing breaks and the calling code never needs to know the difference.
// Once RESEND_API_KEY is set in the environment (e.g. Vercel project
// settings), real emails start sending automatically — no code change
// needed.
//
// EMAIL_FROM controls the "from" address. Until a custom domain is verified
// in Resend, this must be "onboarding@resend.dev" (Resend's shared test
// sender), which can only deliver to the email address you signed up to
// Resend with. Once you verify your own domain in Resend, set EMAIL_FROM to
// an address on that domain (e.g. "notifications@em-e1.edu") to send to
// anyone.
// ============================================================================

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  payload: EmailPayload
): Promise<{ ok: boolean; stub?: true; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.log(
      `[lib/email.ts STUB — RESEND_API_KEY not set] Would send email to=${payload.to} subject="${payload.subject}"`
    );
    return { ok: true, stub: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.error(`[lib/email.ts] Resend send failed (${res.status}): ${errText}`);
      return { ok: false, error: errText || `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[lib/email.ts] Resend send threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
