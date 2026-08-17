/**
 * CAREER PATHWAYS
 * ----------------
 * This replaces the old placeholder "Testimonials" page. Since the program
 * has not yet run its first batch, there are no real graduate outcomes or
 * quotes to show yet — instead of fabricating student stories, this page
 * honestly shows the career pathways the curriculum is designed to prepare
 * students for, grounded in the actual subjects taught (see
 * src/lib/program.ts / program-data.json).
 *
 * Icons are simple inline SVGs (no stock photos of "students" — the
 * program hasn't started, so there are no real student photos to use).
 */

export interface CareerPathway {
  id: string;
  title: string;
  icon: "briefcase" | "heart" | "building" | "megaphone" | "handshake" | "video" | "hotel" | "rocket";
  summary: string;
  skillsApplied: string[];
  relatedSubjectCodes: string[];
}

export const careerPathways: CareerPathway[] = [
  {
    id: "corporate-events",
    title: "Corporate Event Manager",
    icon: "briefcase",
    summary:
      "Plan and run product launches, conferences, and internal company events — owning budgets, vendors, and stakeholder sign-off from brief to breakdown.",
    skillsApplied: ["Budgeting & vendor negotiation", "Run-of-show creation", "Stakeholder & client management"],
    relatedSubjectCodes: ["E1-S2", "E1-S4"],
  },
  {
    id: "wedding-social",
    title: "Wedding & Social Events Planner",
    icon: "heart",
    summary:
      "Design and execute weddings, milestone celebrations, and private social events — balancing a client's vision with real-world logistics and cost sheets.",
    skillsApplied: ["Client & vendor coordination", "Cost sheets & contracts", "On-ground production"],
    relatedSubjectCodes: ["E1-S2", "E1-S4", "E1-S6"],
  },
  {
    id: "mice-conference",
    title: "MICE & Conference Executive",
    icon: "building",
    summary:
      "Work in meetings, incentives, conferences, and exhibitions — coordinating multi-day programs, delegate logistics, and exhibitor relations at scale.",
    skillsApplied: ["Large-scale logistics", "Delegate & exhibitor management", "Cross-team coordination"],
    relatedSubjectCodes: ["E1-S1", "E1-S4"],
  },
  {
    id: "marketing-brand",
    title: "Event Marketing & Brand Specialist",
    icon: "megaphone",
    summary:
      "Drive pre-event buzz, ticketing campaigns, and brand partnerships — using PR, paid, and organic channels to fill seats before doors open.",
    skillsApplied: ["Campaign planning", "PR & social strategy", "Brand positioning"],
    relatedSubjectCodes: ["E1-S3"],
  },
  {
    id: "sponsorship-partnerships",
    title: "Sponsorship & Partnerships Lead",
    icon: "handshake",
    summary:
      "Build and pitch sponsorship decks, negotiate partner deals, and manage the relationships that make large events commercially viable.",
    skillsApplied: ["Sponsorship pitching", "ROI & financial modelling", "Contract negotiation"],
    relatedSubjectCodes: ["E1-S2", "E1-S6"],
  },
  {
    id: "hybrid-virtual",
    title: "Hybrid & Virtual Event Producer",
    icon: "video",
    summary:
      "Produce livestreamed and hybrid events — managing digital platforms, remote audiences, and the tech stack alongside the in-room experience.",
    skillsApplied: ["Hybrid production", "Digital platform management", "Event analytics"],
    relatedSubjectCodes: ["E1-S5"],
  },
  {
    id: "venue-hospitality",
    title: "Venue & Hospitality Manager",
    icon: "hotel",
    summary:
      "Manage venues, hotels, or dedicated event spaces — handling bookings, on-site operations, and the vendor network that keeps a venue running.",
    skillsApplied: ["Operations & logistics", "Vendor management", "On-site team leadership"],
    relatedSubjectCodes: ["E1-S1", "E1-S4"],
  },
  {
    id: "entrepreneur",
    title: "Independent Event Entrepreneur",
    icon: "rocket",
    summary:
      "Start your own event planning or production business — from legal structure and pricing strategy to your first client pitch.",
    skillsApplied: ["Business & legal structures", "Pricing strategy", "Client pitching"],
    relatedSubjectCodes: ["E1-S6"],
  },
];
