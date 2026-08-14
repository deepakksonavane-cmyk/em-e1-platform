import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFacultyContext } from "@/lib/context";
import { categoryForAssessmentType } from "@/lib/grades";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { faculty, session } = await getFacultyContext();

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { assessment: true, student: { include: { user: true } } },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const body = await req.json();
  const score = Number(body.score);
  const feedback: string = body.feedback || "";

  if (Number.isNaN(score) || score < 0 || score > submission.assessment.maxScore) {
    return NextResponse.json(
      { error: `Score must be between 0 and ${submission.assessment.maxScore}` },
      { status: 400 }
    );
  }

  const updatedSubmission = await prisma.submission.update({
    where: { id: params.id },
    data: {
      score,
      feedback,
      status: "GRADED",
      gradedById: faculty.id,
      gradedAt: new Date(),
    },
  });

  const category = categoryForAssessmentType(submission.assessment.type);

  await prisma.grade.upsert({
    where: { submissionId: params.id },
    create: {
      studentId: submission.studentId,
      submissionId: params.id,
      category,
      score,
      maxScore: submission.assessment.maxScore,
      letterGrade: letterFor((score / submission.assessment.maxScore) * 100),
      comments: feedback,
    },
    update: {
      score,
      maxScore: submission.assessment.maxScore,
      letterGrade: letterFor((score / submission.assessment.maxScore) * 100),
      comments: feedback,
    },
  });

  // Notify the student that a grade was posted.
  await prisma.notification
    .create({
      data: {
        userId: submission.student.user.id,
        type: "GRADE_POSTED",
        title: `Grade posted: ${submission.assessment.title}`,
        body: `You received ${score}/${submission.assessment.maxScore} on "${submission.assessment.title}".`,
      },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true, submission: updatedSubmission });
}

function letterFor(percent: number): string {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}
