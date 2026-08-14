import { requireStudent } from "@/lib/student";
import { queryOne } from "@/lib/db";
import { Card, CardHeader } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { submitAssessmentAction } from "@/lib/actions";
import type { AssessmentDefinition, Submission } from "@/lib/types";
import { format } from "date-fns";

export default async function CapstonePage() {
  const student = await requireStudent();

  const def = await queryOne<AssessmentDefinition>(
    `SELECT * FROM "AssessmentDefinition" WHERE type = 'CAPSTONE' LIMIT 1`
  );

  if (!def) {
    return <p className="text-slate-500">Capstone project details are not configured yet.</p>;
  }

  const submission = await queryOne<Submission>(
    'SELECT * FROM "Submission" WHERE "assessmentId" = $1 AND "studentId" = $2',
    [def.id, student.id]
  );
  const status = submission?.status ?? "NOT_SUBMITTED";
  const isGraded = status === "GRADED";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            Capstone Project · 25% of final grade
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{def.title}</h1>
        </div>
        <StatusBadge status={status} />
      </div>

      <Card>
        <CardHeader title="Overview" />
        <p className="text-sm text-slate-700">{def.description}</p>
      </Card>

      {def.guidelines && (
        <Card>
          <CardHeader title="Deliverables & Rubric" />
          <p className="text-sm text-slate-700 whitespace-pre-line">{def.guidelines}</p>
        </Card>
      )}

      {isGraded ? (
        <Card>
          <CardHeader title="Grade & Feedback" />
          <p className="text-3xl font-bold text-emerald-600">
            {submission?.score}/{def.maxScore}
          </p>
          {submission?.feedback && (
            <p className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-md p-3">{submission.feedback}</p>
          )}
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={submission ? "Update Your Capstone Submission" : "Submit Your Capstone Project"}
            subtitle={
              submission?.submittedAt
                ? `Last submitted ${format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")}`
                : "Submit your full proposal document and pitch deck as one file (or link them in the text box)."
            }
          />
          <form action={submitAssessmentAction} className="space-y-4">
            <input type="hidden" name="assessmentId" value={def.id} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Attach proposal / pitch deck file
              </label>
              <input
                type="file"
                name="file"
                className="w-full text-sm border border-slate-300 rounded-md file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm file:font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes / links (e.g. recorded pitch video link)
              </label>
              <textarea
                name="textContent"
                rows={4}
                defaultValue={submission?.textContent ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-5 py-2.5"
            >
              {submission ? "Resubmit" : "Submit Capstone"}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
