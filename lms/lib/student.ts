import { redirect } from "next/navigation";
import { queryOne } from "./db";
import { getSession } from "./auth";
import type { Student, User } from "./types";

export type StudentWithUser = Student & { user: User };

/**
 * Server-side helper for pages under app/(app)/*: requires a logged-in
 * STUDENT and returns their Student + User record. Faculty/Admin users are
 * redirected — this LMS build is scoped to the student experience per the
 * project brief (Faculty Admin Panel is a separate app).
 */
export async function requireStudent(): Promise<StudentWithUser> {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await queryOne<User>('SELECT * FROM "User" WHERE id = $1', [
    session.userId,
  ]);
  if (!user) redirect("/login");

  if (user.role !== "STUDENT") {
    redirect("/faculty-notice");
  }

  const student = await queryOne<Student>(
    'SELECT * FROM "Student" WHERE "userId" = $1',
    [user.id]
  );
  if (!student) redirect("/login");

  return { ...student, user };
}

export const PROGRAM = {
  name: "Event Management & Team Leadership E1",
  totalHours: 420,
  totalWeeks: 24,
  totalSubjects: 6,
  totalSessions: 74,
  attendancePolicyPct: 80,
};
