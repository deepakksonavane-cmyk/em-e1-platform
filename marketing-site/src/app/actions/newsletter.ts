"use server";

import { newsletterSchema } from "@/lib/validations";
import { appendRecord, generateId, listRecords } from "@/lib/storage";

const FILE = "newsletter-subscribers.json";

interface NewsletterRecord {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface NewsletterActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function subscribeToNewsletter(
  _prevState: NewsletterActionState,
  formData: FormData
): Promise<NewsletterActionState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please enter a valid email address.",
    };
  }

  const existing = await listRecords<NewsletterRecord>(FILE);
  const alreadySubscribed = existing.some(
    (r) => r.email.toLowerCase() === parsed.data.email.toLowerCase()
  );

  if (alreadySubscribed) {
    return { status: "success", message: "You're already on the list — thank you!" };
  }

  await appendRecord<NewsletterRecord>(FILE, {
    id: generateId("NL"),
    email: parsed.data.email,
    subscribedAt: new Date().toISOString(),
  });

  return { status: "success", message: "Thanks for subscribing! Watch your inbox for updates." };
}
