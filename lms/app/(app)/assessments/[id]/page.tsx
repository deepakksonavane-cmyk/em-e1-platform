import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/student";
import { queryOne } from "@/lib/db";
import { Card, CardHeader } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { submitAssessmentAction } from "@/lib/actions";
import type { AssessmentDefinition, Submission } from "@/lib/types";
import { format } from "date-fns";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const student = await requireStudent();
  const { id } = await params;

  const def = await queryOne<AssessmentDefinition>(
    'SELECT * FROM "AssessmentDefinition" WHERE id = $1',
    [id]
  );
  if (!def) notFound();

  const submission = await queryOne<Submission>(
    'SELECT * FROM "Submission" WHERE "assessmentId" = $1 AND "studentId" = $2',
    [id, student.id]
  );

  const status = submission?.status ?? "NOT_SUBMITTED";
  const isGraded = status === "GRADED";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/assessments" className="text-sm text-indigo-600 hover:underline">
          ← Back to Assessments
        </Link>
        <div className="flex items-center justify-between mt-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              {def.type.replace(/_/g, " ")} {def.subjectCode ? `· ${def.subjectCode}` : ""}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{def.title}</h1>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      <Card>
        <CardHeader title="Description" />
        <p className="text-sm text-slate-700">{def.description}</p>
      </Card>

      {def.guidelines && (
        <Card>
          <CardHeader title="Guidelines" />
          <p className="text-sm text-slate-700 whitespace-pre-line">{def.guidelines}</p>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Details"
          subtitle={`Weightage ${def.weightagePercent.toFixed(1)}% of final grade · Max score ${def.maxScore}`}
        />
        <p className="text-sm text-slate-500">
          Due: {def.dueOffsetWeek ? `Week ${def.dueOffsetWeek}` : "No fixed due week"}
        </p>
      </Card>

      {isGraded ? (
        <Card>
          <CardHeader title="Grade & Feedback" />
          <p className="text-3xl font-bold text-emerald-600">
            {submission?.score}/{def.maxScore}
          </p>
          {submission?.feedback && (
            <p className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-md p-3">
              {submission.feedback}
            </p>
          )}
          {submission?.gradedAt && (
            <p className="text-xs text-slate-400 mt-2">
              Graded {format(new Date(submission.gradedAt), "MMM d, yyyy")}
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={submission ? "Update Your Submission" : "Submit Your Work"}
            subtitle={
              submission?.submittedAt
                ? `Last submitted ${format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")}`
                : undefined
            }
          />
          <form action={submitAssessmentAction} className="space-y-4">
            <input type="hidden" name="assessmentId" value={def.id} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Attach file (PDF, DOCX, PPTX...)
              </label>
              <input
                type="file"
                name="file"
                className="w-full text-sm border border-slate-300 rounded-md file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm file:font-medium"
              />
              <p className="text-xs text-slate-400 mt-1">
                Stored locally under /public/uploads for this demo build — see README for the
                production cloud-storage TODO.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Or paste text submission
              </label>
              <textarea
                name="textContent"
                rows={5}
                defaultValue={submission?.textContent ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-5 py-2.5"
            >
              {submission ? "Resubmit" : "Submit"}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
