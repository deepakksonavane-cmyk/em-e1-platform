import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import PathwayIcon from "@/components/career-pathways/PathwayIcon";
import { careerPathways } from "@/data/career-pathways";

export const metadata: Metadata = {
  title: "Career Pathways",
  description:
    "Explore the career pathways the Event Management & Team Leadership E1 diploma prepares you for — from corporate events to starting your own event business.",
};

export default function CareerPathwaysPage() {
  return (
    <>
      <section className="bg-navy-gradient py-16 text-white md:py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            Life After E1
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Career Pathways
          </h1>
          <p className="mt-5 max-w-2xl text-white/80">
            The E1 diploma has not yet graduated its first batch, so instead of
            showcasing outcomes we haven&apos;t earned yet, here&apos;s an honest look
            at where the curriculum is designed to take you — the roles,
            industries, and skills each subject prepares you for.
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container>
          <SectionHeading
            eyebrow="Where E1 Can Take You"
            title="Eight pathways, one diploma"
            description="Every pathway below draws directly on skills taught across the program's 6 subjects — not generic career advice. Hover any card to see which subjects feed into it."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {careerPathways.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col rounded-xl border border-navy-100 p-6 shadow-card transition hover:border-gold-300 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                  <PathwayIcon name={p.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy-900">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">
                  {p.summary}
                </p>
                <ul className="mt-5 space-y-1.5 border-t border-navy-100 pt-4">
                  {p.skillsApplied.map((s) => (
                    <li key={s} className="flex gap-2 text-xs text-navy-500">
                      <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-gold-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 rounded-lg border border-dashed border-navy-200 bg-navy-50 p-5 text-sm text-navy-500">
            These pathways describe what the curriculum prepares you for, not
            guaranteed job placement or income outcomes. Once E1&apos;s first
            batch graduates, this page will be updated with real alumni
            stories and verified outcomes (collected with consent) — see{" "}
            <code>src/data/career-pathways.ts</code>.
          </p>

          <div className="mt-10 text-center">
            <Link
              href="/apply"
              className="rounded-md bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-navy-700"
            >
              Start Your Pathway — Apply Now
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
