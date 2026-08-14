"use server";

import { contactSchema } from "@/lib/validations";
import { appendRecord, generateId } from "@/lib/storage";
import { notifyByEmail } from "@/lib/email";

const FILE = "contact-messages.json";

interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface ContactActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitContactForm(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const record: ContactRecord = {
    id: generateId("MSG"),
    ...parsed.data,
    submittedAt: new Date().toISOString(),
  };

  await appendRecord<ContactRecord>(FILE, record);

  // TODO (production): replace with a real transactional email send — see src/lib/email.ts
  await notifyByEmail({
    to: "admissions@eventmanagement-e1.example.edu",
    subject: `New contact form message: ${parsed.data.subject}`,
    body: `From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
  });

  return {
    status: "success",
    message: "Thanks for reaching out! We'll get back to you within 1-2 business days.",
  };
}
