import Link from "next/link";
import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  APPLIED: "bg-slate-100 text-slate-600",
  REGISTERED: "bg-brand-100 text-brand-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-violet-100 text-violet-700",
  WITHDRAWN: "bg-red-100 text-red-700",
};

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { q?: string; batch?: string; status?: string };
}) {
  await getFacultyContext();

  const where: any = {};
  if (searchParams.batch) where.batch = searchParams.batch;
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.q) {
    where.OR = [
      { studentId: { contains: searchParams.q, mode: "insensitive" } },
      { user: { name: { contains: searchParams.q, mode: "insensitive" } } },
      { user: { email: { contains: searchParams.q, mode: "insensitive" } } },
    ];
  }

  const [students, batches] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: true,
        attendance: true,
        internship: true,
      },
      orderBy: { studentId: "asc" },
    }),
    prisma.student.findMany({ distinct: ["batch"], select: { batch: true } }),
  ]);

  const totalSessions = await prisma.session.count();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Roster</h1>
        <p className="text-slate-500 mt-1">{students.length} students found</p>
      </div>

      <form className="card flex flex-wrap items-end gap-4" method="get">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Search</label>
          <input
            className="input"
            name="q"
            placeholder="Name, student ID, or email"
            defaultValue={searchParams.q || ""}
          />
        </div>
        <div>
          <label className="label">Batch</label>
          <select name="batch" defaultValue={searchParams.batch || ""} className="input">
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b.batch} value={b.batch}>
                {b.batch}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={searchParams.status || ""} className="input">
            <option value="">All statuses</option>
            {Object.keys(STATUS_STYLES).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
        <Link href="/students" className="btn-outline">
          Reset
        </Link>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="table-base">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Batch</th>
              <th>Status</th>
              <th>Attendance %</th>
              <th>Internship</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const present = s.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
              const marked = s.attendance.length;
              const pct = marked > 0 ? Math.round((present / marked) * 100) : null;
              return (
                <tr key={s.id}>
                  <td className="font-medium">{s.studentId}</td>
                  <td>{s.user.name}</td>
                  <td>{s.batch}</td>
                  <td>
                    <span className={`badge ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                  </td>
                  <td>
                    {pct !== null ? (
                      <span className={pct < 80 ? "text-red-600 font-medium" : "text-slate-700"}>{pct}%</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="capitalize">{s.internship?.status.replace("_", " ") || "—"}</td>
                  <td>
                    <Link href={`/students/${s.id}`} className="text-brand-600 hover:underline text-sm font-medium">
                      View Profile
                    </Link>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No students match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
