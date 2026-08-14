import { notFound } from "next/navigation";
import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import SubmissionsTable from "./SubmissionsTable";

export const dynamic = "force-dynamic";

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  await getFacultyContext();

  const assessment = await prisma.assessmentDefinition.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        include: { student: { include: { user: true } } },
      },
    },
  });

  if (!assessment) notFound();

  const students = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    include: { user: true },
    orderBy: { studentId: "asc" },
  });

  // Ensure every active student has a submission row (even NOT_SUBMITTED) for a complete roster view.
  const bySid = new Map(assessment.submissions.map((s) => [s.studentId, s]));
  const rows = students.map((st) => {
    const sub = bySid.get(st.id);
    return {
      submissionId: sub?.id || null,
      studentId: st.id,
      studentCode: st.studentId,
      studentName: st.user.name,
      status: sub?.status || "NOT_SUBMITTED",
      score: sub?.score ?? null,
      feedback: sub?.feedback ?? "",
      fileUrl: sub?.fileUrl ?? null,
      textContent: sub?.textContent ?? null,
      submittedAt: sub?.submittedAt ?? null,
    };
  });

  const rubric = (assessment.rubric as any) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{assessment.title}</h1>
        <p className="text-slate-500 mt-1">{assessment.description}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="badge bg-slate-100 text-slate-600">{assessment.type.replace("_", " ")}</span>
          <span className="badge bg-brand-100 text-brand-700">{assessment.weightagePercent}% weightage</span>
          <span className="badge bg-slate-100 text-slate-600">Max score: {assessment.maxScore}</span>
          {assessment.subjectCode && (
            <span className="badge bg-slate-100 text-slate-600">{assessment.subjectCode}</span>
          )}
        </div>
      </div>

      {rubric && (
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-3">Grading Rubric</h2>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Criterion</th>
                  <th>Points</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {(rubric.criteria || []).map((c: any, i: number) => (
                  <tr key={i}>
                    <td className="font-medium">{c.name}</td>
                    <td>{c.points}</td>
                    <td className="whitespace-normal">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {assessment.guidelines && (
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-2">Guidelines</h2>
          <p className="text-sm text-slate-600 whitespace-pre-line">{assessment.guidelines}</p>
        </div>
      )}

      <SubmissionsTable assessmentId={assessment.id} maxScore={assessment.maxScore} rows={rows} />
    </div>
  );
}
