// Builds realistic, typed fixtures from the canonical shared/seed-data.json
// curriculum for the two demo student accounts. This is the single source
// used by src/api/mockBackend.ts when USE_MOCK_DATA is on.

import seed from './seed-data.json';
import {
  AssessmentDefinition,
  AttendanceStatus,
  Conversation,
  Grade,
  InternshipRecord,
  Message,
  Notification,
  ProgramInfo,
  Session,
  Student,
  Submission,
  Subject,
  User,
  Weekend,
} from '../types';
import { isPast, sessionDateTime, mondayOfWeek } from '../utils/dates';

// ---------------------------------------------------------------------------
// Program / Subjects / Sessions / Weekends — straight projection of seed data
// ---------------------------------------------------------------------------

export const PROGRAM: ProgramInfo = seed.program as ProgramInfo;

const LECTURER_NAMES: Record<string, string> = {
  'Lecturer 1': 'Anjali Mehta',
  'Lecturer 2': 'Rohan Kapoor',
  'Lecturer 3': 'Priya Nair',
  'Lecturer 4': 'Vikram Sethi',
  'Lecturer 5': 'Sana Iyer',
  'Lecturer 6': 'Arjun Malhotra',
};

export const SUBJECTS: Subject[] = seed.subjects.map((s) => ({
  id: s.code,
  code: s.code,
  name: s.name,
  lecturerId: s.lecturer,
  lecturerName: LECTURER_NAMES[s.lecturer] ?? s.lecturer,
  totalSessions: s.sessions,
  totalHours: s.hours,
  weeksLabel: s.weeks,
}));

function subjectMeetingLink(subjectCode: string): string {
  return `https://meet.emleadershipacademy.com/e1/${subjectCode.toLowerCase()}`;
}

export const SESSIONS: Session[] = seed.sessions.map((s) => {
  const { start, end } = sessionDateTime(s.week, s.day);
  const past = isPast(end);
  return {
    id: `session-${s.sessionNumber}`,
    sessionNumber: s.sessionNumber,
    code: s.code,
    week: s.week,
    day: s.day,
    module: s.module,
    moduleName: s.moduleName,
    topic: s.topic,
    hours: s.hours,
    keyTopics: s.keyTopics,
    teachingMethod: s.teachingMethod,
    assessmentNote: s.assessment,
    resources: s.resources,
    scheduledDate: start.toISOString(),
    startTime: '6:00 PM',
    endTime: '8:00 PM',
    meetingLink: subjectMeetingLink(s.subjectCode),
    recordingUrl: past ? `https://cdn.emleadershipacademy.com/recordings/${s.code}.mp4` : null,
    notesUrl: past ? `https://cdn.emleadershipacademy.com/notes/${s.code}.pdf` : null,
    slidesUrl: `https://cdn.emleadershipacademy.com/slides/${s.code}.pdf`,
    status: past ? 'completed' : 'upcoming',
    subjectId: s.subjectCode,
    subjectCode: s.subjectCode,
    facultyId: s.subjectCode,
  } as Session;
});

const WEEKEND_VENUES: Record<string, { name: string; address: string }> = {
  W1: {
    name: 'Leadership Institute Campus — Main Hall',
    address: 'Leadership Institute Campus, Plot 14, Sector 44, Gurugram, Haryana 122003, India',
  },
  W2: {
    name: 'Grand Convention Centre — Hall B',
    address: 'Grand Convention Centre, NH-8, Udyog Vihar Phase V, Gurugram, Haryana 122016, India',
  },
  W3: {
    name: 'Leadership Institute Campus — Auditorium',
    address: 'Leadership Institute Campus, Plot 14, Sector 44, Gurugram, Haryana 122003, India',
  },
};

export const WEEKENDS: Weekend[] = seed.weekends.map((w) => {
  const friday = mondayOfWeek(w.week);
  friday.setDate(friday.getDate() + 4); // Friday of that week
  const sunday = new Date(friday);
  sunday.setDate(sunday.getDate() + 2);
  const venue = WEEKEND_VENUES[w.code];
  return {
    id: w.code,
    code: w.code,
    name: w.name,
    week: w.week,
    focus: w.focus,
    totalHours: w.totalHours,
    activities: w.activities,
    venueName: venue.name,
    venueAddress: venue.address,
    venueMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`,
    startDate: friday.toISOString(),
    endDate: sunday.toISOString(),
    days: w.days,
  } as Weekend;
});

// ---------------------------------------------------------------------------
// Assessment definitions — derived from the assessments summary in seed data
// ---------------------------------------------------------------------------

function buildAssessmentDefinitions(): AssessmentDefinition[] {
  const defs: AssessmentDefinition[] = [];
  const a = seed.assessments;

  // 6 weekly assignments, one per subject-ish, spaced through the program
  const assignmentWeeks = [3, 5, 7, 11, 15, 19];
  const assignmentSubjects = ['E1-S1', 'E1-S2', 'E1-S3', 'E1-S4', 'E1-S5', 'E1-S6'];
  const assignmentTitles = [
    'Leadership Style Self-Assessment',
    'Event Budget & Cost Sheet',
    'Social Media Content Calendar',
    'Run-of-Show & Staffing Plan',
    'Virtual Engagement Plan',
    'Client Proposal Draft',
  ];
  for (let i = 0; i < a.weeklyAssignments.count; i++) {
    const week = assignmentWeeks[i];
    const due = mondayOfWeek(week);
    due.setDate(due.getDate() + 6); // Sunday end of week
    due.setHours(23, 59, 0, 0);
    defs.push({
      id: `assignment-${i + 1}`,
      type: 'ASSIGNMENT',
      title: `Assignment ${i + 1}: ${assignmentTitles[i]}`,
      description: `Practical task applying Week ${week} concepts from ${assignmentSubjects[i]}. Submit a written report (PDF/DOCX) demonstrating applied understanding.`,
      guidelines: `Estimated effort: ${a.weeklyAssignments.hoursEach} hours. Weighted ${a.weeklyAssignments.weightage / a.weeklyAssignments.count}% of final grade. Submit as a single document.`,
      subjectCode: assignmentSubjects[i],
      maxScore: 100,
      weightagePercent: a.weeklyAssignments.weightage / a.weeklyAssignments.count,
      dueDate: due.toISOString(),
    });
  }

  // 8 case studies
  const caseStudyWeeks = [2, 4, 6, 8, 10, 14, 17, 20];
  const caseStudySubjects = ['E1-S1', 'E1-S2', 'E1-S3', 'E1-S4', 'E1-S4', 'E1-S5', 'E1-S6', 'E1-S6'];
  const caseStudyTitles = [
    'Event Type Comparative Analysis',
    'Vendor Negotiation Case Study',
    'PR Crisis Response Case Study',
    'Stage & AV Production Case Study',
    'Emergency Response Case Study',
    'Hybrid Event Case Study',
    'Wedding vs Corporate Event Case Study',
    'Non-Profit Fundraiser Case Study',
  ];
  for (let i = 0; i < a.caseStudies.count; i++) {
    const week = caseStudyWeeks[i];
    const due = mondayOfWeek(week);
    due.setDate(due.getDate() + 6);
    due.setHours(23, 59, 0, 0);
    defs.push({
      id: `case-study-${i + 1}`,
      type: 'CASE_STUDY',
      title: `Case Study ${i + 1}: ${caseStudyTitles[i]}`,
      description: `Analyze the provided real-world event case and submit a written analysis covering context, challenges, decisions made, and recommendations.`,
      guidelines: `Estimated effort: ${a.caseStudies.hoursEach} hours. Weighted ${(a.caseStudies.weightage / a.caseStudies.count).toFixed(1)}% of final grade.`,
      subjectCode: caseStudySubjects[i],
      maxScore: 100,
      weightagePercent: a.caseStudies.weightage / a.caseStudies.count,
      dueDate: due.toISOString(),
    });
  }

  // Internship report
  const internshipDue = mondayOfWeek(23);
  internshipDue.setDate(internshipDue.getDate() + 6);
  defs.push({
    id: 'internship-report',
    type: 'INTERNSHIP_REPORT',
    title: 'Internship Report',
    description: a.internshipReport.description,
    guidelines: `Minimum ${a.internshipReport.minHours} hours of logged real-world event experience required. Weighted ${a.internshipReport.weightage}% of final grade.`,
    subjectCode: null,
    maxScore: 100,
    weightagePercent: a.internshipReport.weightage,
    dueDate: internshipDue.toISOString(),
  });

  // Capstone
  const capstoneDue = mondayOfWeek(24);
  capstoneDue.setDate(capstoneDue.getDate() + 4); // Friday of graduation weekend
  defs.push({
    id: 'capstone-project',
    type: 'CAPSTONE',
    title: 'Capstone Project: Full Event Proposal & Pitch',
    description: a.capstoneProject.description,
    guidelines: `Present a full event proposal and pitch deck to a panel of industry experts during Weekend 3. Weighted ${a.capstoneProject.weightage}% of final grade.`,
    subjectCode: null,
    maxScore: 100,
    weightagePercent: a.capstoneProject.weightage,
    dueDate: capstoneDue.toISOString(),
  });

  return defs;
}

export const ASSESSMENT_DEFINITIONS: AssessmentDefinition[] = buildAssessmentDefinitions();

export const CLASS_PARTICIPATION_WEIGHT = seed.assessments.classParticipation.weightage;
export const FINAL_EVALUATION_WEIGHT = seed.assessments.finalEvaluation.weightage;

// ---------------------------------------------------------------------------
// Demo student accounts
// ---------------------------------------------------------------------------

export interface DemoAccount {
  credentials: { email: string; password: string };
  user: User;
  student: Student;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    credentials: { email: 'priya.sharma@student.emleadership.edu', password: 'Student@123' },
    user: {
      id: 'user-student-1',
      email: 'priya.sharma@student.emleadership.edu',
      role: 'STUDENT',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      avatarUrl: null,
      isActive: true,
    },
    student: {
      id: 'student-1',
      studentId: 'E1-001',
      userId: 'user-student-1',
      user: undefined as unknown as User, // filled below
      batch: 'Batch A',
      city: 'Gurugram',
      state: 'Haryana',
      registrationDate: '2026-05-20T00:00:00.000Z',
      status: 'ACTIVE',
      emergencyContactName: 'Rakesh Sharma',
      emergencyContactPhone: '+91 98111 22233',
      emergencyContactRelation: 'Father',
    },
  },
  {
    credentials: { email: 'arjun.verma@student.emleadership.edu', password: 'Student@123' },
    user: {
      id: 'user-student-2',
      email: 'arjun.verma@student.emleadership.edu',
      role: 'STUDENT',
      name: 'Arjun Verma',
      phone: '+91 91234 56789',
      avatarUrl: null,
      isActive: true,
    },
    student: {
      id: 'student-2',
      studentId: 'E1-002',
      userId: 'user-student-2',
      user: undefined as unknown as User,
      batch: 'Batch A',
      city: 'Delhi',
      state: 'Delhi',
      registrationDate: '2026-05-20T00:00:00.000Z',
      status: 'ACTIVE',
      emergencyContactName: 'Sunita Verma',
      emergencyContactPhone: '+91 98222 33344',
      emergencyContactRelation: 'Mother',
    },
  },
];
DEMO_ACCOUNTS.forEach((a) => (a.student.user = a.user));

// ---------------------------------------------------------------------------
// Deterministic pseudo-random helpers so each student's generated data is
// stable across app restarts without needing a real backend.
// ---------------------------------------------------------------------------

function seededRandom(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Attendance generation (per student) — ~88% present for completed sessions
// ---------------------------------------------------------------------------

export function generateAttendance(studentId: string) {
  const rand = seededRandom(studentId + '-attendance');
  const completed = SESSIONS.filter((s) => s.status === 'completed');
  return completed.map((s) => {
    const r = rand();
    let status: AttendanceStatus = 'PRESENT';
    if (r > 0.94) status = 'ABSENT';
    else if (r > 0.88) status = 'LATE';
    else if (r > 0.85) status = 'EXCUSED';
    return {
      id: `att-${studentId}-${s.id}`,
      studentId,
      sessionId: s.id,
      sessionCode: s.code,
      sessionTopic: s.topic,
      status,
      markedAt: s.scheduledDate!,
      notes: null,
    };
  });
}

export function attendancePercent(studentId: string): number {
  const records = generateAttendance(studentId);
  if (records.length === 0) return 100;
  const present = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  return Math.round((present / records.length) * 100);
}

// ---------------------------------------------------------------------------
// Submissions & Grades generation (per student)
// ---------------------------------------------------------------------------

export function generateSubmissions(studentId: string): Submission[] {
  const rand = seededRandom(studentId + '-submissions');
  return ASSESSMENT_DEFINITIONS.filter((d) => d.type === 'ASSIGNMENT' || d.type === 'CASE_STUDY').map((def) => {
    const due = new Date(def.dueDate);
    const overdue = isPast(due);
    const r = rand();

    if (!overdue) {
      // Not yet due — mostly not submitted, occasionally submitted early
      if (r > 0.8) {
        const submittedAt = new Date(due.getTime() - 2 * 24 * 60 * 60 * 1000);
        return {
          id: `sub-${studentId}-${def.id}`,
          studentId,
          assessmentId: def.id,
          assessment: def,
          fileUrl: `mock://submissions/${studentId}/${def.id}.pdf`,
          fileName: `${def.title.split(':')[0]}.pdf`,
          status: 'SUBMITTED',
          submittedAt: submittedAt.toISOString(),
          score: null,
          feedback: null,
          gradedAt: null,
        } as Submission;
      }
      return {
        id: `sub-${studentId}-${def.id}`,
        studentId,
        assessmentId: def.id,
        assessment: def,
        fileUrl: null,
        fileName: null,
        status: 'NOT_SUBMITTED',
        submittedAt: null,
        score: null,
        feedback: null,
        gradedAt: null,
      } as Submission;
    }

    // Past due: mostly graded, some late, rare miss
    if (r > 0.93) {
      return {
        id: `sub-${studentId}-${def.id}`,
        studentId,
        assessmentId: def.id,
        assessment: def,
        fileUrl: null,
        fileName: null,
        status: 'NOT_SUBMITTED',
        submittedAt: null,
        score: null,
        feedback: null,
        gradedAt: null,
      } as Submission;
    }

    const late = r > 0.85;
    const submittedAt = new Date(due.getTime() + (late ? 1 : -1) * 24 * 60 * 60 * 1000);
    const score = Math.round(70 + rand() * 28 - (late ? 8 : 0));
    const feedbacks = [
      'Strong structure and clear recommendations — well done.',
      'Good effort. Add more specific data points to strengthen your analysis next time.',
      'Excellent application of frameworks discussed in class.',
      'Solid work overall; watch formatting and citation consistency.',
      'Creative approach — consider budget realism in future submissions.',
    ];
    return {
      id: `sub-${studentId}-${def.id}`,
      studentId,
      assessmentId: def.id,
      assessment: def,
      fileUrl: `mock://submissions/${studentId}/${def.id}.pdf`,
      fileName: `${def.title.split(':')[0]}.pdf`,
      status: late ? 'LATE' : 'GRADED',
      submittedAt: submittedAt.toISOString(),
      score,
      feedback: feedbacks[Math.floor(rand() * feedbacks.length)],
      gradedAt: new Date(submittedAt.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    } as Submission;
  });
}

export function generateGrades(studentId: string): Grade[] {
  const submissions = generateSubmissions(studentId);
  const grades: Grade[] = [];

  const assignmentSubs = submissions.filter((s) => s.assessment.type === 'ASSIGNMENT' && s.score != null);
  if (assignmentSubs.length > 0) {
    const avg = assignmentSubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / assignmentSubs.length;
    grades.push({
      id: `grade-${studentId}-assignments`,
      studentId,
      category: 'Weekly Assignments',
      score: Math.round(avg),
      maxScore: 100,
      letterGrade: letterFor(avg),
      comments: `${assignmentSubs.length} of ${ASSESSMENT_DEFINITIONS.filter((d) => d.type === 'ASSIGNMENT').length} assignments graded so far.`,
      createdAt: new Date().toISOString(),
    });
  }

  const caseStudySubs = submissions.filter((s) => s.assessment.type === 'CASE_STUDY' && s.score != null);
  if (caseStudySubs.length > 0) {
    const avg = caseStudySubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / caseStudySubs.length;
    grades.push({
      id: `grade-${studentId}-casestudies`,
      studentId,
      category: 'Case Studies',
      score: Math.round(avg),
      maxScore: 100,
      letterGrade: letterFor(avg),
      comments: `${caseStudySubs.length} of ${ASSESSMENT_DEFINITIONS.filter((d) => d.type === 'CASE_STUDY').length} case studies graded so far.`,
      createdAt: new Date().toISOString(),
    });
  }

  const rand = seededRandom(studentId + '-participation');
  const participationScore = Math.round(80 + rand() * 18);
  grades.push({
    id: `grade-${studentId}-participation`,
    studentId,
    category: 'Class Participation',
    score: participationScore,
    maxScore: 100,
    letterGrade: letterFor(participationScore),
    comments: 'Based on engagement, Q&A participation and punctuality.',
    createdAt: new Date().toISOString(),
  });

  return grades;
}

function letterFor(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function overallWeightedScore(studentId: string): { score: number; breakdown: { label: string; weight: number; score: number | null }[] } {
  const grades = generateGrades(studentId);
  const internship = generateInternship(studentId);
  const assignmentsGrade = grades.find((g) => g.category === 'Weekly Assignments');
  const caseStudiesGrade = grades.find((g) => g.category === 'Case Studies');
  const participationGrade = grades.find((g) => g.category === 'Class Participation');

  const breakdown = [
    { label: 'Weekly Assignments', weight: 20, score: assignmentsGrade?.score ?? null },
    { label: 'Case Studies', weight: 20, score: caseStudiesGrade?.score ?? null },
    { label: 'Internship Report', weight: 20, score: internship.status === 'evaluated' ? 88 : null },
    { label: 'Capstone Project', weight: 25, score: null },
    { label: 'Class Participation', weight: 10, score: participationGrade?.score ?? null },
    { label: 'Final Evaluation', weight: 5, score: null },
  ];

  let earned = 0;
  let weightCounted = 0;
  breakdown.forEach((b) => {
    if (b.score != null) {
      earned += (b.score / 100) * b.weight;
      weightCounted += b.weight;
    }
  });

  const projected = weightCounted > 0 ? Math.round((earned / weightCounted) * 100) : 0;
  return { score: projected, breakdown };
}

// ---------------------------------------------------------------------------
// Internship generation (per student)
// ---------------------------------------------------------------------------

const INTERNSHIP_ORGS = ['Momentum Events & Weddings', 'Skyline Corporate Experiences'];
const INTERNSHIP_ACTIVITIES = [
  'Assisted with vendor coordination for a 200-guest corporate gala',
  'Prepared run-of-show document and briefed on-ground crew',
  'Managed guest registration desk and badge printing',
  'Coordinated AV setup checks with the production team',
  'Supported client-facing walkthrough of venue and floor plan',
  'Compiled post-event feedback survey results',
  'Assisted with load-in and load-out logistics scheduling',
  'Shadowed sponsorship manager during partner outreach calls',
];

export function generateInternship(studentId: string): InternshipRecord {
  const rand = seededRandom(studentId + '-internship');
  const idx = studentId === 'student-1' ? 0 : 1;
  const requiredHours = 30;

  // Only start generating logs once we've crossed into the internship window
  // (around week 21). Before that, internship is "not_started".
  const internshipWeekMonday = mondayOfWeek(21);
  const started = isPast(internshipWeekMonday);

  const logs = [];
  let loggedHours = 0;
  if (started) {
    const numLogs = 3 + Math.floor(rand() * 6);
    for (let i = 0; i < numLogs; i++) {
      const daysAfterStart = Math.floor(rand() * 18);
      const date = new Date(internshipWeekMonday);
      date.setDate(date.getDate() + daysAfterStart);
      if (isPast(date)) {
        const hours = Math.round((2 + rand() * 4) * 2) / 2;
        loggedHours += hours;
        logs.push({
          id: `log-${studentId}-${i}`,
          internshipId: `internship-${studentId}`,
          date: date.toISOString(),
          hoursLogged: hours,
          activityDescription: INTERNSHIP_ACTIVITIES[i % INTERNSHIP_ACTIVITIES.length],
          createdAt: date.toISOString(),
        });
      }
    }
  }
  logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  loggedHours = Math.round(loggedHours * 10) / 10;

  let status: InternshipRecord['status'] = 'not_started';
  if (started && loggedHours > 0 && loggedHours < requiredHours) status = 'in_progress';
  if (loggedHours >= requiredHours) status = 'submitted';

  return {
    id: `internship-${studentId}`,
    studentId,
    organization: started ? INTERNSHIP_ORGS[idx] : null,
    supervisorName: started ? (idx === 0 ? 'Neha Kulkarni' : 'Suresh Bhatia') : null,
    supervisorEmail: started ? (idx === 0 ? 'neha.k@momentumevents.example' : 's.bhatia@skylinecorp.example') : null,
    supervisorPhone: started ? '+91 90000 11122' : null,
    startDate: started ? internshipWeekMonday.toISOString() : null,
    endDate: null,
    requiredHours,
    loggedHours,
    status,
    reportUrl: null,
    logs,
  };
}

// ---------------------------------------------------------------------------
// Messages / Conversations (per student) — one thread per faculty member
// ---------------------------------------------------------------------------

const FACULTY_LIST = SUBJECTS.map((s) => ({
  id: s.lecturerId!,
  name: s.lecturerName!,
  role: `Faculty · ${s.name}`,
  subjectCode: s.code,
}));

const SAMPLE_THREADS: Record<string, { fromStudent: boolean; body: string; daysAgo: number }[]> = {
  'Lecturer 1': [
    { fromStudent: true, body: 'Hi! Quick question about the leadership styles assignment — can we use a real manager we know as our case example?', daysAgo: 12 },
    { fromStudent: false, body: 'Yes, absolutely — real-world examples make for stronger analysis. Just make sure to map their behavior to at least two of the theories we covered.', daysAgo: 12 },
    { fromStudent: true, body: 'Perfect, thank you!', daysAgo: 12 },
  ],
  'Lecturer 4': [
    { fromStudent: true, body: 'For the ROS exercise, should buffer time be included per segment or just at major transitions?', daysAgo: 5 },
    { fromStudent: false, body: 'Good question — add buffer at every major transition (stage changes, meal service, AV cues). 5-10 minutes is typical.', daysAgo: 5 },
  ],
  'Lecturer 6': [
    { fromStudent: true, body: 'Is there a template we should use for the client proposal draft, or fully open format?', daysAgo: 1 },
  ],
};

export function generateConversations(studentId: string): Conversation[] {
  return FACULTY_LIST.filter((f) => SAMPLE_THREADS[f.id]).map((f) => {
    const thread = SAMPLE_THREADS[f.id];
    const messages: Message[] = thread.map((m, i) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - m.daysAgo);
      createdAt.setHours(10 + i, 0, 0, 0);
      return {
        id: `msg-${studentId}-${f.id}-${i}`,
        senderId: m.fromStudent ? studentId : f.id,
        senderName: m.fromStudent ? 'You' : f.name,
        recipientId: m.fromStudent ? f.id : studentId,
        recipientName: m.fromStudent ? f.name : 'You',
        subject: null,
        body: m.body,
        isRead: true,
        createdAt: createdAt.toISOString(),
      };
    });
    const last = messages[messages.length - 1];
    return {
      facultyId: f.id,
      facultyName: f.name,
      facultyRole: f.role,
      subjectCode: f.subjectCode,
      lastMessage: last,
      unreadCount: 0,
      messages,
    };
  });
}

// ---------------------------------------------------------------------------
// Notifications (per student)
// ---------------------------------------------------------------------------

export function generateNotifications(studentId: string): Notification[] {
  const notifications: Notification[] = [];
  const upcomingSessions = SESSIONS.filter((s) => s.status === 'upcoming').slice(0, 2);
  upcomingSessions.forEach((s, i) => {
    notifications.push({
      id: `notif-${studentId}-session-${s.id}`,
      userId: studentId,
      type: 'SESSION_REMINDER',
      title: 'Upcoming session',
      body: `${s.topic} starts ${s.startTime} on ${s.day}.`,
      isRead: i > 0,
      link: `Session:${s.id}`,
      createdAt: new Date().toISOString(),
    });
  });

  const graded = generateSubmissions(studentId).filter((s) => s.status === 'GRADED').slice(-2);
  graded.forEach((s, i) => {
    notifications.push({
      id: `notif-${studentId}-grade-${s.id}`,
      userId: studentId,
      type: 'GRADE_POSTED',
      title: 'Grade posted',
      body: `Your submission for "${s.assessment.title}" was graded: ${s.score}/100.`,
      isRead: i > 0,
      link: `Assignment:${s.assessmentId}`,
      createdAt: s.gradedAt ?? new Date().toISOString(),
    });
  });

  notifications.push({
    id: `notif-${studentId}-announcement-1`,
    userId: studentId,
    type: 'ANNOUNCEMENT',
    title: 'Weekend 2 logistics shared',
    body: 'Travel and accommodation details for the mid-point in-person weekend have been posted. Please confirm attendance.',
    isRead: false,
    link: 'Weekend:W2',
    createdAt: new Date().toISOString(),
  });

  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
