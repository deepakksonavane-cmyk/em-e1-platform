import { requireStudent } from "@/lib/student";
import { query } from "@/lib/db";
import { Card } from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";

interface SubjectRow {
  id: string;
  code: string;
  name: string;
  totalSessions: number;
  totalHours: number;
  weeksLabel: string;
  lecturerName: string | null;
  completedSessions: number;
}

export default async function CoursesPage() {
  const student = await requireStudent();

  const subjects = await query<SubjectRow>(
    `SELECT
       sub.id, sub.code, sub.name, sub."totalSessions", sub."totalHours", sub."weeksLabel",
       u.name AS "lecturerName",
       COUNT(se.id) FILTER (WHERE se.status = 'completed')::int AS "completedSessions"
     FROM "Subject" sub
     LEFT JOIN "Faculty" f ON f.id = sub."lecturerId"
     LEFT JOIN "User" u ON u.id = f."userId"
     LEFT JOIN "Session" se ON se."subjectId" = sub.id
     GROUP BY sub.id, u.name
     ORDER BY sub.code ASC`
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <p className="text-slate-500 text-sm mt-1">
          The 6 subjects that make up the {student.batch} E1 diploma program.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {subjects.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{s.code}</p>
                <h3 className="font-semibold text-slate-900 mt-0.5">{s.name}</h3>
              </div>
            </div>
            <div className="text-sm text-slate-500 space-y-1 mb-4">
              <p>👤 {s.lecturerName ?? "Unassigned"}</p>
              <p>🗓️ Weeks {s.weeksLabel} · {s.totalSessions} sessions · {s.totalHours} hours</p>
            </div>
            <ProgressBar
              label="Sessions completed"
              value={s.completedSessions}
              max={s.totalSessions}
            />
            <div className="mt-4">
              <Link
                href={`/sessions?subject=${s.code}`}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                View sessions →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
