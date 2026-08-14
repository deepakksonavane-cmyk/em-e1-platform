import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { computeOverallScore, weightForCategory, WEIGHTAGE } from "@/lib/grades";
import MessageStudentPanel from "./MessageStudentPanel";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  await getFacultyContext();

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      attendance: { include: { session: { include: { subject: true } } }, orderBy: { markedAt: "desc" } },
      submissions: { include: { assessment: true }, orderBy: { createdAt: "desc" } },
      grades: true,
      internship: { include: { logs: true } },
      certificate: true,
    },
  });

  if (!student) notFound();

  const totalMarked = student.attendance.length;
  const present = student.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const attendancePct = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : null;

  const categories = ["Weekly Assignments", "Case Studies", "Internship", "Capstone", "Participation", "Final"];
  const categoryScores = categories.map((cat) => {
    const rows = student.grades.filter((g) => g.category === cat);
    const avgPercent =
      rows.length > 0 ? rows.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / rows.length : null;
    return { category: cat, avgPercent, weight: weightForCategory(cat), count: rows.length };
  });

  const overall = computeOverallScore(categoryScores);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/students" className="text-sm text-brand-600 hover:underline">
            ← Back to roster
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">{student.user.name}</h1>
          <p className="text-slate-500">
            {student.studentId} · {student.batch} · {student.user.email}
          </p>
        </div>
        <span className="badge bg-brand-100 text-brand-700 text-sm">{student.status}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : "—"} warn={attendancePct !== null && attendancePct < 80} />
        <Metric label="Overall Score" value={overall.overallPercent !== null ? `${overall.overallPercent}%` : "—"} />
        <Metric label="Letter Grade" value={overall.letterGrade || "—"} />
        <Metric label="Internship Hours" value={`${student.internship?.loggedHours ?? 0}/${student.internship?.requiredHours ?? 30}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Grade Breakdown (Weighted)</h2>
          <div className="space-y-3">
            {categoryScores.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">
                    {c.category} <span className="text-slate-400">({c.weight}%)</span>
                  </span>
                  <span className="font-medium">{c.avgPercent !== null ? `${Math.round(c.avgPercent)}%` : "no data"}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${c.avgPercent ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Internship Progress</h2>
          {student.internship ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Organization:</span> {student.internship.organization || "—"}
              </p>
              <p>
                <span className="text-slate-500">Supervisor:</span> {student.internship.supervisorName || "—"}
              </p>
              <p>
                <span className="text-slate-500">Status:</span>{" "}
                <span className="capitalize">{student.internship.status.replace("_", " ")}</span>
              </p>
              <p>
                <span className="text-slate-500">Logged Hours:</span> {student.internship.loggedHours} /{" "}
                {student.internship.requiredHours}
              </p>
              {student.internship.logs.length > 0 && (
                <div className="pt-2">
                  <p className="text-slate-500 mb-1">Recent logs</p>
                  <ul className="space-y-1">
                    {student.internship.logs.slice(0, 5).map((log) => (
                      <li key={log.id} className="text-xs text-slate-600">
                        {format(log.date, "dd MMM")} — {log.hoursLogged}h — {log.activityDescription}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No internship record yet.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Submission History</h2>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Type</th>
                <th>Status</th>
                <th>Score</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {student.submissions.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium max-w-xs truncate">{s.assessment.title}</td>
                  <td>{s.assessment.type.replace("_", " ")}</td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-600">{s.status.replace("_", " ")}</span>
                  </td>
                  <td>{s.score !== null ? `${s.score}/${s.assessment.maxScore}` : "—"}</td>
                  <td>{s.submittedAt ? format(s.submittedAt, "dd MMM yyyy") : "—"}</td>
                </tr>
              ))}
              {student.submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No submissions on record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Attendance History</h2>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Session</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {student.attendance.map((a) => (
                <tr key={a.id}>
                  <td>{a.session.code}</td>
                  <td>{a.session.subject.code}</td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-600">{a.status}</span>
                  </td>
                </tr>
              ))}
              {student.attendance.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-slate-400">
                    No attendance records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MessageStudentPanel studentUserId={student.userId} studentName={student.user.name} />
    </div>
  );
}

function Metric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${warn ? "text-red-600" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
