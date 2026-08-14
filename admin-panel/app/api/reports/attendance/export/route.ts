import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getFacultyContext } from "@/lib/context";
import { renderAttendancePdf } from "@/lib/pdf/attendance-report";

export async function GET(req: NextRequest) {
  await getFacultyContext();
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "xlsx";
  const subjectCode = searchParams.get("subject") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const subject = await prisma.subject.findUnique({ where: { code: subjectCode } });
  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  const sessionWhere: any = { subjectId: subject.id };
  if (from || to) {
    sessionWhere.scheduledDate = {};
    if (from) sessionWhere.scheduledDate.gte = new Date(from);
    if (to) sessionWhere.scheduledDate.lte = new Date(to);
  }
  const sessions = await prisma.session.findMany({ where: sessionWhere, select: { id: true } });
  const sessionIds = sessions.map((s) => s.id);

  const attendance = await prisma.attendance.findMany({
    where: { sessionId: { in: sessionIds } },
    include: { student: { include: { user: true } } },
  });

  const byStudent = new Map<string, any>();
  for (const a of attendance) {
    const key = a.studentId;
    if (!byStudent.has(key)) {
      byStudent.set(key, {
        studentId: a.student.studentId,
        name: a.student.user.name,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
      });
    }
    const rec = byStudent.get(key);
    rec.total += 1;
    if (a.status === "PRESENT") rec.present += 1;
    if (a.status === "ABSENT") rec.absent += 1;
    if (a.status === "LATE") rec.late += 1;
    if (a.status === "EXCUSED") rec.excused += 1;
  }
  const rows = Array.from(byStudent.values()).map((r) => ({
    ...r,
    pct: r.total > 0 ? Math.round(((r.present + r.late) / r.total) * 100) : 0,
  }));

  const title = `Attendance Report — ${subject.code} ${subject.name}`;

  if (format === "pdf") {
    const pdfBuffer = await renderAttendancePdf(title, rows);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="attendance-${subject.code}.pdf"`,
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EM&TL E1 Faculty Admin Panel";
  const sheet = workbook.addWorksheet("Attendance");

  sheet.mergeCells("A1:H1");
  sheet.getCell("A1").value = title;
  sheet.getCell("A1").font = { bold: true, size: 14 };

  sheet.getRow(3).values = ["Student ID", "Name", "Present", "Late", "Excused", "Absent", "Sessions", "Attendance %"];
  sheet.getRow(3).font = { bold: true };

  rows.forEach((r, i) => {
    sheet.getRow(4 + i).values = [r.studentId, r.name, r.present, r.late, r.excused, r.absent, r.total, r.pct];
  });

  sheet.columns.forEach((col) => (col.width = 18));

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="attendance-${subject.code}.xlsx"`,
    },
  });
}
