import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFacultyContext } from "@/lib/context";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, faculty, isAdmin } = await getFacultyContext();

  const existing = await prisma.session.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (!isAdmin && existing.facultyId !== faculty.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const records: { studentId: string; status: string; notes?: string }[] = body.records || [];

  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "No attendance records provided" }, { status: 400 });
  }

  const results = await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: { studentId_sessionId: { studentId: r.studentId, sessionId: params.id } },
        create: {
          studentId: r.studentId,
          sessionId: params.id,
          status: r.status as any,
          notes: r.notes,
          markedById: session.userId,
        },
        update: {
          status: r.status as any,
          notes: r.notes,
          markedAt: new Date(),
          markedById: session.userId,
        },
      })
    )
  );

  return NextResponse.json({ ok: true, count: results.length });
}
