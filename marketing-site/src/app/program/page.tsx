import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import SubjectAccordion from "@/components/program/SubjectAccordion";
import { program, subjects, weekends, assessments } from "@/lib/program";
import { PROGRAM_FEE_INR, APPLICATION_FEE_INR } from "@/lib/payment";

export const metadata: Metadata = {
  title: "Program & Curriculum",
  description:
    "Full curriculum breakdown for the Event Management & Team Leadership E1 diploma: all 6 subjects, 74 sessions, 3 in-person weekends, assessment structure, and program policies.",
};

export default function ProgramPage() {
  return (
    <>
      <section className="bg-navy-gradient py-16 text-white md:py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            The Full Curriculum
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            {program.programName}
          </h1>
          <p className="mt-5 max-w-2xl text-white/80">
            {program.mode} · {program.durationWeeks} weeks · {program.totalHours}{" "}
            hours · {program.totalSubjects} subjects · {program.totalSessions}{" "}
            live sessions · {program.totalLecturers} specialist lecturers
          </p>
        </Container>
      </section>

      {/* Fees */}
      <section className="section bg-navy-50">
        <Container>
          <SectionHeading
            eyebrow="Program Fees"
            title="Simple, transparent pricing"
            description="One-time application fee plus the full program fee, payable to enroll in the Event Management & Team Leadership E1 diploma."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-navy-100 p-7 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">
                Application Fee
              </p>
              <p className="mt-3 font-display text-3xl font-bold text-navy-900">
                ₹{APPLICATION_FEE_INR.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-sm text-navy-500">Non-refundable, paid at time of application.</p>
            </div>
            <div className="rounded-xl border border-navy-100 p-7 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">
                Program Fee
              </p>
              <p className="mt-3 font-display text-3xl font-bold text-navy-900">
                ₹{PROGRAM_FEE_INR.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-sm text-navy-500">Covers all 6 subjects, 74 sessions, and 3 in-person weekends.</p>
            </div>
            <div className="rounded-xl bg-navy-900 p-7 text-center text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-300">
                Total
              </p>
              <p className="mt-3 font-display text-3xl font-bold">
                ₹{(PROGRAM_FEE_INR + APPLICATION_FEE_INR).toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-sm text-white/70">Payable in full to confirm your seat.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Subjects accordion */}
      <section className="section bg-white">
        <Container>
          <SectionHeading
            eyebrow="Curriculum Breakdown"
            title="All 6 subjects, all 74 sessions"
            description="Expand each subject to see every session topic, teaching method, and assessment. The order below mirrors the actual 24-week teaching schedule."
          />
          <div className="mt-10">
            <SubjectAccordion subjects={subjects} />
          </div>
        </Container>
      </section>

      {/* Weekends */}
      <section className="section bg-navy-50">
        <Container>
          <SectionHeading
            eyebrow="In-Person Component"
            title="3 in-person weekends"
            description="Attendance at all three in-person weekends is mandatory for certification, alongside 80% minimum attendance for online sessions."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {weekends.map((weekend) => (
              <div key={weekend.code} className="rounded-xl bg-white p-7 shadow-card">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {weekend.code} · Week {weekend.week}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-navy-900">
                  {weekend.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-navy-500">{weekend.focus}</p>

                <dl className="mt-4 flex gap-4 text-xs text-navy-500">
                  {weekend.days.map((d) => (
                    <div key={d.day}>
                      <dt className="font-semibold text-navy-700">{d.day}</dt>
                      <dd>{d.hours}h</dd>
                    </div>
                  ))}
                  <div>
                    <dt className="font-semibold text-navy-700">Total</dt>
                    <dd>{weekend.totalHours}h</dd>
                  </div>
                </dl>

                <ul className="mt-5 space-y-2 text-sm text-navy-600">
                  {weekend.activities.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-400" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Assessment structure */}
      <section className="section bg-white">
        <Container>
          <SectionHeading
            eyebrow="How You're Evaluated"
            title="Assessment & grading structure"
            description="Grades combine practical assignments, case studies, a real internship, and a final capstone pitch — not just written tests."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {[
                {
                  label: "Weekly Assignments",
                  weight: assessments.weeklyAssignments.weightage,
                  detail: `${assessments.weeklyAssignments.count} assignments · ${assessments.weeklyAssignments.hoursEach}h each · ${assessments.weeklyAssignments.description}`,
                },
                {
                  label: "Case Studies",
                  weight: assessments.caseStudies.weightage,
                  detail: `${assessments.caseStudies.count} case studies · ${assessments.caseStudies.hoursEach}h each · ${assessments.caseStudies.description}`,
                },
                {
                  label: "Internship Report",
                  weight: assessments.internshipReport.weightage,
                  detail: `Minimum ${assessments.internshipReport.minHours} hours · ${assessments.internshipReport.description}`,
                },
                {
                  label: "Capstone Project",
                  weight: assessments.capstoneProject.weightage,
                  detail: assessments.capstoneProject.description,
                },
                {
                  label: "Class Participation",
                  weight: assessments.classParticipation.weightage,
                  detail: assessments.classParticipation.description,
                },
                {
                  label: "Final Evaluation",
                  weight: assessments.finalEvaluation.weightage,
                  detail: assessments.finalEvaluation.description,
                },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-navy-100 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-navy-900">
                      {row.label}
                    </h3>
                    <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-gold-700">
                      {row.weight}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-navy-600">{row.detail}</p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-gold-400"
                      style={{ width: `${row.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="rounded-xl bg-navy-900 p-7 text-white">
                <h3 className="font-display text-lg font-semibold">Grading Scale</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {program.gradingScale.map((g) => (
                    <li key={g.grade} className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-semibold text-gold-300">Grade {g.grade}</span>
                      <span className="text-white/75">{g.range}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-xl border border-navy-100 p-7">
                <h3 className="font-display text-lg font-semibold text-navy-900">Program Policies</h3>
                <ul className="mt-4 space-y-3 text-sm text-navy-600">
                  <li>• {program.attendancePolicy}.</li>
                  <li>• 100% attendance required at all 3 in-person weekends for certification.</li>
                  <li>• Minimum {assessments.internshipReport.minHours} hours of real-world internship or volunteering experience.</li>
                  <li>• All assessments must be completed for successful certification.</li>
                  <li>• Certificates are issued only after full fee clearance and completion of all requirements.</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Key dates */}
      <section className="section bg-navy-50">
        <Container>
          <SectionHeading eyebrow="Program Timeline" title="Key dates" />
          <ol className="mt-10 space-y-0">
            {program.keyDates.map((date, i) => (
              <li key={date.event} className="relative flex gap-6 pb-8 pl-2 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-gold-300">
                    {i + 1}
                  </span>
                  {i < program.keyDates.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-navy-200" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                    Week {date.week}
                  </p>
                  <p className="mt-1 font-medium text-navy-900">{date.event}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="section bg-white">
        <Container className="rounded-2xl bg-navy-900 px-8 py-14 text-center text-white sm:px-16">
          <h2 className="font-display text-3xl font-bold">
            Ready to see if E1 is right for you?
          </h2>
          <div className="mt-8">
            <Link href="/apply" className="rounded-md bg-gold-400 px-8 py-3.5 text-sm font-semibold text-navy-900 hover:bg-gold-300">
              Apply Now
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
