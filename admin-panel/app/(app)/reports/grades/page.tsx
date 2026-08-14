import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { computeOverallScore, weightForCategory } from "@/lib/grades";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIES = ["Weekly Assignments", "Case Studies", "Internship", "Capstone", "Participation", "Final"];

export default async function GradesReportPage({
  searchParams,
}: {
  searchParams: { subject?: string; batch?: string };
}) {
  await getFacultyContext();
  const subjects = await prisma.subject.findMany({ orderBy: { code: "asc" } });
  const batches = await prisma.student.findMany({ distinct: ["batch"], select: { batch: true } });

  const where: any = { status: "ACTIVE" };
  if (searchParams.batch) where.batch = searchParams.batch;

  const students = await prisma.student.findMany({
    where,
    include: {
      user: true,
      grades: true,
      submissions: { include: { assessment: true } },
    },
    orderBy: { studentId: "asc" },
  });

  const subjectCode = searchParams.subject || "";

  const report = students.map((st) => {
    const categoryScores = CATEGORIES.map((cat) => {
      const rows = st.grades.filter((g) => g.category === cat);
      const avgPercent =
        rows.length > 0 ? rows.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / rows.length : null;
      return { category: cat, avgPercent, weight: weightForCategory(cat), count: rows.length };
    });
    const overall = computeOverallScore(categoryScores);

    let subjectAvg: number | null = null;
    if (subjectCode) {
      const subSubs = st.submissions.filter((s) => s.assessment.subjectCode === subjectCode && s.score !== null);
      if (subSubs.length > 0) {
        subjectAvg =
          subSubs.reduce((sum, s) => sum + ((s.score as number) / s.assessment.maxScore) * 100, 0) / subSubs.length;
      }
    }

    return {
      studentId: st.studentId,
      name: st.user.name,
      batch: st.batch,
      categoryScores,
      overallPercent: overall.overallPercent,
      letterGrade: overall.letterGrade,
      subjectAvg,
    };
  });

  const exportQs = new URLSearchParams({
    subject: subjectCode,
    batch: searchParams.batch || "",
  }).toString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Grades Report</h1>
        <p className="text-slate-500 mt-1">
          Weighted overall score: 20% assignments · 20% case studies · 20% internship · 25% capstone · 10%
          participation · 5% final evaluation
        </p>
      </div>

      <form className="card flex flex-wrap items-end gap-4" method="get">
        <div>
          <label className="label">Subject (optional, for subject-level average)</label>
          <select name="subject" defaultValue={subjectCode} className="input">
            <option value="">All / program-wide only</option>
            {subjects.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
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
        <button type="submit" className="btn-primary">
          Generate
        </button>
      </form>

      <div className="flex gap-3">
        <a href={`/api/reports/grades/export?format=xlsx&${exportQs}`} className="btn-secondary">
          Export to Excel
        </a>
        <a href={`/api/reports/grades/export?format=pdf&${exportQs}`} className="btn-secondary">
          Export to PDF
        </a>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table-base">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Batch</th>
              {subjectCode && <th>{subjectCode} Avg</th>}
              <th>Assignments</th>
              <th>Case Studies</th>
              <th>Internship</th>
              <th>Capstone</th>
              <th>Participation</th>
              <th>Final</th>
              <th>Overall</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r) => (
              <tr key={r.studentId}>
                <td className="font-medium">{r.studentId}</td>
                <td>{r.name}</td>
                <td>{r.batch}</td>
                {subjectCode && <td>{r.subjectAvg !== null ? `${Math.round(r.subjectAvg)}%` : "—"}</td>}
                {r.categoryScores.map((c) => (
                  <td key={c.category}>{c.avgPercent !== null ? `${Math.round(c.avgPercent)}%` : "—"}</td>
                ))}
                <td className="font-semibold">{r.overallPercent !== null ? `${r.overallPercent}%` : "—"}</td>
                <td>{r.letterGrade || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-slate-400">
        <Link href="/reports/attendance" className="text-brand-600 hover:underline">
          ← Switch to Attendance Report
        </Link>
      </div>
    </div>
  );
}
