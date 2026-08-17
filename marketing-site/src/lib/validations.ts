import { z } from "zod";

// Mirrors the field structure of the real Application Form
// (docs_extracted/7bbca413-EMLP_E1_APPLICATION_FORM.md) and Student
// Registration Form (docs_extracted/3c7c66f0-...) so the online form
// captures the same information the institute already collects on paper.

export const applicationSchema = z.object({
  // Section A: Personal Information
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]),
  nationality: z.string().min(1, "Nationality is required"),
  email: z.string().email("Enter a valid email address"),
  mobileNumber: z.string().min(7, "Enter a valid mobile number"),
  alternateContactNumber: z.string().optional().or(z.literal("")),

  // Address
  currentAddress: z.string().min(5, "Current address is required"),
  cityOfResidence: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().min(3, "Pin code is required"),
  permanentSameAsCurrent: z.boolean().default(true),
  permanentAddress: z.string().optional().or(z.literal("")),

  // Identification
  idProofType: z.enum(["Aadhar", "PAN", "Voter ID", "Passport", "Driving License"]),
  idProofNumber: z.string().min(3, "ID proof number is required"),

  // Section B: Educational Background
  highestQualification: z.enum([
    "10th / SSC",
    "12th / HSC",
    "Graduation",
    "Post-Graduation",
    "Other",
  ]),
  institutionName: z.string().min(1, "Institution name is required"),
  boardOrUniversity: z.string().min(1, "Board/University is required"),
  yearOfCompletion: z.string().min(4, "Year is required"),
  gradeOrPercentage: z.string().min(1, "Grade/percentage is required"),

  // Section C: Professional Background
  employmentStatus: z.enum([
    "Employed",
    "Self-Employed",
    "Freelancer",
    "Student",
    "Unemployed",
    "Other",
  ]),
  organizationName: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  yearsOfExperience: z.enum(["0-1", "1-3", "3-5", "5-8", "8+"]),
  industry: z.string().optional().or(z.literal("")),
  hasEventManagementExperience: z.boolean().default(false),
  hasTeamLeadershipExperience: z.boolean().default(false),

  // Section D: Program Preferences
  whyJoinProgram: z.string().min(20, "Please share at least a couple of sentences"),
  careerGoals: z.string().min(10, "Please share your career goals"),
  howHeardAboutProgram: z.enum([
    "Social Media",
    "Email",
    "Website",
    "Referral",
    "Ad",
    "Other",
  ]),
  preferredBatch: z.enum(["Batch A: Mon-Thu", "Batch B: Tue-Fri"]),
  preferredWeekendCity: z.string().optional().or(z.literal("")),
  specialAccommodationNeeds: z.string().optional().or(z.literal("")),

  // Section E: Declaration & Consent
  declarationAccepted: z
    .boolean()
    .refine((v) => v === true, { message: "You must accept the declaration to submit" }),
  consentEmail: z.boolean().default(true),
  consentPhoneSms: z.boolean().default(true),
  consentWhatsApp: z.boolean().default(true),
  photoVideoConsent: z.boolean().default(true),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, { message: "You must accept the Terms & Conditions" }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const feedbackSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  role: z.enum([
    "Prospective Student",
    "Parent / Guardian",
    "Industry Professional",
    "Friend / Family Reviewer",
    "Other",
  ]),
  rating: z.enum(["1", "2", "3", "4", "5"]),
  pageReviewed: z.string().optional().or(z.literal("")),
  feedback: z.string().min(10, "Please share at least a couple of sentences of feedback"),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
