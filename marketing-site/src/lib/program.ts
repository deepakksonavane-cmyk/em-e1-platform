import raw from "@/data/program-data.json";

export interface ProgramOverview {
  programName: string;
  programCode: string;
  durationWeeks: number;
  durationMonths: number;
  totalHours: number;
  totalSessions: number;
  totalSubjects: number;
  totalLecturers: number;
  mode: string;
  level: string;
  attendancePolicy: string;
  gradingScale: { grade: string; range: string }[];
  keyDates: { event: string; week: number | string }[];
}

export interface Subject {
  code: string;
  name: string;
  lecturer: string;
  sessions: number;
  hours: number;
  weeks: string;
}

export interface Session {
  sessionNumber: number;
  code: string;
  week: number;
  day: string;
  module: string;
  moduleName: string;
  subjectCode: string;
  topic: string;
  hours: number;
  keyTopics: string[];
  teachingMethod: string;
  assessment: string;
  resources: string;
}

export interface Weekend {
  code: string;
  name: string;
  week: number;
  focus: string;
  days: { day: string; hours: number }[];
  totalHours: number;
  activities: string[];
}

export interface Assessments {
  weeklyAssignments: { count: number; hoursEach: number; weightage: number; description: string };
  caseStudies: { count: number; hoursEach: number; weightage: number; description: string };
  internshipReport: { weightage: number; minHours: number; description: string };
  capstoneProject: { weightage: number; description: string };
  classParticipation: { weightage: number; description: string };
  finalEvaluation: { weightage: number; description: string };
}

interface ProgramData {
  program: ProgramOverview;
  subjects: Subject[];
  sessions: Session[];
  weekends: Weekend[];
  assessments: Assessments;
}

const data = raw as ProgramData;

export const program = data.program;
export const subjects = data.subjects;
export const sessions = data.sessions;
export const weekends = data.weekends;
export const assessments = data.assessments;

export function getSessionsForSubject(subjectCode: string): Session[] {
  return sessions
    .filter((s) => s.subjectCode === subjectCode)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);
}

/**
 * Lecturer specialization blurbs.
 *
 * PLACEHOLDER CONTENT — the training institute has not yet supplied real
 * faculty photos, bios, or credentials for Lecturers 1-6. These profiles are
 * generated from each lecturer's assigned subject area so the Faculty page
 * is content-rich for launch, and MUST be replaced with real bios/photos
 * before this site goes live.
 */
export const lecturerProfiles = [
  {
    id: "lecturer-1",
    name: "Lecturer 1",
    subjectCode: "E1-S1",
    title: "Foundations of Event Management & Leadership",
    specialization:
      "Event industry fundamentals, leadership theory, and high-performance team building",
    bio: "Lecturer 1 anchors the program's opening module, guiding students through the event lifecycle, leadership styles, and the emotional intelligence skills every event leader needs before they plan a single session.",
  },
  {
    id: "lecturer-2",
    name: "Lecturer 2",
    subjectCode: "E1-S2",
    title: "Event Planning & Budgeting specialist",
    specialization:
      "Cost sheets, venue negotiation, vendor management, sponsorship and financial ROI for events",
    bio: "Lecturer 2 brings a finance-first lens to event planning, teaching students to build budgets, negotiate venue contracts, and secure sponsorships that make events commercially viable.",
  },
  {
    id: "lecturer-3",
    name: "Lecturer 3",
    subjectCode: "E1-S3",
    title: "Marketing & Branding for Events specialist",
    specialization:
      "Pre-event marketing, PR, event branding, organic social and paid ad campaigns for ticketing",
    bio: "Lecturer 3 leads students through building marketing funnels, PR strategy, and paid/organic campaigns that fill seats and build buzz before an event ever opens its doors.",
  },
  {
    id: "lecturer-4",
    name: "Lecturer 4",
    subjectCode: "E1-S4",
    title: "Event Production, Operations & Logistics specialist",
    specialization:
      "Stage design, AV technology, run-of-show creation, staffing, security and on-ground logistics",
    bio: "Lecturer 4 is the operational backbone of the curriculum, covering everything from stage floor plans and AV setups to load-in/load-out logistics and emergency response planning.",
  },
  {
    id: "lecturer-5",
    name: "Lecturer 5",
    subjectCode: "E1-S5",
    title: "Team Leadership & Digital Events specialist",
    specialization:
      "People management, crisis leadership, hybrid/virtual event production, and event analytics",
    bio: "Lecturer 5 blends people-leadership training with digital event production, preparing students to lead diverse teams and produce virtual, hybrid, and data-driven events.",
  },
  {
    id: "lecturer-6",
    name: "Lecturer 6",
    subjectCode: "E1-S6",
    title: "Business, Entrepreneurship & Career Development specialist",
    specialization:
      "Client pitching, legal structures, pricing strategy, specialized event types, and career development",
    bio: "Lecturer 6 closes out the program with the business of events — proposals, pricing, legal structures — plus deep dives into weddings, corporate events, festivals, and career planning.",
  },
];

export function getLecturerForSubject(subjectCode: string) {
  return lecturerProfiles.find((l) => l.subjectCode === subjectCode);
}
