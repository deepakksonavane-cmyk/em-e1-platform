import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProgramJourneyMap from "@/components/journey/ProgramJourneyMap";

export const metadata: Metadata = {
  title: "Program Journey",
  description:
    "An interactive map of the 24-week Event Management & Team Leadership E1 diploma — six subjects, 74 live sessions, and three in-person weekends, in one view.",
};

export default function JourneyPage() {
  return (
    <>
      <section className="bg-navy-gradient py-16 text-white md:py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            See The Whole Program At Once
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            The E1 Journey
          </h1>
          <p className="mt-5 max-w-2xl text-white/80">
            24 weeks, 6 subjects, 74 live sessions, and 3 in-person weekends —
            laid out as one continuous path instead of a table. Hover any
            point for details, or drag the slider to see where a student is
            in the journey.
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container>
          <SectionHeading
            eyebrow="Interactive Map"
            title="From orientation to graduation"
            description="Every number here is pulled from the real program data — the same curriculum shown on the Program page, just laid out as a route instead of a list."
          />
          <div className="mt-10">
            <ProgramJourneyMap />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/program"
              className="text-sm font-semibold text-navy-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-gold-600"
            >
              See the full session-by-session curriculum →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
