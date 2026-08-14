import { requireStudent } from "@/lib/student";
import { query, queryOne } from "@/lib/db";
import { Card, CardHeader } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ProgressBar";
import { updateProfileAction, changePasswordAction } from "@/lib/actions";
import type { Certificate } from "@/lib/types";
import { format } from "date-fns";

interface AttendanceRow {
  sessionCode: string;
  topic: string;
  scheduledDate: string | null;
  status: string;
}

export default async function ProfilePage() {
  const student = await requireStudent();

  const [attendanceHistory, certificate, progressAgg] = await Promise.all([
    query<AttendanceRow>(
      `SELECT s.code AS "sessionCode", s.topic, s."scheduledDate", a.status
       FROM "Attendance" a
       JOIN "Session" s ON s.id = a."sessionId"
       WHERE a."studentId" = $1
       ORDER BY s."scheduledDate" DESC`,
      [student.id]
    ),
    queryOne<Certificate>('SELECT * FROM "Certificate" WHERE "studentId" = $1', [student.id]),
    query<{ completed: number; total: number }>(
      `SELECT
         (SELECT COUNT(*)::int FROM "Session" WHERE status = 'completed') AS completed,
         (SELECT COUNT(*)::int FROM "Session") AS total`
    ),
  ]);

  const completed = progressAgg[0]?.completed ?? 0;
  const total = progressAgg[0]?.total ?? 74;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">{student.studentId} · {student.batch}</p>
      </div>

      <Card>
        <CardHeader title="Basic Information" />
        <form action={updateProfileAction} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
            <input
              name="name"
              defaultValue={student.user.name}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              value={student.user.email}
              disabled
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              name="phone"
              defaultValue={student.user.phone ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
            <input
              name="city"
              defaultValue={student.city ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
            <input
              name="state"
              defaultValue={student.state ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-1">
            <p className="text-sm font-semibold text-slate-700 mb-2">Emergency contact</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              name="emergencyContactName"
              defaultValue={student.emergencyContactName ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              name="emergencyContactPhone"
              defaultValue={student.emergencyContactPhone ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Relation</label>
            <input
              name="emergencyContactRelation"
              defaultValue={student.emergencyContactRelation ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2">
              Save changes
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Change Password" />
        <form action={changePasswordAction} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current password</label>
            <input
              type="password"
              name="currentPassword"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-md px-4 py-2">
              Update password
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Certificate" />
        {certificate?.issued ? (
          <div>
            <p className="text-sm text-emerald-700 font-medium mb-2">
              🎓 Certificate issued {certificate.issueDate ? `on ${format(new Date(certificate.issueDate), "MMM d, yyyy")}` : ""}
            </p>
            {certificate.fileUrl ? (
              <a
                href={certificate.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-4 py-2"
              >
                Download Certificate ({certificate.certificateNo})
              </a>
            ) : (
              <p className="text-sm text-slate-400">File not yet uploaded by administration.</p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-3">
              Your certificate will be issued once you complete the full program (all sessions,
              assessments, weekends, internship, and capstone).
            </p>
            <ProgressBar label="Program completion" value={completed} max={total} colorClass="bg-amber-500" />
            <button
              disabled
              className="mt-4 bg-slate-100 text-slate-400 text-sm font-medium rounded-md px-4 py-2 cursor-not-allowed"
            >
              Certificate not yet available ({progressPct}% complete)
            </button>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Attendance History" />
        {attendanceHistory.length === 0 ? (
          <p className="text-sm text-slate-400">No attendance records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="text-left py-2">Session</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceHistory.map((a, i) => (
                <tr key={i}>
                  <td className="py-2 text-slate-700">
                    {a.sessionCode} · {a.topic}
                  </td>
                  <td className="py-2 text-slate-500">
                    {a.scheduledDate ? format(new Date(a.scheduledDate), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="py-2">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
