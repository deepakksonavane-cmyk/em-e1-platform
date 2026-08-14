export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  content: string[];
}

// Seed blog content grounded in the real E1 curriculum themes (see
// src/data/program-data.json / the syllabus document). Written in-house —
// swap in a real CMS or MDX pipeline as the content library grows.
export const blogPosts: BlogPost[] = [
  {
    slug: "5-skills-every-event-leader-needs",
    title: "5 Skills Every Event Leader Needs (That No One Teaches You)",
    excerpt:
      "Technical event skills get you in the door. These five leadership skills — covered across our Foundations and Team Leadership modules — are what get you promoted.",
    date: "2026-06-02",
    author: "E1 Faculty Team",
    readTime: "6 min read",
    tags: ["Leadership", "Career", "Foundations"],
    content: [
      "Most people who enter event management do it because they're good at logistics — timelines, vendors, spreadsheets. Fewer people enter it because they're good at leading a room of stressed-out crew members three hours before doors open. That second skill set is the one that actually determines whether you stay a coordinator or become a director.",
      "**1. Situational leadership.** No two crises call for the same leadership style. A load-in delay needs decisive, directive leadership. A creative disagreement between a client and your design team needs a much more collaborative touch. In our Foundations of Event Management & Leadership subject, students work through trait, behavioral, situational, and servant leadership models specifically as applied to live event scenarios — not abstract management theory.",
      "**2. Emotional intelligence under pressure.** Event days compress weeks of decision-making into hours. Reading a room, regulating your own stress response, and de-escalating conflict between vendors — these are trainable skills, not just personality traits. We dedicate a full session to EQ and conflict resolution models precisely because it shows up on every single event day.",
      "**3. Delegation that actually sticks.** Over-delegation leads to chaos; under-delegation leads to burnout. The skill is matching task complexity to team member readiness — and following up without micromanaging. Our Team Leadership & People Management module walks through delegation models, task prioritization, and authority/accountability frameworks with hands-on exercises.",
      "**4. Communication under ambiguity.** On event day, information is incomplete and changing by the minute. Leaders who thrive communicate clear, calm updates even when they don't have every answer yet. We treat this as a teachable skill through role-play and stakeholder communication matrices.",
      "**5. Decision-making with incomplete data.** You will never have perfect information when the vendor is late and doors open in 40 minutes. Building fast, defensible decision frameworks — including risk assessment and SWOT-style triage — is core to Module 1 of our curriculum and gets stress-tested again during our Weekend 2 live event simulation.",
      "These five skills don't show up on a typical event planning checklist, but they're what separates people who plan events from people who lead them.",
    ],
  },
  {
    slug: "building-an-event-budget-that-survives-contact-with-reality",
    title: "Building an Event Budget That Survives Contact With Reality",
    excerpt:
      "Cost sheets look tidy in a spreadsheet. Here's how our Event Planning & Budgeting subject teaches students to build budgets that hold up when vendors, scope, and timelines shift.",
    date: "2026-06-16",
    author: "E1 Faculty Team",
    readTime: "7 min read",
    tags: ["Budgeting", "Vendor Management", "Planning"],
    content: [
      "Every event budget looks perfect on the day you build it. The test is what happens six weeks later when the venue adds a mandatory security surcharge, your headline vendor increases their quote by 15%, and the client asks for one 'small' addition that touches five line items.",
      "**Start with fixed vs. variable costs, not a single lump number.** Venue rental, permits, and insurance are typically fixed. Catering, staffing, and F&B scale with guest count. Separating these early makes it much easier to model what happens if attendance shifts by 20% in either direction — a scenario our students practice directly in the Budgeting Basics & Cost Sheets session.",
      "**Build in a genuine contingency line, not a rounding buffer.** A 5-10% contingency isn't pessimism, it's professional practice. Students in our program build break-even analyses and profit margin models that explicitly account for this, rather than treating contingency as an afterthought.",
      "**Negotiate contracts, don't just accept quotes.** Our Venue Sourcing & Contract Negotiation session pairs directly with a live role-play exercise, because negotiation is a skill you only really learn by doing it under mild pressure with a partner pushing back.",
      "**Track ROI, not just spend.** A budget that comes in under-cost but delivers a disappointing event isn't actually a win. We teach income statements, P&L basics, and ROI calculation specifically so students can defend a budget decision in business terms — not just 'we saved money.'",
      "**Treat sponsorship as its own budgeting discipline.** Sponsorship isn't found money — it comes with deliverables, and mismanaging those deliverables damages the relationship for your next event. Our Sponsorship Acquisition & Management session covers sponsor packages, ROI framing for sponsors, and the agreements that protect both sides.",
      "A budget that survives contact with reality isn't the one with the lowest number — it's the one built with enough structural flexibility to absorb the inevitable surprises without blowing up the client relationship.",
    ],
  },
  {
    slug: "hybrid-events-what-actually-changed-since-2020",
    title: "Hybrid Events: What Actually Changed Since 2020 (And What Didn't)",
    excerpt:
      "Virtual event fatigue is real, but hybrid production is now a permanent category. A look at what our Digital & Virtual Events module teaches about running both audiences well.",
    date: "2026-07-01",
    author: "E1 Faculty Team",
    readTime: "5 min read",
    tags: ["Digital Events", "Hybrid Production", "Technology"],
    content: [
      "The early 2020s produced a wave of virtual events built by teams learning the tools in real time. Five years on, hybrid production has matured into its own discipline — with its own production standards, its own failure modes, and its own audience expectations.",
      "**The core mistake is still treating the remote audience as an afterthought.** A camera pointed at a stage is not a hybrid event; it's a livestream of an in-person event. Real hybrid design plans distinct engagement paths — polls, breakout rooms, dedicated moderators — for the remote audience from the outset. This is exactly the distinction we draw in our Hybrid Event Production session.",
      "**Platform choice matters more than most planners assume.** Zoom, Hopin, and Airmeet solve different problems — webinar-style broadcast versus networking-style breakout interaction versus large-scale exhibition halls. Our platform evaluation exercise has students match platform features to event objectives before touching a single setting.",
      "**Engagement tooling needs a plan, not just access.** Polls and Q&A features sitting unused are worse than not having them — they signal a passive audience. We teach virtual engagement techniques as a designed sequence across an agenda, not a box to check.",
      "**Post-event data now matters as much as the live event itself.** Because virtual and hybrid formats generate rich attendance and engagement data, event teams are increasingly judged on the analytics dashboard they can produce afterward — not just anecdotal feedback. Our Data Analytics & Event KPIs session treats this as a core deliverable, not a nice-to-have.",
      "What hasn't changed: a poorly run in-person component will sink a hybrid event just as fast as bad streaming quality. Hybrid production adds a discipline on top of solid in-person execution — it doesn't replace it.",
    ],
  },
  {
    slug: "from-coordinator-to-entrepreneur-pricing-your-first-event-business",
    title: "From Coordinator to Entrepreneur: Pricing Your First Event Business",
    excerpt:
      "Thinking about going independent? Our Business & Entrepreneurship module covers the unglamorous parts — legal structure, GST, and pricing — that decide whether your business survives year one.",
    date: "2026-07-20",
    author: "E1 Faculty Team",
    readTime: "6 min read",
    tags: ["Entrepreneurship", "Business", "Pricing"],
    content: [
      "Most event professionals who go independent do it because they're good at events — not because they're excited about GST registration. Unfortunately, the second one determines whether the first one is sustainable.",
      "**Pick a legal structure that matches your risk, not just your ambition.** Sole proprietorship is simple but exposes personal assets to business liability; an LLC or private limited structure adds complexity but limits that exposure. Our Legal Structures session walks through the tradeoffs so students choose deliberately rather than defaulting to whatever a friend used.",
      "**Understand GST and invoicing before your first client, not after your first audit.** Late or incorrect GST filing is one of the most common (and avoidable) reasons small event businesses run into trouble with compliance. We treat this as a practical exercise, not a lecture — students walk through actual invoicing and filing mechanics.",
      "**Price for value, not just hours.** Cost-plus pricing is easy to calculate and easy to undercut. Value-based and tiered pricing models let you capture what a successful event is actually worth to a client — but they require you to be able to articulate that value in a proposal. Our Pricing Strategies session covers all four major models side by side.",
      "**Contracts protect the relationship, not just the money.** Force majeure clauses, liability limits, and clear termination terms aren't about distrust — they're what allows a client relationship to survive a disagreement instead of ending it. We review real contract clauses in our Contracts session so students recognize what's missing before they sign (or send) anything.",
      "**Your portfolio is your pricing leverage.** Nothing lets you charge more convincingly than a track record of documented outcomes. Building that portfolio — case studies, testimonials, visual proof of work — is why we treat portfolio-building as a graded deliverable, not an optional extra, in our capstone-adjacent sessions.",
      "None of this is as fun as designing your first stage layout. All of it is what decides whether you're still in business eighteen months later.",
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
