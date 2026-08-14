import { AssessmentType, AttendanceStatus, SubmissionStatus, StudentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Standalone PrismaClient (not lib/prisma.ts's singleton) since this script
// runs outside the Next.js process. Uses the same driver-adapter pattern —
// see lib/prisma.ts for why (engineType = "client" in prisma/schema.prisma).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_DATA_PATH = path.resolve(__dirname, "../../shared/seed-data.json");
const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, "utf-8"));

const DAY_OFFSET: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

// Program start: Week 1 Monday. Weekend 1 falls on the Fri-Sun of week 1.
const PROGRAM_START = new Date("2026-02-02T00:00:00Z"); // Monday

function dateForWeekDay(week: number, day: string): Date {
  const monday = new Date(PROGRAM_START);
  monday.setUTCDate(monday.getUTCDate() + (week - 1) * 7);
  const offset = DAY_OFFSET[day] ?? 0;
  const d = new Date(monday);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
}

interface LecturerProfile {
  name: string;
  email: string;
  specialization: string;
  bio: string;
}

const LECTURER_PROFILES: Record<string, LecturerProfile> = {
  "E1-S1": {
    name: "Priya Nair",
    email: "priya.nair@em-e1.edu",
    specialization: "Event Management Fundamentals & Leadership Development",
    bio: "15+ years leading corporate and social events across India; former Head of Events at a national hospitality group. Specializes in industry foundations and leadership pedagogy.",
  },
  "E1-S2": {
    name: "Arjun Mehta",
    email: "arjun.mehta@em-e1.edu",
    specialization: "Event Planning, Budgeting & Financial Management",
    bio: "Certified event planner and finance professional with a decade of experience building P&L models for large-scale conferences and weddings.",
  },
  "E1-S3": {
    name: "Sana Kapoor",
    email: "sana.kapoor@em-e1.edu",
    specialization: "Event Marketing, Branding & Digital Promotion",
    bio: "Brand strategist and digital marketer who has run promotional campaigns for MICE events, product launches, and music festivals.",
  },
  "E1-S4": {
    name: "Rohan Deshmukh",
    email: "rohan.deshmukh@em-e1.edu",
    specialization: "AV, Logistics & Production Management",
    bio: "Production manager with hands-on experience running stage, AV, vendor, and on-ground logistics for 200+ live events.",
  },
  "E1-S5": {
    name: "Ananya Iyer",
    email: "ananya.iyer@em-e1.edu",
    specialization: "Team Leadership & Virtual/Hybrid Event Technology",
    bio: "Organizational psychologist turned event technologist, specializing in team leadership, crisis management, and hybrid/virtual event platforms.",
  },
  "E1-S6": {
    name: "Vikram Rao",
    email: "vikram.rao@em-e1.edu",
    specialization: "Entrepreneurship, Business Strategy & Career Coaching",
    bio: "Serial entrepreneur and career coach who has founded two event-tech startups; mentors students through capstone projects and internships.",
  },
};

const DEMO_PASSWORD = "Faculty@2026";

const DEMO_STUDENTS = [
  { studentId: "E1-001", name: "Ishita Sharma", email: "ishita.sharma@student.em-e1.edu", batch: "Batch A", city: "Mumbai", state: "Maharashtra" },
  { studentId: "E1-002", name: "Karan Malhotra", email: "karan.malhotra@student.em-e1.edu", batch: "Batch A", city: "Delhi", state: "Delhi" },
  { studentId: "E1-003", name: "Divya Reddy", email: "divya.reddy@student.em-e1.edu", batch: "Batch A", city: "Hyderabad", state: "Telangana" },
  { studentId: "E1-004", name: "Aditya Kulkarni", email: "aditya.kulkarni@student.em-e1.edu", batch: "Batch A", city: "Pune", state: "Maharashtra" },
  { studentId: "E1-005", name: "Meera Pillai", email: "meera.pillai@student.em-e1.edu", batch: "Batch B", city: "Bengaluru", state: "Karnataka" },
  { studentId: "E1-006", name: "Farhan Sheikh", email: "farhan.sheikh@student.em-e1.edu", batch: "Batch B", city: "Ahmedabad", state: "Gujarat" },
  { studentId: "E1-007", name: "Neha Joshi", email: "neha.joshi@student.em-e1.edu", batch: "Batch B", city: "Jaipur", state: "Rajasthan" },
  { studentId: "E1-008", name: "Siddharth Menon", email: "siddharth.menon@student.em-e1.edu", batch: "Batch B", city: "Kochi", state: "Kerala" },
  { studentId: "E1-009", name: "Ritika Bansal", email: "ritika.bansal@student.em-e1.edu", batch: "Batch A", city: "Chandigarh", state: "Punjab" },
  { studentId: "E1-010", name: "Yash Agarwal", email: "yash.agarwal@student.em-e1.edu", batch: "Batch B", city: "Lucknow", state: "Uttar Pradesh" },
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rubricFor(type: AssessmentType, title: string) {
  const base = [
    { name: "Content Quality & Depth", points: 30, description: "Demonstrates thorough understanding and original analysis of the topic." },
    { name: "Structure & Clarity", points: 20, description: "Well-organized, logically sequenced, and clearly communicated." },
    { name: "Application to Real-World Events", points: 25, description: "Connects concepts to practical, real-world event scenarios." },
    { name: "Presentation / Formatting", points: 15, description: "Professional formatting, visuals, and adherence to submission guidelines." },
    { name: "Timeliness", points: 10, description: "Submitted on or before the due date." },
  ];
  if (type === "CAPSTONE") {
    return {
      criteria: [
        { name: "Event Concept & Feasibility", points: 20, description: "Originality and feasibility of the proposed event concept." },
        { name: "Budget & Financial Plan", points: 15, description: "Realistic, detailed budget with revenue and cost projections." },
        { name: "Marketing & Branding Strategy", points: 15, description: "Comprehensive marketing plan aligned with target audience." },
        { name: "Operations & Logistics Plan", points: 20, description: "Detailed run-of-show, vendor, and logistics planning." },
        { name: "Pitch Delivery to Panel", points: 20, description: "Clarity, confidence, and persuasiveness of the live pitch." },
        { name: "Q&A Handling", points: 10, description: "Ability to field panel questions with sound reasoning." },
      ],
    };
  }
  if (type === "INTERNSHIP_REPORT") {
    return {
      criteria: [
        { name: "Hours & Task Log Completeness", points: 20, description: "Minimum 30 hours logged with detailed activity descriptions." },
        { name: "Reflection & Learning Outcomes", points: 30, description: "Depth of reflection on skills gained and challenges faced." },
        { name: "Supervisor Evaluation", points: 30, description: "Quality of feedback and rating from the host organization supervisor." },
        { name: "Report Quality", points: 20, description: "Professional writing, structure, and supporting evidence (photos/documents)." },
      ],
    };
  }
  return { criteria: base, title };
}

async function main() {
  console.log("Seeding EM&TL E1 Faculty Admin Panel database...\n");

  // ---- 1. Faculty + Subjects -------------------------------------------------
  const facultyBySubjectCode: Record<string, string> = {};

  for (const subj of seedData.subjects) {
    const profile = LECTURER_PROFILES[subj.code];
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {},
      create: {
        email: profile.email,
        passwordHash,
        role: "FACULTY",
        name: profile.name,
        phone: `+91-9${Math.floor(100000000 + Math.random() * 899999999)}`,
      },
    });

    const facultyIdCode = `FAC-${subj.code.split("-")[1]}`;
    const faculty = await prisma.faculty.upsert({
      where: { userId: user.id },
      update: { specialization: profile.specialization, bio: profile.bio },
      create: {
        facultyId: facultyIdCode,
        userId: user.id,
        specialization: profile.specialization,
        bio: profile.bio,
      },
    });

    facultyBySubjectCode[subj.code] = faculty.id;

    await prisma.subject.upsert({
      where: { code: subj.code },
      update: {
        name: subj.name,
        lecturerId: faculty.id,
        totalSessions: subj.sessions,
        totalHours: subj.hours,
        weeksLabel: subj.weeks,
      },
      create: {
        code: subj.code,
        name: subj.name,
        lecturerId: faculty.id,
        totalSessions: subj.sessions,
        totalHours: subj.hours,
        weeksLabel: subj.weeks,
      },
    });

    console.log(`  Subject ${subj.code} → ${profile.name} (${profile.email})`);
  }

  // Also create one program admin account (department head).
  const adminPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@em-e1.edu" },
    update: {},
    create: {
      email: "admin@em-e1.edu",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      name: "Dr. Kavita Rao",
      phone: "+91-9876500000",
    },
  });
  const adminFaculty = await prisma.faculty.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      facultyId: "FAC-ADMIN",
      userId: adminUser.id,
      specialization: "Program Director — Event Management & Team Leadership E1",
      bio: "Oversees curriculum delivery, faculty coordination, and program quality across all six subjects.",
    },
  });

  // ---- 2. Sessions ------------------------------------------------------------
  const subjectRecords = await prisma.subject.findMany();
  const subjectByCode = Object.fromEntries(subjectRecords.map((s) => [s.code, s]));

  const now = new Date();

  for (const sess of seedData.sessions) {
    const subject = subjectByCode[sess.subjectCode];
    const facultyId = facultyBySubjectCode[sess.subjectCode];
    const scheduledDate = dateForWeekDay(sess.week, sess.day);

    let status: string = "upcoming";
    if (scheduledDate < now) status = "completed";
    else if (Math.abs(scheduledDate.getTime() - now.getTime()) < 1000 * 60 * 60 * 24) status = "live";

    await prisma.session.upsert({
      where: { sessionNumber: sess.sessionNumber },
      update: {},
      create: {
        sessionNumber: sess.sessionNumber,
        code: sess.code,
        week: sess.week,
        day: sess.day,
        module: sess.module,
        moduleName: sess.moduleName,
        topic: sess.topic,
        hours: sess.hours,
        keyTopics: sess.keyTopics,
        teachingMethod: sess.teachingMethod,
        assessmentNote: sess.assessment,
        resources: sess.resources,
        scheduledDate,
        startTime: "18:00",
        endTime: `${18 + sess.hours}:00`,
        meetingLink: `https://meet.google.com/em-e1-${sess.code.toLowerCase()}`,
        status,
        subjectId: subject.id,
        facultyId,
      },
    });
  }
  console.log(`  Seeded ${seedData.sessions.length} sessions.`);

  // Add sample materials to a handful of completed sessions.
  const completedSessions = await prisma.session.findMany({ where: { status: "completed" }, take: 15 });
  for (const s of completedSessions) {
    const existing = await prisma.material.count({ where: { sessionId: s.id } });
    if (existing > 0) continue;
    await prisma.material.createMany({
      data: [
        { sessionId: s.id, title: `${s.code} — Slide Deck`, type: "slides", url: `https://drive.example.com/slides/${s.code}` },
        { sessionId: s.id, title: `${s.code} — Session Notes`, type: "notes", url: `https://drive.example.com/notes/${s.code}` },
        { sessionId: s.id, title: `${s.code} — Recording`, type: "recording", url: `https://recordings.example.com/${s.code}` },
      ],
    });
  }

  // ---- 3. Weekends --------------------------------------------------------------
  for (const wk of seedData.weekends) {
    const friDate = dateForWeekDay(wk.week, "Friday");
    const sunDate = dateForWeekDay(wk.week, "Sunday");
    await prisma.weekend.upsert({
      where: { code: wk.code },
      update: {},
      create: {
        code: wk.code,
        name: wk.name,
        week: wk.week,
        focus: wk.focus,
        totalHours: wk.totalHours,
        activities: wk.activities,
        venueName: "EM&TL E1 Residential Training Campus",
        venueAddress: "Plot 14, Knowledge Park, Whitefield, Bengaluru, Karnataka 560066",
        venueMapUrl: "https://maps.google.com/?q=Whitefield+Bengaluru",
        startDate: friDate,
        endDate: sunDate,
      },
    });
  }
  console.log(`  Seeded ${seedData.weekends.length} weekends.`);

  // ---- 4. Assessment Definitions --------------------------------------------------
  const assessmentDefs: { id: string; type: AssessmentType; subjectCode: string | null }[] = [];

  const assignmentSubjects = ["E1-S1", "E1-S2", "E1-S3", "E1-S4", "E1-S5", "E1-S6"];
  const assignmentTitles = [
    "Assignment 1: Event Concept Brief",
    "Assignment 2: Budget & Cost Estimation Worksheet",
    "Assignment 3: Marketing & Social Media Plan",
    "Assignment 4: Vendor & Logistics Run-Sheet",
    "Assignment 5: Team Roles & Crisis Response Plan",
    "Assignment 6: Business Model Canvas for an Event Venture",
  ];
  for (let i = 0; i < seedData.assessments.weeklyAssignments.count; i++) {
    const subjectCode = assignmentSubjects[i];
    const def = await prisma.assessmentDefinition.create({
      data: {
        type: "ASSIGNMENT",
        title: assignmentTitles[i],
        description: `Practical task applying concepts from ${subjectByCode[subjectCode].name} to a real or simulated event.`,
        guidelines: "Submit as a PDF or shared document link. 2-4 pages. Cite any external sources used.",
        subjectCode,
        maxScore: 100,
        weightagePercent:
          Math.round(
            (seedData.assessments.weeklyAssignments.weightage / seedData.assessments.weeklyAssignments.count) * 100
          ) / 100,
        dueOffsetWeek: 3 + i * 3,
        rubric: rubricFor("ASSIGNMENT" as AssessmentType, assignmentTitles[i]),
      },
    });
    assessmentDefs.push({ id: def.id, type: "ASSIGNMENT", subjectCode });
  }

  const caseStudySubjects = ["E1-S1", "E1-S1", "E1-S2", "E1-S3", "E1-S4", "E1-S4", "E1-S5", "E1-S6"];
  const caseStudyTitles = [
    "Case Study 1: Corporate Conference Gone Wrong — Root Cause Analysis",
    "Case Study 2: MICE Event Success — What Made It Work",
    "Case Study 3: Budget Overrun at a Destination Wedding",
    "Case Study 4: Viral Marketing Campaign for a Music Festival",
    "Case Study 5: Vendor Failure During a Live Product Launch",
    "Case Study 6: Large-Scale Logistics for a Multi-Day Sports Event",
    "Case Study 7: Leading a Remote Team Through a Hybrid Conference",
    "Case Study 8: Scaling an Event Startup — Growth & Pivot Strategy",
  ];
  for (let i = 0; i < seedData.assessments.caseStudies.count; i++) {
    const subjectCode = caseStudySubjects[i];
    const def = await prisma.assessmentDefinition.create({
      data: {
        type: "CASE_STUDY",
        title: caseStudyTitles[i],
        description: `Analyze a real-world event industry case study relevant to ${subjectByCode[subjectCode].name}, and propose recommendations.`,
        guidelines: "Structure your analysis as: Background, Problem Identification, Analysis, Recommendations. 3-5 pages.",
        subjectCode,
        maxScore: 100,
        weightagePercent:
          Math.round((seedData.assessments.caseStudies.weightage / seedData.assessments.caseStudies.count) * 100) /
          100,
        dueOffsetWeek: 4 + i * 2,
        rubric: rubricFor("CASE_STUDY" as AssessmentType, caseStudyTitles[i]),
      },
    });
    assessmentDefs.push({ id: def.id, type: "CASE_STUDY", subjectCode });
  }

  const capstoneDef = await prisma.assessmentDefinition.create({
    data: {
      type: "CAPSTONE",
      title: "Capstone Project: Full Event Proposal & Pitch Deck",
      description: "Design a complete event proposal — concept, budget, marketing, operations, and logistics — and pitch it live to a panel of industry experts during Weekend 3.",
      guidelines: "Deliverables: written proposal (10-15 pages) + pitch deck (10-15 slides) + 8-10 minute live presentation.",
      subjectCode: null,
      maxScore: 100,
      weightagePercent: seedData.assessments.capstoneProject.weightage,
      dueOffsetWeek: 24,
      rubric: rubricFor("CAPSTONE" as AssessmentType, "Capstone Project"),
    },
  });
  assessmentDefs.push({ id: capstoneDef.id, type: "CAPSTONE", subjectCode: null });

  const internshipDef = await prisma.assessmentDefinition.create({
    data: {
      type: "INTERNSHIP_REPORT",
      title: "Internship Report: Real-World Event Experience",
      description: "Complete a minimum 30-hour internship or practicum with an event organization and submit a reflective report with supervisor evaluation.",
      guidelines: "Include an hours log, task descriptions, key learnings, and a signed supervisor evaluation form.",
      subjectCode: null,
      maxScore: 100,
      weightagePercent: seedData.assessments.internshipReport.weightage,
      dueOffsetWeek: 23,
      rubric: rubricFor("INTERNSHIP_REPORT" as AssessmentType, "Internship Report"),
    },
  });
  assessmentDefs.push({ id: internshipDef.id, type: "INTERNSHIP_REPORT", subjectCode: null });

  console.log(`  Seeded ${assessmentDefs.length} assessment definitions.`);

  // ---- 5. Students ----------------------------------------------------------------
  const studentIds: string[] = [];
  for (const demo of DEMO_STUDENTS) {
    const passwordHash = await bcrypt.hash("Student@2026", 10);
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        passwordHash,
        role: "STUDENT",
        name: demo.name,
        phone: `+91-8${Math.floor(100000000 + Math.random() * 899999999)}`,
      },
    });

    const student = await prisma.student.upsert({
      where: { studentId: demo.studentId },
      update: {},
      create: {
        studentId: demo.studentId,
        userId: user.id,
        batch: demo.batch,
        city: demo.city,
        state: demo.state,
        status: "ACTIVE" as StudentStatus,
        emergencyContactName: "Parent/Guardian",
        emergencyContactPhone: `+91-7${Math.floor(100000000 + Math.random() * 899999999)}`,
        emergencyContactRelation: "Parent",
      },
    });
    studentIds.push(student.id);
  }
  console.log(`  Seeded ${studentIds.length} demo students.`);

  // ---- 6. Attendance (varied) -------------------------------------------------------
  const allSessions = await prisma.session.findMany({ where: { status: "completed" } });
  const attendanceStatuses: AttendanceStatus[] = ["PRESENT", "PRESENT", "PRESENT", "PRESENT", "LATE", "ABSENT", "EXCUSED"];

  for (const studentId of studentIds) {
    for (const sess of allSessions) {
      // Skip some randomly to simulate not-yet-marked sessions for realism, but keep density high.
      if (Math.random() < 0.05) continue;
      await prisma.attendance.upsert({
        where: { studentId_sessionId: { studentId, sessionId: sess.id } },
        update: {},
        create: {
          studentId,
          sessionId: sess.id,
          status: rand(attendanceStatuses),
        },
      });
    }
  }
  console.log(`  Seeded attendance across ${allSessions.length} completed sessions.`);

  // ---- 7. Submissions + Grades (varied states) --------------------------------------
  const submissionStatuses: SubmissionStatus[] = ["NOT_SUBMITTED", "SUBMITTED", "SUBMITTED", "LATE", "GRADED", "GRADED", "GRADED"];

  for (let i = 0; i < studentIds.length; i++) {
    const studentId = studentIds[i];
    for (const def of assessmentDefs) {
      // Vary how far along each student is; later assessments more likely not submitted yet.
      const status = rand(submissionStatuses);

      if (status === "NOT_SUBMITTED") {
        await prisma.submission.upsert({
          where: { studentId_assessmentId: { studentId, assessmentId: def.id } },
          update: {},
          create: { studentId, assessmentId: def.id, status: "NOT_SUBMITTED" },
        });
        continue;
      }

      const submittedAt = new Date(now.getTime() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000);
      const isGraded = status === "GRADED";
      const score = isGraded ? Math.floor(65 + Math.random() * 35) : null;

      const submission = await prisma.submission.upsert({
        where: { studentId_assessmentId: { studentId, assessmentId: def.id } },
        update: {},
        create: {
          studentId,
          assessmentId: def.id,
          status,
          submittedAt,
          textContent: `Submission notes for ${def.type} by student ${i + 1}. Includes references to session materials and applied concepts.`,
          fileUrl: `https://drive.example.com/submissions/${studentId}-${def.id}.pdf`,
          score: score ?? undefined,
          feedback: isGraded ? "Solid work overall — strong grasp of core concepts. Tighten the budget section next time." : undefined,
          gradedAt: isGraded ? submittedAt : undefined,
        },
      });

      if (isGraded && score !== null) {
        const category =
          def.type === "ASSIGNMENT"
            ? "Weekly Assignments"
            : def.type === "CASE_STUDY"
            ? "Case Studies"
            : def.type === "CAPSTONE"
            ? "Capstone"
            : "Internship";
        await prisma.grade.upsert({
          where: { submissionId: submission.id },
          update: {},
          create: {
            studentId,
            submissionId: submission.id,
            category,
            score,
            maxScore: 100,
            letterGrade: score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F",
            comments: "Graded via demo seed data.",
          },
        });
      }
    }

    // Participation + Final evaluation grades (not tied to a submission).
    await prisma.grade.create({
      data: {
        studentId,
        category: "Participation",
        score: Math.floor(70 + Math.random() * 30),
        maxScore: 100,
        letterGrade: "B",
        comments: "Active in online sessions; consistent Q&A engagement.",
      },
    });
  }
  console.log(`  Seeded submissions and grades for ${studentIds.length} students.`);

  // ---- 8. Internship records ------------------------------------------------------
  const orgs = ["EventCraft Studios", "Grand Gala Events", "Pinnacle MICE Solutions", "Urban Fest Co.", "Celebrate Right Weddings"];
  for (let i = 0; i < studentIds.length; i++) {
    const started = i % 3 !== 0; // most students have started
    await prisma.internshipRecord.upsert({
      where: { studentId: studentIds[i] },
      update: {},
      create: {
        studentId: studentIds[i],
        organization: started ? rand(orgs) : null,
        supervisorName: started ? "Site Supervisor" : null,
        supervisorEmail: started ? `supervisor${i}@example.com` : null,
        supervisorPhone: started ? `+91-9${Math.floor(100000000 + Math.random() * 899999999)}` : null,
        startDate: started ? new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) : null,
        requiredHours: 30,
        loggedHours: started ? Math.floor(Math.random() * 32) : 0,
        status: started ? (i % 4 === 0 ? "submitted" : "in_progress") : "not_started",
      },
    });
  }
  console.log(`  Seeded internship records.`);

  // ---- 9. Sample messages + notifications ------------------------------------------
  const facultyUsers = await prisma.user.findMany({ where: { role: "FACULTY" } });
  const studentUsers = await prisma.user.findMany({ where: { role: "STUDENT" } });

  if (facultyUsers.length > 0 && studentUsers.length > 0) {
    await prisma.message.create({
      data: {
        senderId: studentUsers[0].id,
        recipientId: facultyUsers[0].id,
        subject: "Question about Assignment 1 deadline",
        body: "Hi, could you confirm whether the Event Concept Brief is due before or after the Weekend 1 session? Thank you!",
      },
    });
    await prisma.message.create({
      data: {
        senderId: facultyUsers[0].id,
        recipientId: studentUsers[0].id,
        subject: "Re: Question about Assignment 1 deadline",
        body: "It's due the Friday after Weekend 1 wraps up — you'll see it reflected on your dashboard. Let me know if you need an extension.",
      },
    });

    await prisma.notification.createMany({
      data: studentUsers.map((u) => ({
        userId: u.id,
        type: "ANNOUNCEMENT" as const,
        title: "Welcome to EM&TL E1!",
        body: "Welcome to the Event Management & Team Leadership E1 diploma program. Please check your dashboard for the Weekend 1 orientation schedule.",
      })),
    });
  }
  console.log(`  Seeded sample messages and announcements.`);

  console.log("\nSeed complete.\n");
  console.log("=".repeat(64));
  console.log("DEMO FACULTY LOGIN CREDENTIALS (password for all: Faculty@2026)");
  console.log("=".repeat(64));
  for (const subj of seedData.subjects) {
    const profile = LECTURER_PROFILES[subj.code];
    console.log(`  ${subj.code.padEnd(7)} ${profile.name.padEnd(16)} ${profile.email}`);
  }
  console.log(`  ${"ADMIN".padEnd(7)} Dr. Kavita Rao   admin@em-e1.edu`);
  console.log("=".repeat(64));
  console.log("DEMO STUDENT LOGIN (for reference, used by the sibling LMS app):");
  console.log("  password for all: Student@2026");
  for (const s of DEMO_STUDENTS) {
    console.log(`  ${s.studentId}  ${s.name.padEnd(18)} ${s.email}`);
  }
  console.log("=".repeat(64));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
