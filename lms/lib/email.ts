// ============================================================================
// Email sending — STUB. No real email provider is wired up in this build.
//
// TODO (production): replace the body of sendEmail() with a real integration,
// e.g. Nodemailer + SMTP, or Resend:
//
//   import { Resend } from "resend";
//   const resend = new Resend(process.env.RESEND_API_KEY);
//   await resend.emails.send({ from, to, subject, html });
//
// or with Nodemailer:
//
//   import nodemailer from "nodemailer";
//   const transporter = nodemailer.createTransport({ host, port, auth });
//   await transporter.sendMail({ from, to, subject, html });
//
// Until then, this function just logs the intended email to the server
// console so the interface is exercised end-to-end (e.g. from notification
// triggers) without a live SMTP dependency.
// ============================================================================

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; stub: true }> {
  // eslint-disable-next-line no-console
  console.log(
    `[lib/email.ts STUB] Would send email to=${payload.to} subject="${payload.subject}"`
  );
  return { ok: true, stub: true };
}
