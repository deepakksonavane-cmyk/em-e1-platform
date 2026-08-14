import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getFacultyContext } from "@/lib/context";
import { computeOverallScore, weightForCategory } from "@/lib/grades";
import { renderGradesPdf } from "@/lib/pdf/grades-report";

const CATEGORIES = ["Weekly Assignments", "Case Studies", "Internship", "Capstone", "Participation", "Final"];

export async function GET(req: NextRequest) {
  await getFacultyContext();
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "xlsx";
  const subjectCode = searchParams.get("subject") || "";
  const batch = searchParams.get("batch") || "";

  const where: any = { status: "ACTIVE" };
  if (batch) where.batch = batch;

  const students = await prisma.student.findMany({
    where,
    include: { user: true, grades: true, submissions: { include: { assessment: true } } },
    orderBy: { studentId: "asc" },
  });

  const report = students.map((st) => {
    const categoryScores = CATEGORIES.map((cat) => {
      const rows = st.grades.filter((g) => g.category === cat);
      const avgPercent =
        rows.length > 0 ? rows.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / rows.length : null;
      return { category: cat, avgPercent, weight: weightForCategory(cat), count: rows.length };
    });
    const overall = computeOverallScore(categoryScores);

    let subjectAvg: number | null = null;
    if (subjectCode) {
      const subSubs = st.submissions.filter((s) => s.assessment.subjectCode === subjectCode && s.score !== null);
      if (subSubs.length > 0) {
        subjectAvg =
          subSubs.reduce((sum, s) => sum + ((s.score as number) / s.assessment.maxScore) * 100, 0) / subSubs.length;
      }
    }

    return {
      studentId: st.studentId,
      name: st.user.name,
      batch: st.batch,
      categoryScores,
      overallPercent: overall.overallPercent,
      letterGrade: overall.letterGrade,
      subjectAvg,
    };
  });

  const title = subjectCode ? `Grades Report — ${subjectCode}` : "Grades Report — Program Wide";

  if (format === "pdf") {
    const pdfBuffer = await renderGradesPdf(title, report);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="grades-report.pdf"`,
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EM&TL E1 Faculty Admin Panel";
  const sheet = workbook.addWorksheet("Grades");

  sheet.mergeCells("A1:L1");
  sheet.getCell("A1").value = title;
  sheet.getCell("A1").font = { bold: true, size: 14 };

  const headers = ["Student ID", "Name", "Batch", ...(subjectCode ? [`${subjectCode} Avg %`] : []), ...CATEGORIES, "Overall %", "Letter Grade"];
  sheet.getRow(3).values = headers;
  sheet.getRow(3).font = { bold: true };

  report.forEach((r, i) => {
    const row = [
      r.studentId,
      r.name,
      r.batch,
      ...(subjectCode ? [r.subjectAvg !== null ? Math.round(r.subjectAvg) : ""] : []),
      ...r.categoryScores.map((c) => (c.avgPercent !== null ? Math.round(c.avgPercent) : "")),
      r.overallPercent ?? "",
      r.letterGrade ?? "",
    ];
    sheet.getRow(4 + i).values = row;
  });

  sheet.columns.forEach((col) => (col.width = 16));

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="grades-report.xlsx"`,
    },
  });
}
