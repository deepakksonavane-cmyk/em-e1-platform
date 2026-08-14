import Link from "next/link";
import { requireStudent } from "@/lib/student";
import { query } from "@/lib/db";
import { Card, CardHeader } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import type { AssessmentDefinition, SubmissionStatus } from "@/lib/types";

interface Row extends AssessmentDefinition {
  status: SubmissionStatus | "NOT_SUBMITTED";
  score: number | null;
}

export default async function AssessmentsPage() {
  const student = await requireStudent();

  const rows = await query<Row>(
    `SELECT ad.*, COALESCE(sub.status, 'NOT_SUBMITTED') AS status, sub.score
     FROM "AssessmentDefinition" ad
     LEFT JOIN "Submission" sub ON sub."assessmentId" = ad.id AND sub."studentId" = $1
     WHERE ad.type IN ('ASSIGNMENT','CASE_STUDY')
     ORDER BY ad."dueOffsetWeek" ASC NULLS LAST, ad.title ASC`,
    [student.id]
  );

  const assignments = rows.filter((r) => r.type === "ASSIGNMENT");
  const caseStudies = rows.filter((r) => r.type === "CASE_STUDY");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
          <p className="text-slate-500 text-sm mt-1">
            6 weekly assignments (20%) · 8 case studies (20%) · Capstone (25%) · Internship report (20%)
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/assessments/capstone"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2"
          >
            Capstone Project
          </Link>
          <Link
            href="/internship"
            className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-medium rounded-md px-4 py-2"
          >
            Internship Report
          </Link>
        </div>
      </div>

      <AssessmentTable title="Weekly Assignments" rows={assignments} />
      <AssessmentTable title="Case Studies" rows={caseStudies} />
    </div>
  );
}

function AssessmentTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="p-5 pb-0">
        <CardHeader title={title} />
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3">Title</th>
            <th className="text-left px-5 py-3">Subject</th>
            <th className="text-left px-5 py-3">Due (Week)</th>
            <th className="text-left px-5 py-3">Status</th>
            <th className="text-left px-5 py-3">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="px-5 py-3">
                <Link href={`/assessments/${r.id}`} className="font-medium text-slate-800 hover:text-indigo-600">
                  {r.title}
                </Link>
              </td>
              <td className="px-5 py-3 text-slate-500">{r.subjectCode ?? "—"}</td>
              <td className="px-5 py-3 text-slate-500">{r.dueOffsetWeek ?? "—"}</td>
              <td className="px-5 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-5 py-3 text-slate-700 font-medium">
                {r.score !== null && r.score !== undefined ? `${Math.round(r.score)}/${r.maxScore}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
