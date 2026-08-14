import { notFound } from "next/navigation";
import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import SessionEditForm from "./SessionEditForm";
import AttendanceGrid from "./AttendanceGrid";
import MaterialsPanel from "./MaterialsPanel";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const { isAdmin, faculty } = await getFacultyContext();

  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      subject: true,
      faculty: { include: { user: true } },
      materials: { orderBy: { createdAt: "desc" } },
      attendance: true,
    },
  });

  if (!session) notFound();
  const canEdit = isAdmin || session.facultyId === faculty.id;

  const students = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    include: { user: true },
    orderBy: { studentId: "asc" },
  });

  const attendanceMap = new Map(session.attendance.map((a) => [a.studentId, a]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-brand-600 font-medium">{session.subject.name}</p>
        <h1 className="text-2xl font-bold text-slate-900">
          {session.code} · {session.topic}
        </h1>
        <p className="text-slate-500 mt-1">
          Week {session.week} · {session.day} · Module: {session.moduleName} · {session.hours}h ·
          Faculty: {session.faculty?.user.name || "Unassigned"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-1">Session Content</h2>
          <p className="text-sm text-slate-500 mb-4">
            {session.teachingMethod} · Assessment: {session.assessmentNote || "—"} · Resources:{" "}
            {session.resources || "—"}
          </p>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Key Topics</p>
            <div className="flex flex-wrap gap-2">
              {session.keyTopics.map((t, i) => (
                <span key={i} className="badge bg-slate-100 text-slate-600">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Status</p>
          <p className="text-lg font-semibold capitalize">{session.status}</p>
        </div>
      </div>

      <SessionEditForm session={session} canEdit={canEdit} />

      <MaterialsPanel sessionId={session.id} materials={session.materials} canEdit={canEdit} />

      <div id="attendance">
        <AttendanceGrid
          sessionId={session.id}
          canEdit={canEdit}
          students={students.map((s) => ({
            id: s.id,
            studentId: s.studentId,
            name: s.user.name,
            email: s.user.email,
            currentStatus: attendanceMap.get(s.id)?.status || null,
          }))}
        />
      </div>
    </div>
  );
}
