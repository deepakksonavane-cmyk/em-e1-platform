import Link from "next/link";
import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { session, faculty, isAdmin } = await getFacultyContext();

  const sessionWhere = isAdmin ? {} : { facultyId: faculty.id };

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [
    allAssignedSessions,
    totalStudents,
    subjects,
    assessmentDefs,
    recentAnnouncements,
  ] = await Promise.all([
    prisma.session.findMany({
      where: sessionWhere,
      include: { subject: true },
      orderBy: { sessionNumber: "asc" },
    }),
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.subject.findMany({ where: isAdmin ? {} : { lecturerId: faculty.id } }),
    prisma.assessmentDefinition.findMany({
      where: isAdmin
        ? {}
        : { subjectCode: { in: (await prisma.subject.findMany({ where: { lecturerId: faculty.id }, select: { code: true } })).map((s) => s.code) } },
    }),
    prisma.notification.findMany({
      where: { type: "ANNOUNCEMENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      distinct: ["title"],
    }),
  ]);

  const todaySessions = allAssignedSessions.filter((s) => {
    if (!s.scheduledDate) return false;
    return s.scheduledDate >= startOfDay(now) && s.scheduledDate <= endOfDay(now);
  });

  const thisWeekSessions = allAssignedSessions.filter((s) => {
    if (!s.scheduledDate) return false;
    return s.scheduledDate >= weekStart && s.scheduledDate <= weekEnd;
  });

  const upcomingSessions = allAssignedSessions
    .filter((s) => s.status === "upcoming" || s.status === "live")
    .slice(0, 6);

  const assessmentIds = assessmentDefs.map((a) => a.id);
  const pendingSubmissions = await prisma.submission.count({
    where: {
      assessmentId: { in: assessmentIds },
      status: { in: ["SUBMITTED", "LATE"] },
    },
  });

  const completedSessions = allAssignedSessions.filter((s) => s.status === "completed").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session.name.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          {isAdmin
            ? "Program-wide overview across all 6 subjects."
            : `Your subjects: ${subjects.map((s) => s.name).join(", ") || "—"}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sessions Assigned" value={allAssignedSessions.length} sub={`${completedSessions} completed`} color="brand" />
        <StatCard label="Sessions This Week" value={thisWeekSessions.length} sub={`${todaySessions.length} today`} color="emerald" />
        <StatCard label="Pending to Grade" value={pendingSubmissions} sub="submissions awaiting review" color="amber" href="/assessments" />
        <StatCard label="Active Students" value={totalStudents} sub={isAdmin ? "program-wide" : "in your subjects"} color="violet" href="/students" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Upcoming / Live Sessions</h2>
            <Link href="/sessions" className="text-sm text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming sessions assigned.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingSessions.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {s.code} · {s.topic}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.subject.name} · Week {s.week} · {s.day}
                      {s.scheduledDate ? ` · ${format(s.scheduledDate, "dd MMM yyyy")}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={s.status} />
                    <Link href={`/sessions/${s.id}#attendance`} className="btn-outline !py-1.5 !px-3 text-xs">
                      Take Attendance
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Announcements</h2>
          {recentAnnouncements.length === 0 ? (
            <p className="text-sm text-slate-500">No announcements sent yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentAnnouncements.map((n) => (
                <li key={n.id} className="text-sm">
                  <p className="font-medium text-slate-800">{n.title}</p>
                  <p className="text-slate-500 text-xs line-clamp-2">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/announcements" className="btn-secondary w-full mt-4 justify-center">
            New Announcement
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  href,
}: {
  label: string;
  value: number;
  sub: string;
  color: "brand" | "emerald" | "amber" | "violet";
  href?: string;
}) {
  const colorMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };
  const content = (
    <div className="card hover:shadow-md transition-shadow">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${colorMap[color]}`}>{sub}</span>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    upcoming: "bg-slate-100 text-slate-600",
    live: "bg-emerald-100 text-emerald-700",
    completed: "bg-brand-100 text-brand-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return <span className={`badge ${map[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}
