"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitContactForm, ContactActionState } from "@/app/actions/contact";
import { inputClass, FieldWrapper } from "@/components/apply/FormField";

const initialState: ContactActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Sending…" : "Send Message"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldWrapper label="Full Name" htmlFor="name">
          <input id="name" name="name" required className={inputClass} />
        </FieldWrapper>
        <FieldWrapper label="Email Address" htmlFor="email">
          <input id="email" name="email" type="email" required className={inputClass} />
        </FieldWrapper>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldWrapper label="Phone (optional)" htmlFor="phone">
          <input id="phone" name="phone" className={inputClass} />
        </FieldWrapper>
        <FieldWrapper label="Subject" htmlFor="subject">
          <input id="subject" name="subject" required className={inputClass} />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Message" htmlFor="message">
        <textarea id="message" name="message" rows={5} required className={inputClass} />
      </FieldWrapper>

      <SubmitButton />

      {state.status !== "idle" && state.message && (
        <p
          className={`text-sm font-medium ${
            state.status === "success" ? "text-green-700" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
