import { requireStudent } from "@/lib/student";
import { query, queryOne } from "@/lib/db";
import { Card, CardHeader } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ProgressBar";
import {
  addInternshipLogAction,
  deleteInternshipLogAction,
  updateInternshipDetailsAction,
  submitInternshipReportAction,
} from "@/lib/actions";
import type { InternshipLog, InternshipRecord } from "@/lib/types";
import { format } from "date-fns";

export default async function InternshipPage() {
  const student = await requireStudent();

  const record = await queryOne<InternshipRecord>(
    'SELECT * FROM "InternshipRecord" WHERE "studentId" = $1',
    [student.id]
  );

  const logs = record
    ? await query<InternshipLog>(
        'SELECT * FROM "InternshipLog" WHERE "internshipId" = $1 ORDER BY date DESC',
        [record.id]
      )
    : [];

  const requiredHours = record?.requiredHours ?? 30;
  const loggedHours = record?.loggedHours ?? 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Internship</h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-world event experience component — 20% of your final grade.
        </p>
      </div>

      <Card>
        <CardHeader title="Guidelines" />
        <div className="text-sm text-slate-700 space-y-2">
          <p>
            Every student must complete a minimum of <strong>{requiredHours} hours</strong> of
            real-world event work — either a formal placement with a partner organization or a
            self-sourced practical engagement (assisting on a real event, volunteering with an
            event company, etc.) — during weeks 21–23 of the program.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Log every session in the Internship Logbook below as you complete it.</li>
            <li>Once you reach {requiredHours} hours, submit your Internship Report (PDF, 3–5 pages).</li>
            <li>Your supervisor will complete an evaluation, visible here once received.</li>
          </ul>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Progress"
          subtitle={`${loggedHours} / ${requiredHours} hours logged`}
          action={<StatusBadge status={record?.status ?? "not_started"} />}
        />
        <ProgressBar value={loggedHours} max={requiredHours} colorClass="bg-emerald-600" />
      </Card>

      <Card>
        <CardHeader title="Placement Details" subtitle="Organization & supervisor info" />
        <form action={updateInternshipDetailsAction} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
            <input
              name="organization"
              defaultValue={record?.organization ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor name</label>
            <input
              name="supervisorName"
              defaultValue={record?.supervisorName ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor email</label>
            <input
              name="supervisorEmail"
              defaultValue={record?.supervisorEmail ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor phone</label>
            <input
              name="supervisorPhone"
              defaultValue={record?.supervisorPhone ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2">
              Save details
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Internship Logbook" subtitle="Log each work session" />
        <form action={addInternshipLogAction} className="grid sm:grid-cols-4 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input type="date" name="date" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Hours</label>
            <input
              type="number"
              name="hours"
              step="0.5"
              min="0.5"
              max="24"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Activity description</label>
            <input
              type="text"
              name="activity"
              required
              placeholder="e.g. Assisted with vendor setup for a 200-guest gala"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2">
              Add log entry
            </button>
          </div>
        </form>

        {logs.length === 0 ? (
          <p className="text-sm text-slate-400">No hours logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Hours</th>
                <th className="text-left py-2">Activity</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2 text-slate-600">{format(new Date(log.date), "MMM d, yyyy")}</td>
                  <td className="py-2 text-slate-600">{log.hoursLogged}</td>
                  <td className="py-2 text-slate-600">{log.activityDescription}</td>
                  <td className="py-2 text-right">
                    <form action={deleteInternshipLogAction}>
                      <input type="hidden" name="logId" value={log.id} />
                      <button className="text-xs text-rose-500 hover:underline">Remove</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <CardHeader title="Internship Report" subtitle="Submit once you've reached the required hours" />
        {record?.reportUrl ? (
          <p className="text-sm text-slate-700">
            Report submitted:{" "}
            <a href={record.reportUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
              View file
            </a>
          </p>
        ) : (
          <form action={submitInternshipReportAction} className="space-y-3">
            <input
              type="file"
              name="file"
              required
              className="w-full text-sm border border-slate-300 rounded-md file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm file:font-medium"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2">
              Submit report
            </button>
          </form>
        )}
      </Card>

      <Card>
        <CardHeader title="Supervisor Evaluation" />
        {record?.supervisorEvaluationUrl ? (
          <a
            href={record.supervisorEvaluationUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 text-sm hover:underline"
          >
            View evaluation
          </a>
        ) : (
          <p className="text-sm text-slate-400">
            Not received yet. Your supervisor will submit this directly once your placement is complete.
          </p>
        )}
      </Card>
    </div>
  );
}
