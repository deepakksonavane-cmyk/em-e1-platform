import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { lecturerProfiles, subjects } from "@/lib/program";

export const metadata: Metadata = {
  title: "Faculty",
  description:
    "Meet the six lecturers who teach the Event Management & Team Leadership E1 diploma, each specializing in one of the program's core subject areas.",
};

// NOTE: See src/lib/program.ts — lecturerProfiles are PLACEHOLDER bios
// generated from each lecturer's subject assignment. Real faculty names,
// photos, and credentials from the client must replace this content
// before launch.
export default function FacultyPage() {
  return (
    <>
      <section className="bg-navy-gradient py-16 text-white md:py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            Meet the Team
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Faculty</h1>
          <p className="mt-5 max-w-2xl text-white/80">
            Six specialist lecturers, each owning one core discipline of the
            curriculum — from foundational leadership theory to the business
            of running an event company.
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container>
          <SectionHeading
            eyebrow="Program Faculty"
            title="One expert per discipline"
            description="Faculty photos and full biographies are pending final confirmation from the institute — the profiles below reflect each lecturer's confirmed subject assignment and teaching focus."
          />

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {lecturerProfiles.map((lecturer) => {
              const subject = subjects.find((s) => s.code === lecturer.subjectCode);
              return (
                <div key={lecturer.id} className="overflow-hidden rounded-xl border border-navy-100 shadow-card">
                  <div className="flex h-40 items-center justify-center bg-navy-gradient">
                    <span className="font-display text-4xl font-bold text-gold-300">
                      {lecturer.name.replace("Lecturer ", "L")}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-navy-900">
                      {lecturer.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-gold-600">{lecturer.title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-navy-600">{lecturer.bio}</p>
                    {subject && (
                      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-navy-400">
                        Teaches {subject.code} · {subject.sessions} sessions · {subject.hours} hours
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-10 rounded-lg border border-dashed border-navy-200 bg-navy-50 p-5 text-sm text-navy-500">
            Placeholder notice: lecturer names, photos, and biographies above
            are generated placeholders tied to each lecturer&apos;s subject
            assignment (see <code>src/lib/program.ts</code>). Replace with
            real faculty photos and bios once supplied by the training
            institute.
          </p>
        </Container>
      </section>
    </>
  );
}
