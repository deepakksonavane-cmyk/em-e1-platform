import Link from "next/link";
import { getFacultyContext } from "@/lib/context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  ASSIGNMENT: "Weekly Assignment",
  CASE_STUDY: "Case Study",
  CAPSTONE: "Capstone",
  INTERNSHIP_REPORT: "Internship Report",
};

export default async function AssessmentsPage() {
  const { faculty, isAdmin } = await getFacultyContext();

  const mySubjects = await prisma.subject.findMany({
    where: isAdmin ? {} : { lecturerId: faculty.id },
  });
  const myCodes = mySubjects.map((s) => s.code);

  const assessments = await prisma.assessmentDefinition.findMany({
    where: isAdmin ? {} : { OR: [{ subjectCode: { in: myCodes } }, { subjectCode: null }] },
    include: {
      submissions: true,
    },
    orderBy: [{ type: "asc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assessment Management</h1>
        <p className="text-slate-500 mt-1">
          6 weekly assignments · 8 case studies · capstone project · internship report
        </p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table-base">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Weightage</th>
              <th>Submissions</th>
              <th>Ungraded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => {
              const submitted = a.submissions.filter((s) => s.status !== "NOT_SUBMITTED");
              const ungraded = a.submissions.filter((s) => s.status === "SUBMITTED" || s.status === "LATE");
              return (
                <tr key={a.id}>
                  <td className="font-medium max-w-sm truncate" title={a.title}>
                    {a.title}
                  </td>
                  <td>{TYPE_LABEL[a.type] || a.type}</td>
                  <td>{a.subjectCode || "Program-wide"}</td>
                  <td>{a.weightagePercent}%</td>
                  <td>{submitted.length}</td>
                  <td>
                    {ungraded.length > 0 ? (
                      <span className="badge bg-amber-100 text-amber-700">{ungraded.length} pending</span>
                    ) : (
                      <span className="badge bg-emerald-100 text-emerald-700">All graded</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/assessments/${a.id}`} className="text-brand-600 hover:underline text-sm font-medium">
                      Review &amp; Grade
                    </Link>
                  </td>
                </tr>
              );
            })}
            {assessments.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No assessments found for your subjects.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
