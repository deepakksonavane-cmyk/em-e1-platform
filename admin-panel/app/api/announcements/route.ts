import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFacultyContext } from "@/lib/context";

export async function POST(req: NextRequest) {
  await getFacultyContext();
  const body = await req.json();
  const { title, message, batch } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "title and message are required" }, { status: 400 });
  }

  const where: any = { status: "ACTIVE" };
  if (batch) where.batch = batch;

  const students = await prisma.student.findMany({ where, select: { userId: true } });

  if (students.length === 0) {
    return NextResponse.json({ error: "No matching students to notify" }, { status: 400 });
  }

  await prisma.notification.createMany({
    data: students.map((s) => ({
      userId: s.userId,
      type: "ANNOUNCEMENT" as const,
      title,
      body: message,
    })),
  });

  return NextResponse.json({ ok: true, recipients: students.length });
}
