import Link from "next/link";
import { requireStudent } from "@/lib/student";
import { query } from "@/lib/db";
import { Card } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import type { Session, Subject } from "@/lib/types";
import { format } from "date-fns";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; week?: string }>;
}) {
  await requireStudent();
  const params = await searchParams;

  const subjects = await query<Subject>('SELECT * FROM "Subject" ORDER BY code ASC');

  const conditions: string[] = [];
  const values: unknown[] = [];
  if (params.subject) {
    values.push(params.subject);
    conditions.push(`sub.code = $${values.length}`);
  }
  if (params.week) {
    values.push(Number(params.week));
    conditions.push(`s.week = $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sessions = await query<Session & { subjectCode: string; subjectName: string }>(
    `SELECT s.*, sub.code AS "subjectCode", sub.name AS "subjectName"
     FROM "Session" s
     JOIN "Subject" sub ON sub.id = s."subjectId"
     ${where}
     ORDER BY s."sessionNumber" ASC`,
    values
  );

  const weeks = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
        <p className="text-slate-500 text-sm mt-1">
          All 74 sessions across the 24-week program. Filter by subject or week.
        </p>
      </div>

      <Card className="!p-4">
        <form className="flex flex-wrap items-end gap-4" method="GET">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
            <select
              name="subject"
              defaultValue={params.subject || ""}
              className="rounded-md border border-slate-300 text-sm px-3 py-2"
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Week</label>
            <select
              name="week"
              defaultValue={params.week || ""}
              className="rounded-md border border-slate-300 text-sm px-3 py-2"
            >
              <option value="">All weeks</option>
              {weeks.map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2"
          >
            Filter
          </button>
          {(params.subject || params.week) && (
            <Link href="/sessions" className="text-sm text-slate-500 hover:underline">
              Clear filters
            </Link>
          )}
        </form>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Topic</th>
              <th className="text-left px-4 py-3">Subject</th>
              <th className="text-left px-4 py-3">Week / Day</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-400">{s.code}</td>
                <td className="px-4 py-3">
                  <Link href={`/sessions/${s.id}`} className="font-medium text-slate-800 hover:text-indigo-600">
                    {s.topic}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{s.subjectCode}</td>
                <td className="px-4 py-3 text-slate-500">
                  Week {s.week} · {s.day}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {s.scheduledDate ? format(new Date(s.scheduledDate), "MMM d, yyyy") : "TBD"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
