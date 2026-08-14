import Link from "next/link";
import { requireStudent, PROGRAM } from "@/lib/student";
import { query } from "@/lib/db";
import { Card, CardHeader, StatCard } from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import type { AssessmentDefinition, Session } from "@/lib/types";
import { format } from "date-fns";

export default async function DashboardPage() {
  const student = await requireStudent();

  const [completedSessions, allSessionsAgg, attendanceAgg, upcomingSessions, gradesAgg] =
    await Promise.all([
      query<{ c: number; hrs: number }>(
        `SELECT COUNT(*)::int AS c, COALESCE(SUM(hours),0)::int AS hrs FROM "Session" WHERE status = 'completed'`
      ),
      query<{ c: number; maxweek: number }>(
        `SELECT COUNT(*)::int AS c, COALESCE(MAX(week),0)::int AS maxweek FROM "Session"`
      ),
      query<{ present: number; total: number }>(
        `SELECT
           COUNT(*) FILTER (WHERE a.status IN ('PRESENT','LATE'))::int AS present,
           COUNT(*)::int AS total
         FROM "Attendance" a
         JOIN "Session" s ON s.id = a."sessionId"
         WHERE a."studentId" = $1 AND s.status = 'completed'`,
        [student.id]
      ),
      query<Session>(
        `SELECT * FROM "Session" WHERE status IN ('upcoming','live') ORDER BY "scheduledDate" ASC LIMIT 5`
      ),
      query<{ category: string; avg: number }>(
        `SELECT category, AVG(score / NULLIF("maxScore",0) * 100) AS avg FROM "Grade" WHERE "studentId" = $1 GROUP BY category`,
        [student.id]
      ),
    ]);

  const completedHours = allSessionsAgg[0]?.c
    ? completedSessions[0]?.hrs ?? 0
    : 0;
  const completedCount = completedSessions[0]?.c ?? 0;
  const currentWeek = Math.min(allSessionsAgg[0]?.maxweek || 1, PROGRAM.totalWeeks);
  const attendancePct =
    attendanceAgg[0]?.total > 0
      ? Math.round((attendanceAgg[0].present / attendanceAgg[0].total) * 100)
      : 100;

  // Upcoming deadlines: assessment defs the student hasn't submitted yet.
  const upcomingDeadlines = await query<
    AssessmentDefinition & { submitted: boolean }
  >(
    `SELECT ad.*, (sub.id IS NOT NULL) AS submitted
     FROM "AssessmentDefinition" ad
     LEFT JOIN "Submission" sub ON sub."assessmentId" = ad.id AND sub."studentId" = $1
     WHERE sub.id IS NULL
     ORDER BY ad."dueOffsetWeek" ASC NULLS LAST
     LIMIT 5`,
    [student.id]
  );

  const overallGrade =
    gradesAgg.length > 0
      ? Math.round(gradesAgg.reduce((sum, g) => sum + Number(g.avg), 0) / gradesAgg.length)
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {student.user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {PROGRAM.name} — {student.studentId} · {student.batch}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Program Hours" value={`${completedHours} / ${PROGRAM.totalHours}`} hint="Hours completed" />
        <StatCard label="Current Week" value={`${currentWeek} / ${PROGRAM.totalWeeks}`} hint="Program timeline" accent="text-blue-600" />
        <StatCard label="Sessions Done" value={`${completedCount} / ${PROGRAM.totalSessions}`} hint="Across 6 subjects" accent="text-emerald-600" />
        <StatCard
          label="Attendance"
          value={`${attendancePct}%`}
          hint={`Policy minimum: ${PROGRAM.attendancePolicyPct}%`}
          accent={attendancePct >= PROGRAM.attendancePolicyPct ? "text-emerald-600" : "text-rose-600"}
        />
      </div>

      <Card>
        <CardHeader title="Program Progress" subtitle="420 hours · 24 weeks · 6 subjects · 74 sessions" />
        <div className="space-y-4">
          <ProgressBar label="Hours completed" value={completedHours} max={PROGRAM.totalHours} />
          <ProgressBar label="Weeks elapsed" value={currentWeek} max={PROGRAM.totalWeeks} colorClass="bg-blue-600" />
          <ProgressBar label="Sessions completed" value={completedCount} max={PROGRAM.totalSessions} colorClass="bg-emerald-600" />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Upcoming Sessions"
            subtitle="Next 5 scheduled sessions"
            action={<Link href="/sessions" className="text-sm text-indigo-600 hover:underline">View all</Link>}
          />
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming sessions scheduled.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcomingSessions.map((s) => (
                <li key={s.id} className="py-2.5">
                  <Link href={`/sessions/${s.id}`} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600">
                        {s.code} · {s.topic}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.scheduledDate ? format(new Date(s.scheduledDate), "EEE, MMM d") : "TBD"} · {s.startTime}–{s.endTime}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Upcoming Deadlines"
            subtitle="Assessments not yet submitted"
            action={<Link href="/assessments" className="text-sm text-indigo-600 hover:underline">View all</Link>}
          />
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-slate-400">You&apos;re all caught up — nothing pending.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcomingDeadlines.map((d) => (
                <li key={d.id} className="py-2.5">
                  <Link href={`/assessments/${d.id}`} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600">
                        {d.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {d.type.replace(/_/g, " ")} · Week {d.dueOffsetWeek ?? "—"}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-amber-600">Pending</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Grade Summary" subtitle="Average score by category" />
        {gradesAgg.length === 0 ? (
          <p className="text-sm text-slate-400">No grades posted yet.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {gradesAgg.map((g) => (
              <div key={g.category}>
                <ProgressBar label={g.category} value={Math.round(Number(g.avg))} max={100} colorClass="bg-indigo-600" />
              </div>
            ))}
            {overallGrade !== null && (
              <div className="sm:col-span-3 pt-2 border-t border-slate-100 mt-2">
                <p className="text-sm text-slate-500">
                  Overall average: <span className="font-semibold text-slate-800">{overallGrade}%</span>
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
