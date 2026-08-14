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
  const { title, type, url } = body;
  if (!title || !type || !url) {
    return NextResponse.json({ error: "title, type, and url are required" }, { status: 400 });
  }

  const material = await prisma.material.create({
    data: {
      sessionId: params.id,
      title,
      type,
      url,
      uploadedById: session.userId,
    },
  });

  return NextResponse.json({ ok: true, material });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { faculty, isAdmin } = await getFacultyContext();
  const { searchParams } = new URL(req.url);
  const materialId = searchParams.get("materialId");
  if (!materialId) return NextResponse.json({ error: "materialId required" }, { status: 400 });

  const material = await prisma.material.findUnique({ where: { id: materialId }, include: { session: true } });
  if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin && material.session.facultyId !== faculty.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.material.delete({ where: { id: materialId } });
  return NextResponse.json({ ok: true });
}
