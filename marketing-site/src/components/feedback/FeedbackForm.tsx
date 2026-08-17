"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitFeedbackForm, FeedbackActionState } from "@/app/actions/feedback";
import { inputClass, FieldWrapper } from "@/components/apply/FormField";
import clsx from "@/lib/clsx";

const initialState: FeedbackActionState = { status: "idle" };

const ROLES = [
  "Prospective Student",
  "Parent / Guardian",
  "Industry Professional",
  "Friend / Family Reviewer",
  "Other",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-gold-500 px-7 py-3.5 text-[15px] font-medium text-white transition hover:bg-gold-600 disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Sending…" : "Send Feedback"}
    </button>
  );
}

export default function FeedbackForm() {
  const [state, formAction] = useFormState(submitFeedbackForm, initialState);
  const [rating, setRating] = useState<string>("5");

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldWrapper label="Your Name" htmlFor="name">
          <input id="name" name="name" required className={inputClass} />
        </FieldWrapper>
        <FieldWrapper label="Email (optional — only if you'd like a reply)" htmlFor="email">
          <input id="email" name="email" type="email" className={inputClass} />
        </FieldWrapper>
      </div>

      <FieldWrapper label="How do you know this program?" htmlFor="role">
        <select id="role" name="role" required className={inputClass} defaultValue={ROLES[0]}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </FieldWrapper>

      <div>
        <label className="block text-sm font-medium text-navy-800">
          Overall, how does the site feel to you?
        </label>
        <input type="hidden" name="rating" value={rating} />
        <div className="mt-2 flex gap-2">
          {["1", "2", "3", "4", "5"].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={clsx(
                "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition",
                rating === n
                  ? "border-gold-500 bg-gold-500 text-white"
                  : "border-navy-200 text-navy-600 hover:border-navy-400"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-navy-400">1 = needs work, 5 = looks great</p>
      </div>

      <FieldWrapper
        label="Which page(s) did you look at? (optional)"
        htmlFor="pageReviewed"
        hint="e.g. Homepage, Program, Career Pathways, Apply"
      >
        <input id="pageReviewed" name="pageReviewed" className={inputClass} />
      </FieldWrapper>

      <FieldWrapper
        label="What did you notice — anything confusing, broken, or that stood out?"
        htmlFor="feedback"
      >
        <textarea id="feedback" name="feedback" rows={5} required className={inputClass} />
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
