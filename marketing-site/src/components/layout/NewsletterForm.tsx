"use client";

import { useFormState, useFormStatus } from "react-dom";
import { subscribeToNewsletter, NewsletterActionState } from "@/app/actions/newsletter";

const initialState: NewsletterActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="whitespace-nowrap rounded-md bg-gold-400 px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:opacity-60"
    >
      {pending ? "Subscribing…" : "Subscribe"}
    </button>
  );
}

export default function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeToNewsletter, initialState);

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full min-w-0 rounded-md border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-gold-400 focus:outline-none"
        />
        <SubmitButton />
      </form>
      {state.status !== "idle" && state.message && (
        <p
          className={`mt-2 text-sm ${
            state.status === "success" ? "text-gold-200" : "text-red-300"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
