import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFacultyContext } from "@/lib/context";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  await getFacultyContext();
  const body = await req.json();
  const { title, message, batch } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "title and message are required" }, { status: 400 });
  }

  const where: any = { status: "ACTIVE" };
  if (batch) where.batch = batch;

  const students: { userId: string; user: { email: string; name: string } }[] =
    await prisma.student.findMany({
      where,
      select: { userId: true, user: { select: { email: true, name: true } } },
    });

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

  // Best-effort email fan-out — failures here shouldn't fail the request,
  // since the in-app notification (above) already succeeded.
  const emailResults = await Promise.all(
    students.map((s) =>
      sendEmail({
        to: s.user.email,
        subject: title,
        html: `<p>${message}</p>`,
      })
        .then((r) => ({ to: s.user.email, ...r }))
        .catch((err) => ({
          to: s.user.email,
          ok: false,
          error: err instanceof Error ? err.message : "unknown thrown error",
        }))
    )
  );

  // TEMPORARY DEBUG — surfaces exactly what happened with each email send
  // directly in the API response, so it's visible in the browser's Network
  // tab without needing to dig through Vercel's log viewer. Safe to remove
  // once email delivery is confirmed working end-to-end.
  return NextResponse.json({
    ok: true,
    recipients: students.length,
    debug: {
      apiKeyPresent: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      emailFrom: process.env.EMAIL_FROM || "(unset, using default onboarding@resend.dev)",
      emailResults,
    },
  });
}
