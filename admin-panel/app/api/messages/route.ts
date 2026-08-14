import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFacultyContext } from "@/lib/context";

export async function POST(req: NextRequest) {
  const { session } = await getFacultyContext();
  const body = await req.json();
  const { recipientId, subject, message } = body;

  if (!recipientId || !message) {
    return NextResponse.json({ error: "recipientId and message are required" }, { status: 400 });
  }

  const msg = await prisma.message.create({
    data: {
      senderId: session.userId,
      recipientId,
      subject: subject || null,
      body: message,
    },
  });

  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "GENERAL",
      title: subject || "New message from faculty",
      body: message.slice(0, 140),
    },
  });

  return NextResponse.json({ ok: true, message: msg });
}
