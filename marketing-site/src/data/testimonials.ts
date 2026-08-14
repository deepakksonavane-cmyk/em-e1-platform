/**
 * PLACEHOLDER TESTIMONIALS
 * ------------------------
 * These are illustrative sample testimonials written to reflect the real
 * program structure (weekends, capstone, internship, specific subjects).
 * They are NOT real student quotes. Replace every entry here with actual
 * graduate testimonials (with consent) before this site goes live —
 * see the Photo & Video / testimonial consent clause captured in the
 * Student Registration Form.
 */
export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  batch?: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Ananya R.",
    role: "Freelance Event Producer, Batch E1-2025-A",
    quote:
      "The mid-program weekend simulation was the turning point for me — running a live mock event under a countdown clock taught me more about crisis management than any lecture could. I walked into my internship already knowing how to hold a run-of-show together.",
  },
  {
    name: "Vikram S.",
    role: "Corporate Events Coordinator, Batch E1-2024-B",
    quote:
      "I came in knowing how to plan a party and left knowing how to run a P&L, negotiate a venue contract, and pitch a sponsorship deck. The budgeting and business modules alone were worth the six months.",
  },
  {
    name: "Priya M.",
    role: "Wedding & Social Events Planner, Batch E1-2024-A",
    quote:
      "Presenting my capstone event proposal to an actual panel of industry judges was terrifying and exactly the kind of pressure-test I needed before doing it for real clients.",
  },
  {
    name: "Rohan K.",
    role: "MICE & Conference Executive, Batch E1-2025-A",
    quote:
      "The digital and hybrid events module came at exactly the right time — I used what I learned about hybrid production to run my company's first hybrid conference within weeks of graduating.",
  },
  {
    name: "Sneha D.",
    role: "Independent Event Entrepreneur, Batch E1-2023-B",
    quote:
      "Learning the legal structures and GST compliance side of running an event business gave me the confidence to finally register my own company instead of freelancing under someone else's license.",
  },
  {
    name: "Farhan A.",
    role: "Team Lead, Festival Operations, Batch E1-2024-B",
    quote:
      "Six lecturers, six specialties — you can genuinely feel the difference between the operations-focused sessions and the leadership-focused ones. Nothing felt like filler.",
  },
];
