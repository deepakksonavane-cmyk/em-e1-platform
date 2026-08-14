import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AttendanceReportPage({
  searchParams,
}: {
  searchParams: { subject?: string; from?: string; to?: string };
}) {
  await getFacultyContext();
  const subjects = await prisma.subject.findMany({ orderBy: { code: "asc" } });

  const subjectCode = searchParams.subject || "";
  const from = searchParams.from ? new Date(searchParams.from) : null;
  const to = searchParams.to ? new Date(searchParams.to) : null;

  let rows: any[] = [];
  let summary: { studentId: string; name: string; present: number; absent: number; late: number; excused: number; total: number; pct: number }[] = [];

  if (subjectCode) {
    const subject = subjects.find((s) => s.code === subjectCode);
    if (subject) {
      const sessionWhere: any = { subjectId: subject.id };
      if (from || to) {
        sessionWhere.scheduledDate = {};
        if (from) sessionWhere.scheduledDate.gte = from;
        if (to) sessionWhere.scheduledDate.lte = to;
      }
      const sessions = await prisma.session.findMany({ where: sessionWhere, select: { id: true } });
      const sessionIds = sessions.map((s) => s.id);

      const attendance = await prisma.attendance.findMany({
        where: { sessionId: { in: sessionIds } },
        include: { student: { include: { user: true } }, session: true },
      });

      rows = attendance;

      const byStudent = new Map<string, any>();
      for (const a of attendance) {
        const key = a.studentId;
        if (!byStudent.has(key)) {
          byStudent.set(key, {
            studentId: a.student.studentId,
            name: a.student.user.name,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: 0,
          });
        }
        const rec = byStudent.get(key);
        rec.total += 1;
        if (a.status === "PRESENT") rec.present += 1;
        if (a.status === "ABSENT") rec.absent += 1;
        if (a.status === "LATE") rec.late += 1;
        if (a.status === "EXCUSED") rec.excused += 1;
      }
      summary = Array.from(byStudent.values()).map((r) => ({
        ...r,
        pct: r.total > 0 ? Math.round(((r.present + r.late) / r.total) * 100) : 0,
      }));
    }
  }

  const exportQs = new URLSearchParams({
    subject: subjectCode,
    from: searchParams.from || "",
    to: searchParams.to || "",
  }).toString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Report</h1>
        <p className="text-slate-500 mt-1">Select a subject and date range to generate a report</p>
      </div>

      <form className="card flex flex-wrap items-end gap-4" method="get">
        <div>
          <label className="label">Subject</label>
          <select name="subject" defaultValue={subjectCode} className="input" required>
            <option value="">Select a subject</option>
            {subjects.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">From</label>
          <input type="date" name="from" defaultValue={searchParams.from || ""} className="input" />
        </div>
        <div>
          <label className="label">To</label>
          <input type="date" name="to" defaultValue={searchParams.to || ""} className="input" />
        </div>
        <button type="submit" className="btn-primary">
          Generate
        </button>
      </form>

      {subjectCode && (
        <>
          <div className="flex gap-3">
            <a href={`/api/reports/attendance/export?format=xlsx&${exportQs}`} className="btn-secondary">
              Export to Excel
            </a>
            <a href={`/api/reports/attendance/export?format=pdf&${exportQs}`} className="btn-secondary">
              Export to PDF
            </a>
          </div>

          <div className="card overflow-x-auto p-0">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Present</th>
                  <th>Late</th>
                  <th>Excused</th>
                  <th>Absent</th>
                  <th>Sessions Marked</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((r) => (
                  <tr key={r.studentId}>
                    <td className="font-medium">{r.studentId}</td>
                    <td>{r.name}</td>
                    <td>{r.present}</td>
                    <td>{r.late}</td>
                    <td>{r.excused}</td>
                    <td>{r.absent}</td>
                    <td>{r.total}</td>
                    <td className={r.pct < 80 ? "text-red-600 font-semibold" : ""}>{r.pct}%</td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No attendance data found for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="text-sm text-slate-400">
        <Link href="/reports/grades" className="text-brand-600 hover:underline">
          Switch to Grades Report →
        </Link>
      </div>
    </div>
  );
}
