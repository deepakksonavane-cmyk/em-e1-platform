/**
 * Email notification stub.
 *
 * TODO (production): wire this up to a real transactional email provider
 * (e.g. Resend, SendGrid, Postmark, AWS SES). Suggested shape once wired:
 *
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({
 *     from: "Event Management & Team Leadership E1 <admissions@yourdomain.com>",
 *     to,
 *     subject,
 *     html,
 *   });
 *
 * For now this just logs to the server console so the calling code paths
 * (contact form, application confirmation) can be exercised end-to-end
 * without a real provider or API key.
 */
export async function notifyByEmail(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ sent: boolean; mock: boolean }> {
  // eslint-disable-next-line no-console
  console.log("[email:mock] TODO wire real provider ->", {
    to: params.to,
    subject: params.subject,
  });
  return { sent: true, mock: true };
}
