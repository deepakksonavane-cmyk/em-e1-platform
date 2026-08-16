import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// ============================================================================
// TEMPORARY DIAGNOSTIC PAGE — visit this URL directly in a browser:
//   https://em-e1-admin-panel.vercel.app/api/debug-email
// It reports whether RESEND_API_KEY is configured, and actually attempts to
// send one real test email to confirm the whole pipeline end-to-end.
// Safe to delete this whole file once email delivery is confirmed working.
// ============================================================================

export async function GET(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const testTo =
    req.nextUrl.searchParams.get("to") || "deepakk.sonavane@gmail.com";

  const result = await sendEmail({
    to: testTo,
    subject: "EM&L E1 — diagnostic test email",
    html: "<p>If you are reading this, email delivery is working end-to-end.</p>",
  });

  const lines = [
    "EM&L E1 Admin Panel — Email Diagnostic",
    "========================================",
    "",
    `RESEND_API_KEY present: ${!!apiKey}`,
    `RESEND_API_KEY length: ${apiKey ? apiKey.length : 0}`,
    `RESEND_API_KEY starts with: ${apiKey ? apiKey.slice(0, 4) : "(not set)"}`,
    `EMAIL_FROM: ${emailFrom}`,
    "",
    `Test email sent to: ${testTo}`,
    "",
    "Result:",
    JSON.stringify(result, null, 2),
    "",
    "----",
    "If 'ok: true' and 'stub' is missing above, Resend accepted the email —",
    "check the inbox (and spam folder) for the address above.",
    "",
    "If 'stub: true' appears, RESEND_API_KEY is not being read by this",
    "deployment at all (most likely: it was added to the wrong Vercel",
    "project, or a redeploy hasn't happened since it was added).",
    "",
    "If 'ok: false' with an error message, that error is coming directly",
    "from Resend and tells us exactly what's wrong (bad key, blocked",
    "recipient, etc).",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
