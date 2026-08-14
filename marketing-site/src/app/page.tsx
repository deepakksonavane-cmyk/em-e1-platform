import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { program, subjects, weekends } from "@/lib/program";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Diploma in Event Management & Team Leadership",
  description:
    "A 420-hour, 24-week blended diploma program: 6 subjects, 74 sessions, 6 expert lecturers, 3 in-person weekends, real internship, and a capstone event pitch. Apply now.",
};

const stats = [
  { label: "Training Hours", value: `${program.totalHours}` },
  { label: "Weeks", value: `${program.durationWeeks}` },
  { label: "Subjects", value: `${program.totalSubjects}` },
  { label: "Live Sessions", value: `${program.totalSessions}` },
  { label: "In-Person Weekends", value: "3" },
];

const valueProps = [
  {
    title: "Learn from Industry Practitioners",
    description:
      "Six specialist lecturers guide you through the full arc of event management — from foundations and budgeting to production, digital events, and business strategy.",
  },
  {
    title: "Blended, Career-Ready Format",
    description:
      "Live online sessions during the week, three immersive in-person weekends, and a mandatory internship — so you graduate with real, demonstrable experience.",
  },
  {
    title: "Build a Real Portfolio",
    description:
      "Assignments, 8 in-depth case studies, and a capstone event proposal pitched to a panel of experts mean you leave with proof of work, not just a transcript.",
  },
  {
    title: "Complete Business Toolkit",
    description:
      "From vendor contracts and sponsorship pitches to GST compliance and pricing strategy — graduate ready to freelance, join an agency, or start your own event business.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-gradient text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-navy-400 blur-3xl" />
        </div>
        <Container className="relative py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
              {program.level} · Program Code {program.programCode}
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              {program.programName}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              A complete {program.durationMonths}-month blended diploma that
              takes you from event fundamentals to leading full-scale
              productions — combining live online classes, hands-on
              in-person weekends, and a real-world internship.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/apply"
                className="rounded-md bg-gold-400 px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-card transition hover:bg-gold-300"
              >
                Apply Now
              </Link>
              <Link
                href="/program"
                className="rounded-md border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore the Curriculum
              </Link>
            </div>
          </div>
        </Container>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 bg-navy-950/40">
          <Container>
            <dl className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-5">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <dt className="text-xs font-medium uppercase tracking-wide text-white/60">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-bold text-gold-300">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </div>
      </section>

      {/* Value props */}
      <section className="section bg-white">
        <Container>
          <SectionHeading
            eyebrow="Why This Program"
            title="Built for people who want to lead, not just plan"
            description="Every module blends theory with practical, deliverable-based learning — so what you build in class is what you'll build on the job."
            align="center"
          />
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {valueProps.map((item) => (
              <div key={item.title} className="rounded-xl border border-navy-100 bg-white p-7 shadow-card">
                <h3 className="font-display text-xl font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Program highlights: subjects */}
      <section className="section bg-navy-50">
        <Container>
          <SectionHeading
            eyebrow="Curriculum at a Glance"
            title="Six subjects. One complete skill set."
            description="Across 24 weeks you'll move through every discipline an event leader needs — in the order you'd actually use them on a real event."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, i) => (
              <div key={subject.code} className="rounded-xl bg-white p-6 shadow-card">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {subject.code} · Weeks {subject.weeks}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-navy-900">
                  {i + 1}. {subject.name}
                </h3>
                <p className="mt-3 text-sm text-navy-600">
                  {subject.sessions} sessions · {subject.hours} hours ·
                  taught by {subject.lecturer}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/program" className="text-sm font-semibold text-navy-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-gold-600">
              See the full 74-session curriculum →
            </Link>
          </div>
        </Container>
      </section>

      {/* Weekends */}
      <section className="section bg-white">
        <Container>
          <SectionHeading
            eyebrow="In-Person Immersion"
            title="Three weekends that turn theory into muscle memory"
            description="Beyond the live online classroom, you'll spend three full weekends on-site: opening team-building, a mid-program full-scale simulation, and a graduation capstone pitch."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {weekends.map((weekend) => (
              <div key={weekend.code} className="rounded-xl border border-navy-100 p-7">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                  Week {weekend.week} · {weekend.totalHours} hours
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-navy-900">{weekend.name}</h3>
                <p className="mt-1 text-sm font-medium text-navy-500">{weekend.focus}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-navy-600">
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

      {/* Testimonials teaser */}
      <section className="section bg-navy-gradient text-white">
        <Container>
          <SectionHeading
            eyebrow="Student Voices"
            title="What learners say about the program"
            light
            align="center"
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <blockquote key={t.name} className="rounded-xl bg-white/5 p-7">
                <p className="text-sm leading-relaxed text-white/85">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-5">
                  <p className="text-sm font-semibold text-gold-300">{t.name}</p>
                  <p className="text-xs text-white/60">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/testimonials" className="text-sm font-semibold text-gold-300 underline decoration-2 underline-offset-4 hover:text-gold-200">
              Read more stories →
            </Link>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="section bg-white">
        <Container className="rounded-2xl bg-navy-900 px-8 py-16 text-center text-white sm:px-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ready to lead your first event?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">
            Applications for the next batch are open. Minimum 80% attendance,
            a real internship, and a capstone pitch stand between you and a
            career-ready diploma.
          </p>
          <div className="mt-8">
            <Link href="/apply" className="rounded-md bg-gold-400 px-8 py-3.5 text-sm font-semibold text-navy-900 transition hover:bg-gold-300">
              Start Your Application
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
