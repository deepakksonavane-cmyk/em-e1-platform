import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFacultyContext } from "@/lib/context";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { faculty, isAdmin } = await getFacultyContext();

  const existing = await prisma.session.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (!isAdmin && existing.facultyId !== faculty.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: any = {};
  const allowed = [
    "meetingLink",
    "status",
    "notesUrl",
    "slidesUrl",
    "recordingUrl",
    "scheduledDate",
    "startTime",
    "endTime",
  ];
  for (const key of allowed) {
    if (key in body) {
      data[key] = key === "scheduledDate" && body[key] ? new Date(body[key]) : body[key];
    }
  }

  const updated = await prisma.session.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, session: updated });
}
