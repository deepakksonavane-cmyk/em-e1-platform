"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool, query, queryOne, newId } from "./db";
import { requireStudent } from "./student";
import { saveUploadedFile } from "./upload";
import { hashPassword, verifyPassword, getSession } from "./auth";
import { sendEmail } from "./email";
import type { AssessmentDefinition, User } from "./types";

// ---------------------------------------------------------------------------
// Assessments: submit an assignment / case study / capstone / internship report
// ---------------------------------------------------------------------------
export async function submitAssessmentAction(formData: FormData): Promise<void> {
  const student = await requireStudent();
  const assessmentId = String(formData.get("assessmentId") || "");
  const textContent = String(formData.get("textContent") || "").trim();
  const file = formData.get("file") as File | null;

  const def = await queryOne<AssessmentDefinition>(
    'SELECT * FROM "AssessmentDefinition" WHERE id = $1',
    [assessmentId]
  );
  if (!def) throw new Error("Assessment not found");

  let fileUrl: string | null = null;
  if (file && file.size > 0) {
    fileUrl = await saveUploadedFile(file, "submissions");
  }
  if (!fileUrl && !textContent) {
    throw new Error("Please attach a file or enter a text submission.");
  }

  const dueDate = def.dueOffsetWeek
    ? weekToApproxDate(def.dueOffsetWeek)
    : null;
  const isLate = dueDate ? new Date() > dueDate : false;

  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM "Submission" WHERE "studentId" = $1 AND "assessmentId" = $2',
    [student.id, assessmentId]
  );

  if (existing) {
    await query(
      `UPDATE "Submission"
       SET "fileUrl" = COALESCE($1, "fileUrl"), "textContent" = $2, status = $3,
           "submittedAt" = now(), "updatedAt" = now()
       WHERE id = $4`,
      [fileUrl, textContent || null, isLate ? "LATE" : "SUBMITTED", existing.id]
    );
  } else {
    await query(
      `INSERT INTO "Submission" (id, "studentId", "assessmentId", "fileUrl", "textContent", status, "submittedAt")
       VALUES ($1,$2,$3,$4,$5,$6, now())`,
      [newId(), student.id, assessmentId, fileUrl, textContent || null, isLate ? "LATE" : "SUBMITTED"]
    );
  }

  revalidatePath(`/assessments/${assessmentId}`);
  revalidatePath("/assessments");
  revalidatePath("/dashboard");
}

function weekToApproxDate(week: number): Date {
  const start = new Date(process.env.PROGRAM_START_DATE || "2026-06-08T00:00:00Z");
  const d = new Date(start);
  d.setUTCDate(d.getUTCDate() + (week - 1) * 7 + 6); // Sunday of that week
  return d;
}

// ---------------------------------------------------------------------------
// Internship logbook
// ---------------------------------------------------------------------------
export async function addInternshipLogAction(formData: FormData): Promise<void> {
  const student = await requireStudent();
  const date = String(formData.get("date") || "");
  const hours = Number(formData.get("hours") || 0);
  const activity = String(formData.get("activity") || "").trim();

  if (!date || !hours || hours <= 0 || !activity) {
    throw new Error("Please fill in date, hours, and activity description.");
  }

  const record = await queryOne<{ id: string }>(
    'SELECT id FROM "InternshipRecord" WHERE "studentId" = $1',
    [student.id]
  );
  if (!record) throw new Error("Internship record not found.");

  await query(
    `INSERT INTO "InternshipLog" (id, "internshipId", date, "hoursLogged", "activityDescription")
     VALUES ($1,$2,$3,$4,$5)`,
    [newId(), record.id, date, hours, activity]
  );

  await query(
    `UPDATE "InternshipRecord"
     SET "loggedHours" = (SELECT COALESCE(SUM("hoursLogged"),0) FROM "InternshipLog" WHERE "internshipId" = $1),
         status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END
     WHERE id = $1`,
    [record.id]
  );

  revalidatePath("/internship");
}

export async function deleteInternshipLogAction(formData: FormData): Promise<void> {
  const student = await requireStudent();
  const logId = String(formData.get("logId") || "");

  const record = await queryOne<{ id: string }>(
    'SELECT id FROM "InternshipRecord" WHERE "studentId" = $1',
    [student.id]
  );
  if (!record) return;

  await query(
    'DELETE FROM "InternshipLog" WHERE id = $1 AND "internshipId" = $2',
    [logId, record.id]
  );
  await query(
    `UPDATE "InternshipRecord"
     SET "loggedHours" = (SELECT COALESCE(SUM("hoursLogged"),0) FROM "InternshipLog" WHERE "internshipId" = $1)
     WHERE id = $1`,
    [record.id]
  );

  revalidatePath("/internship");
}

export async function updateInternshipDetailsAction(formData: FormData): Promise<void> {
  const student = await requireStudent();
  const organization = String(formData.get("organization") || "").trim() || null;
  const supervisorName = String(formData.get("supervisorName") || "").trim() || null;
  const supervisorEmail = String(formData.get("supervisorEmail") || "").trim() || null;
  const supervisorPhone = String(formData.get("supervisorPhone") || "").trim() || null;

  await query(
    `UPDATE "InternshipRecord"
     SET organization = $1, "supervisorName" = $2, "supervisorEmail" = $3, "supervisorPhone" = $4
     WHERE "studentId" = $5`,
    [organization, supervisorName, supervisorEmail, supervisorPhone, student.id]
  );

  revalidatePath("/internship");
}

export async function submitInternshipReportAction(formData: FormData): Promise<void> {
  const student = await requireStudent();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Please attach your internship report file.");

  const fileUrl = await saveUploadedFile(file, "internship-reports");

  await query(
    `UPDATE "InternshipRecord" SET "reportUrl" = $1, status = 'submitted' WHERE "studentId" = $2`,
    [fileUrl, student.id]
  );

  // Also create/update a Submission row against the "Internship Report" assessment definition, if present.
  const def = await queryOne<{ id: string }>(
    `SELECT id FROM "AssessmentDefinition" WHERE type = 'INTERNSHIP_REPORT' LIMIT 1`
  );
  if (def) {
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM "Submission" WHERE "studentId" = $1 AND "assessmentId" = $2',
      [student.id, def.id]
    );
    if (existing) {
      await query(
        `UPDATE "Submission" SET "fileUrl" = $1, status = 'SUBMITTED', "submittedAt" = now(), "updatedAt" = now() WHERE id = $2`,
        [fileUrl, existing.id]
      );
    } else {
      await query(
        `INSERT INTO "Submission" (id, "studentId", "assessmentId", "fileUrl", status, "submittedAt")
         VALUES ($1,$2,$3,$4,'SUBMITTED', now())`,
        [newId(), student.id, def.id, fileUrl]
      );
    }
  }

  revalidatePath("/internship");
  revalidatePath("/assessments");
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------
export async function sendMessageAction(formData: FormData): Promise<void> {
  const student = await requireStudent();
  const recipientId = String(formData.get("recipientId") || "");
  const subject = String(formData.get("subject") || "").trim() || null;
  const body = String(formData.get("body") || "").trim();
  if (!recipientId || !body) throw new Error("Please choose a recipient and enter a message.");

  await query(
    `INSERT INTO "Message" (id, "senderId", "recipientId", subject, body)
     VALUES ($1,$2,$3,$4,$5)`,
    [newId(), student.user.id, recipientId, subject, body]
  );

  const recipient = await queryOne<User>('SELECT * FROM "User" WHERE id = $1', [recipientId]);
  if (recipient) {
    await sendEmail({
      to: recipient.email,
      subject: subject || `New message from ${student.user.name}`,
      html: `<p>${body}</p>`,
    });
  }

  revalidatePath("/messages");
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export async function updateProfileAction(formData: FormData): Promise<void> {
  const student = await requireStudent();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const state = String(formData.get("state") || "").trim() || null;
  const emergencyContactName = String(formData.get("emergencyContactName") || "").trim() || null;
  const emergencyContactPhone = String(formData.get("emergencyContactPhone") || "").trim() || null;
  const emergencyContactRelation = String(formData.get("emergencyContactRelation") || "").trim() || null;

  if (!name) throw new Error("Name is required.");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query('UPDATE "User" SET name = $1, phone = $2, "updatedAt" = now() WHERE id = $3', [
      name,
      phone,
      student.user.id,
    ]);
    await client.query(
      `UPDATE "Student" SET city = $1, state = $2, "emergencyContactName" = $3,
         "emergencyContactPhone" = $4, "emergencyContactRelation" = $5, "updatedAt" = now()
       WHERE id = $6`,
      [city, state, emergencyContactName, emergencyContactPhone, emergencyContactRelation, student.id]
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  revalidatePath("/profile");
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const student = await requireStudent();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");

  const valid = await verifyPassword(currentPassword, student.user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect.");

  const hash = await hashPassword(newPassword);
  await query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = now() WHERE id = $2', [
    hash,
    student.user.id,
  ]);

  revalidatePath("/profile");
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = String(formData.get("id") || "");
  await query('UPDATE "Notification" SET "isRead" = true WHERE id = $1 AND "userId" = $2', [
    id,
    session.userId,
  ]);
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  await query('UPDATE "Notification" SET "isRead" = true WHERE "userId" = $1', [session.userId]);
  revalidatePath("/notifications");
}
