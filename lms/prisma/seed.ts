/**
 * prisma/seed.ts
 *
 * Seeds the Postgres database from /home/claude/em_e1_platform/shared/seed-data.json
 * (the canonical program/subject/session/weekend/assessment data) plus demo
 * faculty & student accounts so the LMS is populated on first login.
 *
 * Run with: npm run db:seed  (uses tsx — see package.json)
 *
 * NOTE: this project cannot run `prisma db seed` via the Prisma CLI because
 * the CLI needs to download a native engine binary from binaries.prisma.sh,
 * which is blocked by network policy in this build environment (see
 * prisma/init.sql for the full explanation). This script instead talks to
 * Postgres directly via `pg`, using the exact same schema (see
 * prisma/init.sql, applied once via psql).
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { pool, newId } from "../lib/db";

const SEED_PATH = path.join(
  __dirname,
  "..",
  "..",
  "shared",
  "seed-data.json"
);

const PROGRAM_START = new Date(process.env.PROGRAM_START_DATE || "2026-06-08T00:00:00Z");

const DAY_OFFSET: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function dateForWeekDay(week: number, day: string): Date {
  const offset = (week - 1) * 7 + (DAY_OFFSET[day] ?? 0);
  const d = new Date(PROGRAM_START);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
}

function isPast(d: Date): boolean {
  return d.getTime() < Date.now();
}

interface SeedSession {
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

interface SeedSubject {
  code: string;
  name: string;
  lecturer: string;
  sessions: number;
  hours: number;
  weeks: string;
}

interface SeedWeekend {
  code: string;
  name: string;
  week: number;
  focus: string;
  days: { day: string; hours: number }[];
  totalHours: number;
  activities: string[];
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));
  const subjectsSeed: SeedSubject[] = raw.subjects;
  const sessionsSeed: SeedSession[] = raw.sessions;
  const weekendsSeed: SeedWeekend[] = raw.weekends;

  const client = await pool.connect();
  try {
    console.log("Clearing existing data...");
    await client.query(`
      TRUNCATE TABLE
        "Notification", "Message", "Application", "Certificate",
        "InternshipLog", "InternshipRecord", "Grade", "Submission",
        "AssessmentDefinition", "WeekendAttendance", "Attendance",
        "Material", "Session", "Weekend", "Subject",
        "Student", "Faculty", "User"
      RESTART IDENTITY CASCADE;
    `);

    // -------------------------------------------------------------------
    // Faculty (one User + Faculty row per Lecturer 1..6)
    // -------------------------------------------------------------------
    console.log("Seeding faculty...");
    const facultyPasswordHash = await bcrypt.hash("Faculty@123", 10);
    const lecturerNames = [
      "Lecturer 1",
      "Lecturer 2",
      "Lecturer 3",
      "Lecturer 4",
      "Lecturer 5",
      "Lecturer 6",
    ];
    const lecturerFullNames = [
      "Anjali Mehra",
      "Rohan Kapoor",
      "Sneha Iyer",
      "Vikram Desai",
      "Priya Nair",
      "Arjun Malhotra",
    ];
    const facultyIdByLecturer: Record<string, string> = {};
    const facultyUserIdByLecturer: Record<string, string> = {};

    for (let i = 0; i < lecturerNames.length; i++) {
      const userId = newId();
      const facId = newId();
      const email = `lecturer${i + 1}@em-e1.edu`;
      await client.query(
        `INSERT INTO "User" (id, email, "passwordHash", role, name, phone, "isActive")
         VALUES ($1,$2,$3,'FACULTY',$4,$5,true)`,
        [userId, email, facultyPasswordHash, lecturerFullNames[i], `+91-98${(10000000 + i).toString().slice(0,8)}`]
      );
      await client.query(
        `INSERT INTO "Faculty" (id, "facultyId", "userId", specialization, bio)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          facId,
          `FAC-00${i + 1}`,
          userId,
          "Event Management & Team Leadership",
          `${lecturerFullNames[i]} is a faculty member for the Event Management & Team Leadership E1 diploma, teaching as ${lecturerNames[i]}.`,
        ]
      );
      facultyIdByLecturer[lecturerNames[i]] = facId;
      facultyUserIdByLecturer[lecturerNames[i]] = userId;
    }

    // -------------------------------------------------------------------
    // Subjects
    // -------------------------------------------------------------------
    console.log("Seeding subjects...");
    const subjectIdByCode: Record<string, string> = {};
    for (const s of subjectsSeed) {
      const id = newId();
      subjectIdByCode[s.code] = id;
      await client.query(
        `INSERT INTO "Subject" (id, code, name, "lecturerId", "totalSessions", "totalHours", "weeksLabel")
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, s.code, s.name, facultyIdByLecturer[s.lecturer] ?? null, s.sessions, s.hours, s.weeks]
      );
    }

    // -------------------------------------------------------------------
    // Sessions
    // -------------------------------------------------------------------
    console.log("Seeding sessions...");
    const sessionIdByNumber: Record<number, string> = {};
    const sessionRows: { id: string; number: number; date: Date; subjectCode: string }[] = [];

    for (const s of sessionsSeed) {
      const id = newId();
      sessionIdByNumber[s.sessionNumber] = id;
      const scheduledDate = dateForWeekDay(s.week, s.day);
      const past = isPast(scheduledDate);
      const status = past ? "completed" : "upcoming";
      const meetingLink = `https://meet.google.com/e1-${s.code.toLowerCase()}-demo`;
      const recordingUrl = past
        ? `https://storage.example.com/recordings/e1/${s.code.toLowerCase()}.mp4`
        : null;
      const notesUrl = `/uploads/session-notes/${s.code.toLowerCase()}-notes.pdf`;
      const slidesUrl = `/uploads/session-notes/${s.code.toLowerCase()}-slides.pdf`;

      await client.query(
        `INSERT INTO "Session" (
           id, "sessionNumber", code, week, day, module, "moduleName", topic, hours,
           "keyTopics", "teachingMethod", "assessmentNote", resources, "scheduledDate",
           "startTime", "endTime", "meetingLink", "recordingUrl", "notesUrl", "slidesUrl",
           status, "subjectId", "facultyId"
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
        [
          id,
          s.sessionNumber,
          s.code,
          s.week,
          s.day,
          s.module,
          s.moduleName,
          s.topic,
          s.hours,
          s.keyTopics,
          s.teachingMethod,
          s.assessment,
          s.resources,
          scheduledDate,
          "18:00",
          "20:00",
          meetingLink,
          recordingUrl,
          notesUrl,
          slidesUrl,
          status,
          subjectIdByCode[s.subjectCode],
          facultyIdByLecturer[
            subjectsSeed.find((sub) => sub.code === s.subjectCode)?.lecturer ?? ""
          ] ?? null,
        ]
      );

      if (past) {
        await client.query(
          `INSERT INTO "Material" (id, "sessionId", title, type, url)
           VALUES ($1,$2,$3,'notes',$4), ($5,$2,$6,'slides',$7)`,
          [
            newId(),
            id,
            `${s.topic} — Session Notes`,
            notesUrl,
            newId(),
            `${s.topic} — Slides`,
            slidesUrl,
          ]
        );
      }

      sessionRows.push({ id, number: s.sessionNumber, date: scheduledDate, subjectCode: s.subjectCode });
    }

    // -------------------------------------------------------------------
    // Weekends
    // -------------------------------------------------------------------
    console.log("Seeding weekends...");
    const venueByCode: Record<string, { name: string; address: string }> = {
      W1: {
        name: "EM&LP Learning Campus — Bandra Hall",
        address: "EM&LP Learning Campus, Linking Road, Bandra West, Mumbai, Maharashtra 400050, India",
      },
      W2: {
        name: "EM&LP Learning Campus — Bandra Hall",
        address: "EM&LP Learning Campus, Linking Road, Bandra West, Mumbai, Maharashtra 400050, India",
      },
      W3: {
        name: "EM&LP Convention Centre — Powai",
        address: "EM&LP Convention Centre, Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076, India",
      },
    };
    const weekendIdByCode: Record<string, string> = {};
    for (const w of weekendsSeed) {
      const id = newId();
      weekendIdByCode[w.code] = id;
      const fridayDate = dateForWeekDay(w.week, "Friday");
      const sundayDate = dateForWeekDay(w.week, "Sunday");
      const venue = venueByCode[w.code];
      const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(venue.address)}&output=embed`;
      await client.query(
        `INSERT INTO "Weekend" (id, code, name, week, focus, "totalHours", activities, "venueName", "venueAddress", "venueMapUrl", "startDate", "endDate")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          id,
          w.code,
          w.name,
          w.week,
          w.focus,
          w.totalHours,
          w.activities,
          venue.name,
          venue.address,
          mapUrl,
          fridayDate,
          sundayDate,
        ]
      );
    }

    // -------------------------------------------------------------------
    // Assessment definitions
    // -------------------------------------------------------------------
    console.log("Seeding assessment definitions...");
    const assignmentDefs = [
      {
        subjectCode: "E1-S1",
        title: "Assignment 1: Event Concept Brief",
        description:
          "Develop a one-page event concept brief for a fictional corporate event, covering objective, audience, theme, and success metrics.",
        guidelines:
          "Use the frameworks covered in Module 1 (industry overview, event types, stakeholder mapping). Submit as PDF, max 2 pages. Reference at least one real industry example.",
        dueOffsetWeek: 3,
      },
      {
        subjectCode: "E1-S2",
        title: "Assignment 2: Event Budget & Cost Plan",
        description:
          "Prepare a detailed line-item budget for a 200-guest conference, including vendor cost estimates and a 10% contingency.",
        guidelines:
          "Use the budgeting template shared in class. Show at least 8 cost categories (venue, catering, AV, staffing, marketing, permits, contingency, misc). Submit as spreadsheet or PDF.",
        dueOffsetWeek: 4,
      },
      {
        subjectCode: "E1-S3",
        title: "Assignment 3: Event Marketing & Branding Plan",
        description:
          "Create a marketing and branding plan for a product launch event, including channel mix, messaging pillars, and a sample social media calendar.",
        guidelines:
          "Cover pre-event, during-event, and post-event marketing. Include at least 3 channels and a basic KPI table (reach, engagement, conversions).",
        dueOffsetWeek: 6,
      },
      {
        subjectCode: "E1-S4",
        title: "Assignment 4: Event Production & Logistics Plan",
        description:
          "Produce a run-of-show and logistics plan for a one-day multi-session summit, including vendor coordination and contingency plans.",
        guidelines:
          "Include a minute-by-minute run-of-show, a vendor contact/coordination sheet, and at least 2 risk-mitigation contingencies (weather, AV failure, etc).",
        dueOffsetWeek: 9,
      },
      {
        subjectCode: "E1-S5",
        title: "Assignment 5: Team Leadership Reflection & Digital Event Plan",
        description:
          "Write a leadership reflection based on a team exercise from class, and design a plan for a hybrid/digital event component.",
        guidelines:
          "Part A (1 page): leadership style reflection using a framework from class. Part B (1-2 pages): hybrid event platform choice, engagement tactics, and technical contingency plan.",
        dueOffsetWeek: 14,
      },
      {
        subjectCode: "E1-S6",
        title: "Assignment 6: Business Plan & Career Roadmap",
        description:
          "Draft a one-page lean business plan for an event management venture, plus a personal 12-month career roadmap.",
        guidelines:
          "Business plan should cover value proposition, target market, revenue model, and initial cost estimate. Career roadmap should list 3 concrete milestones.",
        dueOffsetWeek: 19,
      },
    ];

    const caseStudyDefs = [
      {
        subjectCode: "E1-S1",
        title: "Case Study 1: Iconic Event Failure Analysis",
        description:
          "Analyze a well-documented real-world event failure (e.g. Fyre Festival) and identify root causes across planning, communication, and execution.",
        guidelines: "1500-2000 words. Structure: background, what went wrong, root cause analysis, 3 recommendations.",
        dueOffsetWeek: 3,
      },
      {
        subjectCode: "E1-S2",
        title: "Case Study 2: Budget Overrun Post-Mortem",
        description:
          "Examine a real or case-based event that went significantly over budget and propose a revised budgeting and approval process.",
        guidelines: "Include a before/after budget comparison table and at least 3 process safeguards.",
        dueOffsetWeek: 4,
      },
      {
        subjectCode: "E1-S3",
        title: "Case Study 3: Viral Event Marketing Campaign",
        description:
          "Study a marketing campaign for an event that went viral and break down the channel strategy, timing, and content mix that drove it.",
        guidelines: "Identify at least 3 replicable tactics for a mid-size event budget.",
        dueOffsetWeek: 6,
      },
      {
        subjectCode: "E1-S4",
        title: "Case Study 4: Large-Scale Event Logistics Breakdown",
        description:
          "Analyze the logistics failure of a large-scale public event (transport, crowd control, or vendor coordination) and propose fixes.",
        guidelines: "Include a logistics timeline and a revised risk register with mitigation owners.",
        dueOffsetWeek: 8,
      },
      {
        subjectCode: "E1-S4",
        title: "Case Study 5: Vendor & Crew Management Crisis",
        description:
          "Examine a case where vendor or crew mismanagement caused a live event disruption, and propose a vendor SLA and escalation process.",
        guidelines: "Include a sample vendor SLA checklist with at least 6 clauses.",
        dueOffsetWeek: 9,
      },
      {
        subjectCode: "E1-S5",
        title: "Case Study 6: Hybrid/Digital Event Execution",
        description:
          "Study a well-executed hybrid or fully virtual event and analyze the platform choices, engagement design, and technical production.",
        guidelines: "Cover at least 2 engagement tactics and the platform's key limitations.",
        dueOffsetWeek: 13,
      },
      {
        subjectCode: "E1-S5",
        title: "Case Study 7: Leading a Cross-Functional Event Team",
        description:
          "Analyze a case of a team lead successfully (or unsuccessfully) managing a cross-functional event team under a tight deadline.",
        guidelines: "Apply at least one leadership framework covered in class to the analysis.",
        dueOffsetWeek: 14,
      },
      {
        subjectCode: "E1-S6",
        title: "Case Study 8: Event Entrepreneurship Success Story",
        description:
          "Research an event management entrepreneur or agency's growth story and extract lessons on business model, pricing, and client acquisition.",
        guidelines: "Include a short SWOT analysis of the business featured.",
        dueOffsetWeek: 18,
      },
    ];

    const assessmentIdByTitle: Record<string, string> = {};

    for (const a of assignmentDefs) {
      const id = newId();
      assessmentIdByTitle[a.title] = id;
      await client.query(
        `INSERT INTO "AssessmentDefinition" (id, type, title, description, guidelines, "subjectCode", "maxScore", "weightagePercent", "dueOffsetWeek")
         VALUES ($1,'ASSIGNMENT',$2,$3,$4,$5,100,$6,$7)`,
        [id, a.title, a.description, a.guidelines, a.subjectCode, 20 / 6, a.dueOffsetWeek]
      );
    }
    for (const c of caseStudyDefs) {
      const id = newId();
      assessmentIdByTitle[c.title] = id;
      await client.query(
        `INSERT INTO "AssessmentDefinition" (id, type, title, description, guidelines, "subjectCode", "maxScore", "weightagePercent", "dueOffsetWeek")
         VALUES ($1,'CASE_STUDY',$2,$3,$4,$5,100,$6,$7)`,
        [id, c.title, c.description, c.guidelines, c.subjectCode, 20 / 8, c.dueOffsetWeek]
      );
    }

    const capstoneId = newId();
    assessmentIdByTitle["capstone"] = capstoneId;
    await client.query(
      `INSERT INTO "AssessmentDefinition" (id, type, title, description, guidelines, "subjectCode", "maxScore", "weightagePercent", "dueOffsetWeek")
       VALUES ($1,'CAPSTONE',$2,$3,$4,NULL,100,25,23)`,
      [
        capstoneId,
        "Capstone Project: Full Event Proposal & Pitch Deck",
        "Design a complete, presentation-ready event proposal for a real or realistic client brief, culminating in a pitch to a faculty panel.",
        "Deliverables: (1) full event proposal document covering concept, budget, marketing, logistics and risk plan, (2) a pitch deck (10-15 slides), (3) a 10-minute live or recorded pitch presentation to the panel. Rubric weighs creativity (20%), feasibility (30%), budget realism (20%), and presentation delivery (30%).",
      ]
    );

    const internshipReportId = newId();
    assessmentIdByTitle["internship"] = internshipReportId;
    await client.query(
      `INSERT INTO "AssessmentDefinition" (id, type, title, description, guidelines, "subjectCode", "maxScore", "weightagePercent", "dueOffsetWeek")
       VALUES ($1,'INTERNSHIP_REPORT',$2,$3,$4,NULL,100,20,23)`,
      [
        internshipReportId,
        "Internship Report: 30-Hour Real-World Event Experience",
        "Complete a minimum 30-hour placement or self-sourced practical engagement with a real event, and submit a reflective report.",
        "Minimum 30 logged hours (see Internship Logbook). Report must include: organization/event details, your role and responsibilities, 3 key learnings, and a supervisor evaluation. Submit as PDF, 3-5 pages.",
      ]
    );

    // -------------------------------------------------------------------
    // Demo students
    // -------------------------------------------------------------------
    console.log("Seeding demo students...");
    const studentPasswordHash = await bcrypt.hash("Student@123", 10);
    const demoStudents = [
      { studentId: "E1-001", name: "Aarav Sharma", email: "aarav.sharma@student.em-e1.edu", city: "Mumbai", state: "Maharashtra" },
      { studentId: "E1-002", name: "Diya Patel", email: "diya.patel@student.em-e1.edu", city: "Ahmedabad", state: "Gujarat" },
      { studentId: "E1-003", name: "Kabir Singh", email: "kabir.singh@student.em-e1.edu", city: "Delhi", state: "Delhi" },
      { studentId: "E1-004", name: "Meera Reddy", email: "meera.reddy@student.em-e1.edu", city: "Hyderabad", state: "Telangana" },
      { studentId: "E1-005", name: "Ishaan Verma", email: "ishaan.verma@student.em-e1.edu", city: "Pune", state: "Maharashtra" },
    ];

    const studentIds: string[] = [];
    const studentUserIds: string[] = [];

    for (const s of demoStudents) {
      const userId = newId();
      const studId = newId();
      await client.query(
        `INSERT INTO "User" (id, email, "passwordHash", role, name, phone, "isActive")
         VALUES ($1,$2,$3,'STUDENT',$4,$5,true)`,
        [userId, s.email, studentPasswordHash, s.name, `+91-90${Math.floor(10000000 + Math.random() * 89999999)}`]
      );
      await client.query(
        `INSERT INTO "Student" (id, "studentId", "userId", batch, city, state, status,
           "emergencyContactName", "emergencyContactPhone", "emergencyContactRelation")
         VALUES ($1,$2,$3,'Batch A',$4,$5,'ACTIVE',$6,$7,$8)`,
        [
          studId,
          s.studentId,
          userId,
          s.city,
          s.state,
          `${s.name.split(" ")[0]}'s Guardian`,
          `+91-99${Math.floor(10000000 + Math.random() * 89999999)}`,
          "Parent",
        ]
      );
      studentIds.push(studId);
      studentUserIds.push(userId);
    }

    // Attendance: mark attendance for all PAST sessions for each student (mostly present, a few absent/late)
    console.log("Seeding attendance...");
    const pastSessions = sessionRows.filter((s) => isPast(s.date));
    for (let si = 0; si < studentIds.length; si++) {
      const studentId = studentIds[si];
      for (const sess of pastSessions) {
        const roll = Math.random();
        let status: string = "PRESENT";
        // Give student index 4 (Ishaan) a lower attendance rate to show variety.
        const absentThreshold = si === 4 ? 0.25 : 0.08;
        const lateThreshold = absentThreshold + 0.07;
        if (roll < absentThreshold) status = "ABSENT";
        else if (roll < lateThreshold) status = "LATE";
        await client.query(
          `INSERT INTO "Attendance" (id, "studentId", "sessionId", status, "markedAt")
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT ("studentId","sessionId") DO NOTHING`,
          [newId(), studentId, sess.id, status, sess.date]
        );
      }
    }

    // Weekend attendance for Weekend 1 (already happened)
    console.log("Seeding weekend attendance...");
    const w1Id = weekendIdByCode["W1"];
    for (const studentId of studentIds) {
      await client.query(
        `INSERT INTO "WeekendAttendance" (id, "studentId", "weekendId", "fridayPresent", "saturdayPresent", "sundayPresent")
         VALUES ($1,$2,$3,true,true,true)
         ON CONFLICT ("studentId","weekendId") DO NOTHING`,
        [newId(), studentId, w1Id]
      );
    }

    // Submissions + grades for assignments/case studies whose due date has passed
    console.log("Seeding submissions and grades...");
    const allDefs = await client.query(
      `SELECT id, type, title, "subjectCode", "dueOffsetWeek", "maxScore" FROM "AssessmentDefinition"`
    );
    const facultyRows = await client.query(`SELECT id FROM "Faculty" LIMIT 1`);
    const graderFacultyId = facultyRows.rows[0]?.id ?? null;

    for (const def of allDefs.rows) {
      const dueDate = def.dueOffsetWeek
        ? dateForWeekDay(def.dueOffsetWeek, "Sunday")
        : null;
      const isDue = dueDate ? isPast(dueDate) : false;
      if (!isDue) continue;

      for (let si = 0; si < studentIds.length; si++) {
        const studentId = studentIds[si];
        // Skip a submission occasionally to show "not submitted" state (student 4 skips more).
        const skipChance = si === 4 ? 0.35 : 0.1;
        if (Math.random() < skipChance) continue;

        const submissionId = newId();
        const submittedAt = new Date(dueDate!.getTime() - 1000 * 60 * 60 * (12 + Math.random() * 48));
        const late = Math.random() < 0.1;
        const graded = Math.random() < 0.75;
        const score = graded ? Math.round(65 + Math.random() * 33) : null;
        const status = graded ? "GRADED" : late ? "LATE" : "SUBMITTED";

        await client.query(
          `INSERT INTO "Submission" (id, "studentId", "assessmentId", "fileUrl", "textContent", status, "submittedAt", score, feedback, "gradedById", "gradedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT ("studentId","assessmentId") DO NOTHING`,
          [
            submissionId,
            studentId,
            def.id,
            `/uploads/submissions/demo-${def.id.slice(0, 6)}-${studentId.slice(0, 6)}.pdf`,
            null,
            status,
            submittedAt,
            score,
            graded ? "Good effort — solid structure, tighten up the budget assumptions next time." : null,
            graded ? graderFacultyId : null,
            graded ? new Date(submittedAt.getTime() + 1000 * 60 * 60 * 24 * 3) : null,
          ]
        );

        if (graded && score !== null) {
          const category = def.type === "CASE_STUDY" ? "Case Studies" : def.type === "ASSIGNMENT" ? "Weekly Assignments" : def.type === "CAPSTONE" ? "Capstone" : "Internship";
          const letter = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
          await client.query(
            `INSERT INTO "Grade" (id, "studentId", "submissionId", category, score, "maxScore", "letterGrade", comments)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [newId(), studentId, submissionId, category, score, def.maxScore, letter, "Graded against subject rubric."]
          );
        }
      }
    }

    // Participation & final-evaluation grades (no submission tie) for all students
    for (const studentId of studentIds) {
      const partScore = Math.round(70 + Math.random() * 28);
      await client.query(
        `INSERT INTO "Grade" (id, "studentId", category, score, "maxScore", "letterGrade", comments)
         VALUES ($1,$2,'Participation',$3,100,$4,'Active engagement in online sessions.')`,
        [newId(), studentId, partScore, partScore >= 90 ? "A" : partScore >= 80 ? "B" : "C"]
      );
    }

    // -------------------------------------------------------------------
    // Internship records + logs (2 students in progress, rest not started)
    // -------------------------------------------------------------------
    console.log("Seeding internship records...");
    for (let si = 0; si < studentIds.length; si++) {
      const studentId = studentIds[si];
      const internshipId = newId();
      const inProgress = si < 2;
      await client.query(
        `INSERT INTO "InternshipRecord" (id, "studentId", organization, "supervisorName", "supervisorEmail", "supervisorPhone", "startDate", "requiredHours", "loggedHours", status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,30,$8,$9)`,
        [
          internshipId,
          studentId,
          inProgress ? "Sunburst Events & Weddings Pvt Ltd" : null,
          inProgress ? "Karan Bhatia" : null,
          inProgress ? "karan.bhatia@sunburstevents.example" : null,
          inProgress ? "+91-9822010203" : null,
          inProgress ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) : null,
          inProgress ? 12 : 0,
          inProgress ? "in_progress" : "not_started",
        ]
      );
      if (inProgress) {
        const activities = [
          "Assisted with vendor coordination for a 300-guest wedding reception",
          "Managed guest registration desk for a corporate offsite",
          "Helped set up AV and staging for an evening gala",
        ];
        for (let i = 0; i < activities.length; i++) {
          await client.query(
            `INSERT INTO "InternshipLog" (id, "internshipId", date, "hoursLogged", "activityDescription")
             VALUES ($1,$2,$3,$4,$5)`,
            [
              newId(),
              internshipId,
              new Date(Date.now() - 1000 * 60 * 60 * 24 * (10 - i * 3)),
              4,
              activities[i],
            ]
          );
        }
      }
    }

    // -------------------------------------------------------------------
    // Certificate: issued for none yet (program in progress), but wire the row
    // -------------------------------------------------------------------
    for (const studentId of studentIds) {
      await client.query(
        `INSERT INTO "Certificate" (id, "studentId", issued) VALUES ($1,$2,false)`,
        [newId(), studentId]
      );
    }

    // -------------------------------------------------------------------
    // Notifications
    // -------------------------------------------------------------------
    console.log("Seeding notifications...");
    for (const userId of studentUserIds) {
      const notifs: [string, string, string, string, string][] = [
        [
          "ANNOUNCEMENT",
          "Welcome to the E1 Program!",
          "Your Event Management & Team Leadership E1 diploma has started. Check My Courses to get oriented.",
          "/courses",
          newId(),
        ],
        [
          "SESSION_REMINDER",
          "Upcoming session this week",
          "You have live sessions scheduled this week — check the Sessions page for join links.",
          "/sessions",
          newId(),
        ],
        [
          "DEADLINE_REMINDER",
          "Assignment due soon",
          "A weekly assignment deadline is approaching. Submit before the due date to avoid a late mark.",
          "/assessments",
          newId(),
        ],
      ];
      for (const [type, title, body, link, id] of notifs) {
        await client.query(
          `INSERT INTO "Notification" (id, "userId", type, title, body, link)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, userId, type, title, body, link]
        );
      }
    }

    // -------------------------------------------------------------------
    // Messages (faculty -> student demo thread)
    // -------------------------------------------------------------------
    console.log("Seeding messages...");
    const firstFacultyUserId = facultyUserIdByLecturer["Lecturer 1"];
    for (const userId of studentUserIds.slice(0, 3)) {
      await client.query(
        `INSERT INTO "Message" (id, "senderId", "recipientId", subject, body, "isRead")
         VALUES ($1,$2,$3,$4,$5,false)`,
        [
          newId(),
          firstFacultyUserId,
          userId,
          "Welcome & Orientation Follow-up",
          "Hi! Great meeting you at orientation weekend. Let me know if you have any questions about Module 1 before our next session.",
        ]
      );
    }

    console.log("\nSeed complete.\n");
    console.log("=======================================================");
    console.log(" DEMO LOGIN CREDENTIALS");
    console.log("=======================================================");
    console.log(" Students (role: STUDENT), password for all: Student@123");
    for (const s of demoStudents) {
      console.log(`   ${s.studentId}  ${s.email}`);
    }
    console.log("\n Faculty (role: FACULTY), password for all: Faculty@123");
    for (let i = 0; i < lecturerNames.length; i++) {
      console.log(`   FAC-00${i + 1}  lecturer${i + 1}@em-e1.edu  (${lecturerNames[i]} / ${lecturerFullNames[i]})`);
    }
    console.log("=======================================================\n");
  } finally {
    client.release();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
