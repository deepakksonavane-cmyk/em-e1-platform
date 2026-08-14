"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { FieldWrapper, inputClass } from "@/components/apply/FormField";
import { PROGRAM_FEE_INR, APPLICATION_FEE_INR } from "@/lib/payment";

type FormState = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  email: string;
  mobileNumber: string;
  alternateContactNumber: string;
  currentAddress: string;
  cityOfResidence: string;
  state: string;
  pinCode: string;
  permanentSameAsCurrent: boolean;
  permanentAddress: string;
  idProofType: string;
  idProofNumber: string;
  highestQualification: string;
  institutionName: string;
  boardOrUniversity: string;
  yearOfCompletion: string;
  gradeOrPercentage: string;
  employmentStatus: string;
  organizationName: string;
  designation: string;
  yearsOfExperience: string;
  industry: string;
  hasEventManagementExperience: boolean;
  hasTeamLeadershipExperience: boolean;
  whyJoinProgram: string;
  careerGoals: string;
  howHeardAboutProgram: string;
  preferredBatch: string;
  preferredWeekendCity: string;
  specialAccommodationNeeds: string;
  declarationAccepted: boolean;
  consentEmail: boolean;
  consentPhoneSms: boolean;
  consentWhatsApp: boolean;
  photoVideoConsent: boolean;
  termsAccepted: boolean;
};

const initialState: FormState = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Indian",
  email: "",
  mobileNumber: "",
  alternateContactNumber: "",
  currentAddress: "",
  cityOfResidence: "",
  state: "",
  pinCode: "",
  permanentSameAsCurrent: true,
  permanentAddress: "",
  idProofType: "",
  idProofNumber: "",
  highestQualification: "",
  institutionName: "",
  boardOrUniversity: "",
  yearOfCompletion: "",
  gradeOrPercentage: "",
  employmentStatus: "",
  organizationName: "",
  designation: "",
  yearsOfExperience: "",
  industry: "",
  hasEventManagementExperience: false,
  hasTeamLeadershipExperience: false,
  whyJoinProgram: "",
  careerGoals: "",
  howHeardAboutProgram: "",
  preferredBatch: "",
  preferredWeekendCity: "",
  specialAccommodationNeeds: "",
  declarationAccepted: false,
  consentEmail: true,
  consentPhoneSms: true,
  consentWhatsApp: true,
  photoVideoConsent: true,
  termsAccepted: false,
};

type Step = "form" | "payment" | "confirmed";

export default function ApplicationForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>("form");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    paymentId: string;
    amountPaidInr: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        permanentAddress: form.permanentSameAsCurrent
          ? form.currentAddress
          : form.permanentAddress,
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.issues?.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, val] of Object.entries(data.issues.fieldErrors)) {
            if (Array.isArray(val) && val[0]) fieldErrors[key] = val[0] as string;
          }
          setErrors(fieldErrors);
        }
        setSubmitError(data.error ?? "Something went wrong. Please check the form and try again.");
        return;
      }

      setApplicationId(data.applicationId);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePay() {
    if (!applicationId) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/pay`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Payment failed. Please try again.");
        return;
      }
      setPaymentResult({ paymentId: data.paymentId, amountPaidInr: data.amountPaidInr });
      setStep("confirmed");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Network error during payment — please try again.");
    } finally {
      setPaying(false);
    }
  }

  if (step === "confirmed" && applicationId) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-card sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-100">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-600">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold text-navy-900">
          Application Submitted!
        </h2>
        <p className="mt-3 text-navy-600">
          Thank you, {form.fullName.split(" ")[0] || "there"}. Your application
          to Event Management &amp; Team Leadership E1 has been received and
          payment confirmed.
        </p>
        <dl className="mt-8 space-y-2 rounded-xl bg-navy-50 p-6 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-500">Application ID</dt>
            <dd className="font-semibold text-navy-900">{applicationId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-500">Payment ID</dt>
            <dd className="font-semibold text-navy-900">{paymentResult?.paymentId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-500">Amount Paid</dt>
            <dd className="font-semibold text-navy-900">
              ₹{paymentResult?.amountPaidInr.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-navy-400">
          Our admissions team will reach out within 3–5 business days to
          confirm your batch and in-person weekend slot. A confirmation email
          has also been queued (see README — email delivery is stubbed in
          this demo environment).
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (step === "payment" && applicationId) {
    const total = PROGRAM_FEE_INR + APPLICATION_FEE_INR;
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
        <h2 className="font-display text-2xl font-bold text-navy-900">Complete Your Payment</h2>
        <p className="mt-2 text-sm text-navy-600">
          Application <span className="font-semibold">{applicationId}</span>{" "}
          received. Complete payment to confirm your seat.
        </p>

        <dl className="mt-6 space-y-2 rounded-xl bg-navy-50 p-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-500">Application Fee (non-refundable)</dt>
            <dd className="font-medium text-navy-900">₹{APPLICATION_FEE_INR.toLocaleString("en-IN")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-500">Program Fee</dt>
            <dd className="font-medium text-navy-900">₹{PROGRAM_FEE_INR.toLocaleString("en-IN")}</dd>
          </div>
          <div className="flex justify-between border-t border-navy-200 pt-2 text-base">
            <dt className="font-semibold text-navy-900">Total Payable</dt>
            <dd className="font-bold text-navy-900">₹{total.toLocaleString("en-IN")}</dd>
          </div>
        </dl>

        <div className="mt-6 rounded-lg border border-dashed border-gold-300 bg-gold-50 p-4 text-xs text-gold-800">
          <strong>Test / Demo Mode:</strong> No live Razorpay credentials are
          configured in this environment, so clicking &ldquo;Pay Now&rdquo;
          simulates a successful Razorpay checkout end-to-end (order creation
          + signature verification) instead of charging a real card. See{" "}
          <code>src/lib/payment.ts</code> for the production integration
          points.
        </div>

        {submitError && <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p>}

        <button
          onClick={handlePay}
          disabled={paying}
          className="mt-6 w-full rounded-md bg-gold-400 px-6 py-3.5 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:opacity-60"
        >
          {paying ? "Processing payment…" : `Pay Now (Test Mode) — ₹${total.toLocaleString("en-IN")}`}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-12">
      {/* Section A: Personal Information */}
      <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">
          Section A — Personal Information
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FieldWrapper label="Full Name (as per ID)" error={errors.fullName}>
            <input className={inputClass} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Date of Birth" error={errors.dateOfBirth}>
            <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Gender" error={errors.gender}>
            <select className={inputClass} value={form.gender} onChange={(e) => update("gender", e.target.value)} required>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </FieldWrapper>
          <FieldWrapper label="Nationality" error={errors.nationality}>
            <input className={inputClass} value={form.nationality} onChange={(e) => update("nationality", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Email Address" error={errors.email}>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Mobile Number" error={errors.mobileNumber}>
            <input className={inputClass} value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Alternate Contact Number" error={errors.alternateContactNumber}>
            <input className={inputClass} value={form.alternateContactNumber} onChange={(e) => update("alternateContactNumber", e.target.value)} />
          </FieldWrapper>
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy-500">
          Address Details
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FieldWrapper label="Current Address" error={errors.currentAddress}>
            <textarea className={inputClass} rows={2} value={form.currentAddress} onChange={(e) => update("currentAddress", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="City of Residence" error={errors.cityOfResidence}>
            <input className={inputClass} value={form.cityOfResidence} onChange={(e) => update("cityOfResidence", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="State" error={errors.state}>
            <input className={inputClass} value={form.state} onChange={(e) => update("state", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Pin Code" error={errors.pinCode}>
            <input className={inputClass} value={form.pinCode} onChange={(e) => update("pinCode", e.target.value)} required />
          </FieldWrapper>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-navy-600">
          <input
            type="checkbox"
            checked={form.permanentSameAsCurrent}
            onChange={(e) => update("permanentSameAsCurrent", e.target.checked)}
          />
          Permanent address same as current address
        </label>
        {!form.permanentSameAsCurrent && (
          <div className="mt-3">
            <FieldWrapper label="Permanent Address">
              <textarea className={inputClass} rows={2} value={form.permanentAddress} onChange={(e) => update("permanentAddress", e.target.value)} />
            </FieldWrapper>
          </div>
        )}

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy-500">
          Identification
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FieldWrapper label="ID Proof Type" error={errors.idProofType}>
            <select className={inputClass} value={form.idProofType} onChange={(e) => update("idProofType", e.target.value)} required>
              <option value="">Select</option>
              <option>Aadhar</option>
              <option>PAN</option>
              <option>Voter ID</option>
              <option>Passport</option>
              <option>Driving License</option>
            </select>
          </FieldWrapper>
          <FieldWrapper label="ID Proof Number" error={errors.idProofNumber}>
            <input className={inputClass} value={form.idProofNumber} onChange={(e) => update("idProofNumber", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Upload ID Proof" hint="Document upload is simulated in this demo — no file is stored.">
            <input type="file" className={inputClass} />
          </FieldWrapper>
          <FieldWrapper label="Upload Passport-size Photo" hint="Document upload is simulated in this demo — no file is stored.">
            <input type="file" className={inputClass} />
          </FieldWrapper>
        </div>
      </section>

      {/* Section B: Educational Background */}
      <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">
          Section B — Educational Background
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FieldWrapper label="Highest Qualification" error={errors.highestQualification}>
            <select className={inputClass} value={form.highestQualification} onChange={(e) => update("highestQualification", e.target.value)} required>
              <option value="">Select</option>
              <option>10th / SSC</option>
              <option>12th / HSC</option>
              <option>Graduation</option>
              <option>Post-Graduation</option>
              <option>Other</option>
            </select>
          </FieldWrapper>
          <FieldWrapper label="Institution" error={errors.institutionName}>
            <input className={inputClass} value={form.institutionName} onChange={(e) => update("institutionName", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Board / University" error={errors.boardOrUniversity}>
            <input className={inputClass} value={form.boardOrUniversity} onChange={(e) => update("boardOrUniversity", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Year of Completion" error={errors.yearOfCompletion}>
            <input className={inputClass} value={form.yearOfCompletion} onChange={(e) => update("yearOfCompletion", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Grade / Percentage" error={errors.gradeOrPercentage}>
            <input className={inputClass} value={form.gradeOrPercentage} onChange={(e) => update("gradeOrPercentage", e.target.value)} required />
          </FieldWrapper>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {["10th Marksheet", "12th Marksheet", "Graduation Certificate", "Post-Graduation Certificate"].map((doc) => (
            <FieldWrapper key={doc} label={`Upload: ${doc}`} hint="Simulated upload — no file is stored in this demo.">
              <input type="file" className={inputClass} />
            </FieldWrapper>
          ))}
        </div>
      </section>

      {/* Section C: Professional Background */}
      <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">
          Section C — Professional Background
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FieldWrapper label="Current Employment Status" error={errors.employmentStatus}>
            <select className={inputClass} value={form.employmentStatus} onChange={(e) => update("employmentStatus", e.target.value)} required>
              <option value="">Select</option>
              <option>Employed</option>
              <option>Self-Employed</option>
              <option>Freelancer</option>
              <option>Student</option>
              <option>Unemployed</option>
              <option>Other</option>
            </select>
          </FieldWrapper>
          <FieldWrapper label="Years of Experience" error={errors.yearsOfExperience}>
            <select className={inputClass} value={form.yearsOfExperience} onChange={(e) => update("yearsOfExperience", e.target.value)} required>
              <option value="">Select</option>
              <option>0-1</option>
              <option>1-3</option>
              <option>3-5</option>
              <option>5-8</option>
              <option>8+</option>
            </select>
          </FieldWrapper>
          <FieldWrapper label="Organization Name" error={errors.organizationName}>
            <input className={inputClass} value={form.organizationName} onChange={(e) => update("organizationName", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Designation / Role" error={errors.designation}>
            <input className={inputClass} value={form.designation} onChange={(e) => update("designation", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Industry" error={errors.industry}>
            <input className={inputClass} value={form.industry} onChange={(e) => update("industry", e.target.value)} />
          </FieldWrapper>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-navy-600">
            <input type="checkbox" checked={form.hasEventManagementExperience} onChange={(e) => update("hasEventManagementExperience", e.target.checked)} />
            Event Management Experience
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-600">
            <input type="checkbox" checked={form.hasTeamLeadershipExperience} onChange={(e) => update("hasTeamLeadershipExperience", e.target.checked)} />
            Team Leadership Experience
          </label>
        </div>
      </section>

      {/* Section D: Program Preferences */}
      <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">
          Section D — Program Preferences
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5">
          <FieldWrapper label="Why do you want to join this program?" error={errors.whyJoinProgram}>
            <textarea className={inputClass} rows={3} value={form.whyJoinProgram} onChange={(e) => update("whyJoinProgram", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="What are your career goals?" error={errors.careerGoals}>
            <textarea className={inputClass} rows={3} value={form.careerGoals} onChange={(e) => update("careerGoals", e.target.value)} required />
          </FieldWrapper>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FieldWrapper label="How did you hear about this program?" error={errors.howHeardAboutProgram}>
            <select className={inputClass} value={form.howHeardAboutProgram} onChange={(e) => update("howHeardAboutProgram", e.target.value)} required>
              <option value="">Select</option>
              <option>Social Media</option>
              <option>Email</option>
              <option>Website</option>
              <option>Referral</option>
              <option>Ad</option>
              <option>Other</option>
            </select>
          </FieldWrapper>
          <FieldWrapper label="Preferred Batch" error={errors.preferredBatch}>
            <select className={inputClass} value={form.preferredBatch} onChange={(e) => update("preferredBatch", e.target.value)} required>
              <option value="">Select</option>
              <option>Batch A: Mon-Thu</option>
              <option>Batch B: Tue-Fri</option>
            </select>
          </FieldWrapper>
          <FieldWrapper label="Preferred City for In-Person Weekend">
            <input className={inputClass} value={form.preferredWeekendCity} onChange={(e) => update("preferredWeekendCity", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Special Accommodation Requirements">
            <input className={inputClass} value={form.specialAccommodationNeeds} onChange={(e) => update("specialAccommodationNeeds", e.target.value)} placeholder="If none, leave blank" />
          </FieldWrapper>
        </div>
      </section>

      {/* Section E: Declaration & Consent */}
      <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-xl font-bold text-navy-900">
          Section E — Declaration &amp; Consent
        </h2>
        <p className="mt-3 text-sm text-navy-600">
          I hereby declare that all the information provided in this
          application is true and complete to the best of my knowledge.
        </p>
        <div className="mt-5 space-y-3">
          <label className="flex items-start gap-2 text-sm text-navy-700">
            <input type="checkbox" className="mt-0.5" checked={form.consentEmail} onChange={(e) => update("consentEmail", e.target.checked)} />
            I consent to receive communications via Email
          </label>
          <label className="flex items-start gap-2 text-sm text-navy-700">
            <input type="checkbox" className="mt-0.5" checked={form.consentPhoneSms} onChange={(e) => update("consentPhoneSms", e.target.checked)} />
            I consent to receive communications via Phone / SMS
          </label>
          <label className="flex items-start gap-2 text-sm text-navy-700">
            <input type="checkbox" className="mt-0.5" checked={form.consentWhatsApp} onChange={(e) => update("consentWhatsApp", e.target.checked)} />
            I consent to receive communications via WhatsApp
          </label>
          <label className="flex items-start gap-2 text-sm text-navy-700">
            <input type="checkbox" className="mt-0.5" checked={form.photoVideoConsent} onChange={(e) => update("photoVideoConsent", e.target.checked)} />
            I consent to the use of photographs and videos captured during the program for promotional purposes
          </label>
          <label className="flex items-start gap-2 text-sm font-medium text-navy-900">
            <input type="checkbox" className="mt-0.5" checked={form.declarationAccepted} onChange={(e) => update("declarationAccepted", e.target.checked)} required />
            I declare the above information is true and complete
          </label>
          {errors.declarationAccepted && <p className="text-xs font-medium text-red-600">{errors.declarationAccepted}</p>}
          <label className="flex items-start gap-2 text-sm font-medium text-navy-900">
            <input type="checkbox" className="mt-0.5" checked={form.termsAccepted} onChange={(e) => update("termsAccepted", e.target.checked)} required />
            I have read and agree to the Terms &amp; Conditions (fees are non-refundable after program start; 80% online / 100% in-person attendance is mandatory for certification)
          </label>
          {errors.termsAccepted && <p className="text-xs font-medium text-red-600">{errors.termsAccepted}</p>}
        </div>
      </section>

      {submitError && (
        <p className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">{submitError}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-navy-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Continue to Payment"}
        </button>
      </div>
    </form>
  );
}
