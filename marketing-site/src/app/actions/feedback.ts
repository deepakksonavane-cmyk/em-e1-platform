"use server";

import { feedbackSchema } from "@/lib/validations";
import { appendRecord, generateId } from "@/lib/storage";
import { notifyByEmail } from "@/lib/email";

const FILE = "site-feedback.json";

// Where feedback notifications are sent once a real email provider is wired
// up in src/lib/email.ts (see that file's TODO). Update this if the
// admissions inbox changes.
const FEEDBACK_NOTIFY_EMAIL = "deepakk.sonavane@gmail.com";

interface FeedbackRecord {
  id: string;
  name: string;
  email?: string;
  role: string;
  rating: string;
  pageReviewed?: string;
  feedback: string;
  submittedAt: string;
}

export interface FeedbackActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitFeedbackForm(
  _prevState: FeedbackActionState,
  formData: FormData
): Promise<FeedbackActionState> {
  const parsed = feedbackSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    role: formData.get("role"),
    rating: formData.get("rating"),
    pageReviewed: formData.get("pageReviewed") ?? "",
    feedback: formData.get("feedback"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const record: FeedbackRecord = {
    id: generateId("FDBK"),
    ...parsed.data,
    submittedAt: new Date().toISOString(),
  };

  await appendRecord<FeedbackRecord>(FILE, record);

  // TODO (production): replace with a real transactional email send — see src/lib/email.ts
  await notifyByEmail({
    to: FEEDBACK_NOTIFY_EMAIL,
    subject: `New site feedback (${parsed.data.rating}/5) from ${parsed.data.name}`,
    body: `From: ${parsed.data.name}${parsed.data.email ? ` <${parsed.data.email}>` : ""}\nRole: ${parsed.data.role}\nRating: ${parsed.data.rating}/5\nPage reviewed: ${parsed.data.pageReviewed || "Not specified"}\n\n${parsed.data.feedback}`,
  });

  return {
    status: "success",
    message: "Thank you! Your feedback has been sent.",
  };
}
