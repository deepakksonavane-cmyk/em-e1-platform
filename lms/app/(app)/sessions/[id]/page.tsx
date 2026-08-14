import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/student";
import { queryOne, query } from "@/lib/db";
import { Card, CardHeader } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { getLiveState, formatCountdown } from "@/lib/sessionWindow";
import type { Material, Session } from "@/lib/types";
import { format } from "date-fns";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStudent();
  const { id } = await params;

  const session = await queryOne<
    Session & { subjectCode: string; subjectName: string; lecturerName: string | null }
  >(
    `SELECT s.*, sub.code AS "subjectCode", sub.name AS "subjectName", u.name AS "lecturerName"
     FROM "Session" s
     JOIN "Subject" sub ON sub.id = s."subjectId"
     LEFT JOIN "Faculty" f ON f.id = s."facultyId"
     LEFT JOIN "User" u ON u.id = f."userId"
     WHERE s.id = $1`,
    [id]
  );
  if (!session) notFound();

  const materials = await query<Material>(
    'SELECT * FROM "Material" WHERE "sessionId" = $1 ORDER BY type ASC',
    [id]
  );

  const { state, window } = getLiveState(session);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/sessions" className="text-sm text-indigo-600 hover:underline">
          ← Back to Sessions
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              {session.subjectCode} · {session.code}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{session.topic}</h1>
          </div>
          <StatusBadge status={session.status} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Session Details" />
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-400">Subject</dt>
                <dd className="text-slate-800 font-medium">{session.subjectName}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Module</dt>
                <dd className="text-slate-800 font-medium">
                  {session.module} — {session.moduleName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Faculty</dt>
                <dd className="text-slate-800 font-medium">{session.lecturerName ?? "TBD"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Date &amp; Time</dt>
                <dd className="text-slate-800 font-medium">
                  {session.scheduledDate ? format(new Date(session.scheduledDate), "EEEE, MMM d, yyyy") : "TBD"}
                  {" "}
                  {session.startTime}–{session.endTime}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Hours</dt>
                <dd className="text-slate-800 font-medium">{session.hours}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Teaching Method</dt>
                <dd className="text-slate-800 font-medium">{session.teachingMethod}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Key Topics" />
            <ul className="flex flex-wrap gap-2">
              {session.keyTopics.map((t) => (
                <li
                  key={t}
                  className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Assessment & Resources" />
            <div className="text-sm space-y-2">
              <p>
                <span className="text-slate-400">Assessment: </span>
                <span className="text-slate-700">{session.assessmentNote ?? "—"}</span>
              </p>
              <p>
                <span className="text-slate-400">Resources: </span>
                <span className="text-slate-700">{session.resources ?? "—"}</span>
              </p>
            </div>
          </Card>

          {materials.length > 0 && (
            <Card>
              <CardHeader title="Materials" subtitle="Downloadable notes & slides" />
              <ul className="divide-y divide-slate-100">
                {materials.map((m) => (
                  <li key={m.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.title}</p>
                      <p className="text-xs text-slate-400 capitalize">{m.type}</p>
                    </div>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-600 font-medium hover:underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Join Session" />
            {state === "live" && session.meetingLink ? (
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md py-2.5 text-sm"
              >
                🔴 Join Live Session
              </a>
            ) : (
              <button
                disabled
                className="w-full bg-slate-100 text-slate-400 font-medium rounded-md py-2.5 text-sm cursor-not-allowed"
              >
                {state === "past"
                  ? "Session has ended"
                  : window
                  ? `Opens ${formatCountdown(window.start)}`
                  : "Not scheduled yet"}
              </button>
            )}
            <p className="text-xs text-slate-400 mt-2">
              The join button activates automatically during the scheduled session window
              ({session.startTime}–{session.endTime}).
            </p>
          </Card>

          <Card>
            <CardHeader title="Recording Archive" />
            {session.recordingUrl ? (
              <a
                href={session.recordingUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium rounded-md py-2.5 text-sm"
              >
                ▶ Watch Recording
              </a>
            ) : (
              <p className="text-sm text-slate-400">
                No recording available yet {session.status === "completed" ? "" : "— session hasn't happened yet"}.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
