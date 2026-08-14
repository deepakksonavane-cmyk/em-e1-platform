import Link from "next/link";
import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-slate-100 text-slate-600",
  live: "bg-emerald-100 text-emerald-700",
  completed: "bg-brand-100 text-brand-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: { subject?: string; status?: string; mine?: string };
}) {
  const { faculty, isAdmin } = await getFacultyContext();

  const subjects = await prisma.subject.findMany({ orderBy: { code: "asc" } });

  const showMineOnly = !isAdmin || searchParams.mine === "1";
  const where: any = {};
  if (showMineOnly) where.facultyId = faculty.id;
  if (searchParams.subject) {
    const subj = subjects.find((s) => s.code === searchParams.subject);
    if (subj) where.subjectId = subj.id;
  }
  if (searchParams.status) where.status = searchParams.status;

  const sessions = await prisma.session.findMany({
    where,
    include: { subject: true, faculty: { include: { user: true } } },
    orderBy: { sessionNumber: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
          <p className="text-slate-500 mt-1">
            {sessions.length} of 74 program sessions{showMineOnly ? " assigned to you" : ""}
          </p>
        </div>
      </div>

      <form className="card flex flex-wrap items-end gap-4" method="get">
        <div>
          <label className="label">Subject</label>
          <select name="subject" defaultValue={searchParams.subject || ""} className="input">
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={searchParams.status || ""} className="input">
            <option value="">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {isAdmin && (
          <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
            <input type="checkbox" name="mine" value="1" defaultChecked={searchParams.mine === "1"} />
            My sessions only
          </label>
        )}
        <button type="submit" className="btn-primary">
          Filter
        </button>
        <Link href="/sessions" className="btn-outline">
          Reset
        </Link>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="table-base">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Topic</th>
              <th>Subject</th>
              <th>Week / Day</th>
              <th>Hours</th>
              <th>Faculty</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.sessionNumber}</td>
                <td className="font-medium">{s.code}</td>
                <td className="max-w-xs truncate" title={s.topic}>
                  {s.topic}
                </td>
                <td>{s.subject.code}</td>
                <td>
                  W{s.week} · {s.day}
                </td>
                <td>{s.hours}h</td>
                <td>{s.faculty?.user.name || "Unassigned"}</td>
                <td>
                  <span className={`badge ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                </td>
                <td>
                  <Link href={`/sessions/${s.id}`} className="text-brand-600 hover:underline text-sm font-medium">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-400">
                  No sessions match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
