/**
 * FAQ content for the /faq page.
 *
 * Written to answer what a prospective student (and the parent or partner
 * often co-deciding with them) actually worries about before applying to a
 * first-of-its-kind diploma: is this legitimate, can I afford it, will it
 * fit around my life, and what do I actually get at the end. Every figure
 * here is pulled from the real program data (src/lib/program.ts,
 * src/lib/payment.ts, src/components/apply/ApplicationForm.tsx) — nothing
 * is invented (no fabricated accreditation claims, placement guarantees,
 * or EMI plans that don't exist in the application flow).
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    id: "admissions",
    title: "Admissions & Eligibility",
    items: [
      {
        question: "Who is this diploma for?",
        answer:
          "E1 is built for two kinds of people: recent 12th-pass or graduate students who want a direct, practical route into the events industry, and working professionals who want to move into event management or team leadership from an unrelated field. You don't need prior event experience to apply — the application form asks about it, but it's optional, not a requirement.",
      },
      {
        question: "What are the minimum qualifications to apply?",
        answer:
          "You need to have completed at least 12th grade (higher secondary). The application accepts 12th pass, graduation, or post-graduation as your highest qualification, and asks you to upload the relevant marksheet or certificate — 10th marksheet, 12th marksheet, and graduation or post-graduation certificate where applicable.",
      },
      {
        question: "Is there an entrance test or interview?",
        answer:
          "No written entrance test. Admission is based on your completed application — personal details, educational background, and professional information — plus payment of the application fee. If anything in your application needs clarifying, our admissions team will reach out directly using the contact details you provide.",
      },
      {
        question: "Is there an age limit, or can working professionals apply?",
        answer:
          "There's no upper age limit built into the application. It's designed to work for recent graduates and career-changing professionals alike — the live sessions run in the evenings/weekends where possible and the format is built around people balancing this with other commitments. If you have a specific situation you're unsure about, reach out on the Contact page before applying.",
      },
    ],
  },
  {
    id: "program",
    title: "Program & Curriculum",
    items: [
      {
        question: "How long is the program and how is it structured?",
        answer:
          "24 weeks (about 6 months), totaling 420 training hours across 6 subjects and 74 live sessions, taught by 6 specialist lecturers — each owning one core discipline, from foundations and budgeting through marketing, production, digital events, and business strategy. You can see the full session-by-session breakdown on the Program page.",
      },
      {
        question: "Is this online, in-person, or both?",
        answer:
          "Blended. Live online classes run through the week, and on top of that there are 3 full in-person weekends: an opening team-building weekend, a mid-program full-scale event simulation, and a graduation weekend where you pitch your capstone project to a panel. There's also a mandatory internship component built into the program.",
      },
      {
        question: "What do I actually build or produce during the program?",
        answer:
          "Weekly assignments, 8 in-depth case studies, a real internship, and a capstone event proposal that you pitch live to a panel of experts at the end. The goal is that you leave with a portfolio of real, demonstrable work — not just a transcript.",
      },
      {
        question: "What's the attendance requirement?",
        answer:
          "80% attendance for live online sessions, and 100% attendance for the 3 in-person weekends. Both are mandatory to be eligible for certification — this is stated explicitly in the program's terms and conditions at the time of application.",
      },
    ],
  },
  {
    id: "fees",
    title: "Fees & Payment",
    items: [
      {
        question: "What does the program cost, in total?",
        answer:
          "₹1,30,000 in total: a ₹10,000 application fee paid at the time you apply, plus a ₹1,20,000 program fee that covers all 6 subjects, all 74 sessions, and all 3 in-person weekends. There are no hidden add-on fees for course material or the in-person weekends — they're included in the program fee.",
      },
      {
        question: "Is the application fee refundable?",
        answer:
          "No — the ₹10,000 application fee is explicitly non-refundable, whether or not your application is ultimately accepted. This is disclosed on the Program page and again before you submit payment during application.",
      },
      {
        question: "What's the refund policy if I start and then need to drop out?",
        answer:
          "Per the program's terms and conditions (shown and accepted during application), fees are non-refundable once the program has started. If your circumstances change before the program begins, contact admissions directly to discuss your options — but budget on the assumption that fees are final once cohort begins.",
      },
      {
        question: "Can I pay in installments?",
        answer:
          "The current application flow processes the program fee as a single online payment at the time of application — there isn't an installment or EMI option built into checkout today. If a payment plan would make the difference for you, reach out through the Contact page before applying; it's worth asking rather than assuming the answer is no.",
      },
      {
        question: "Is my certificate fee included, or is that separate?",
        answer:
          "Certification is issued after full fee clearance and completion of the attendance and assessment requirements — it isn't a separate line-item fee on top of the ₹1,30,000 total.",
      },
    ],
  },
  {
    id: "outcomes",
    title: "Careers, Outcomes & Credibility",
    items: [
      {
        question: "Has this program graduated students before? What about placements?",
        answer:
          "We're being upfront about this: E1 has not yet graduated its first batch, so we don't have alumni outcomes, placement statistics, or testimonials to show you yet — and we'd rather tell you that plainly than fabricate quotes or numbers. What we can show you is exactly what the curriculum is built to prepare you for — see the Career Pathways page, which maps each of the 8 realistic post-diploma roles directly back to the subjects and skills that teach them.",
      },
      {
        question: "What kind of roles does this diploma actually prepare me for?",
        answer:
          "Eight pathways the curriculum is explicitly designed around: Corporate Event Manager, Wedding & Social Events Planner, MICE & Conference Executive, Event Marketing & Brand Specialist, Sponsorship & Partnerships Lead, Hybrid & Virtual Event Producer, Venue & Hospitality Manager, and Independent Event Entrepreneur. Full detail — including which skills and subjects feed each one — is on the Career Pathways page.",
      },
      {
        question: "Who teaches the program, and what are their credentials?",
        answer:
          "Six specialist lecturers, each responsible for one full subject area rather than a single guest lecture — spanning foundations and leadership, planning and budgeting, marketing and branding, production and logistics, digital/hybrid events, and business and entrepreneurship. Full instructor bios are being finalized and will be published on the Faculty page as they're confirmed.",
      },
      {
        question: "Is this diploma accredited or recognized by a governing body?",
        answer:
          "We haven't listed a specific accrediting body on this site, and we'd rather you ask us directly than assume one. If formal recognition or accreditation matters for your specific career or visa situation, contact admissions before applying so we can give you an accurate, current answer.",
      },
    ],
  },
  {
    id: "logistics",
    title: "Applying & Logistics",
    items: [
      {
        question: "How do I apply?",
        answer:
          "Head to the Apply page and complete the form in one sitting — personal details, education history, professional background, program preferences, and document upload (10th/12th marksheets and graduation certificate where applicable), followed by the ₹10,000 application fee payment online. You'll receive an application ID and confirmation once it's submitted.",
      },
      {
        question: "Where are the in-person weekends held?",
        answer:
          "Location details for the 3 in-person weekends are shared with accepted applicants ahead of each weekend. If travel logistics affect your decision to apply, reach out via the Contact page and we'll give you specifics before you commit.",
      },
      {
        question: "What do I need to attend the live online sessions?",
        answer:
          "A reliable internet connection and a laptop or desktop are effectively required — the live sessions, case study work, and assignments are built around a proper working setup rather than a phone-only experience.",
      },
      {
        question: "I still have a question that isn't answered here — who do I contact?",
        answer:
          "The Contact page has our email, phone, and WhatsApp details, and admissions typically responds within 1–2 business days. Genuinely — if something here is unclear or you're on the fence, ask before you apply rather than after.",
      },
    ],
  },
];
