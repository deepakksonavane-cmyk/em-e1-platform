import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Hear from graduates of the Event Management & Team Leadership E1 diploma program.",
};

export default function TestimonialsPage() {
  return (
    <>
      <section className="bg-navy-gradient py-16 text-white md:py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            Graduate Stories
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Testimonials</h1>
          <p className="mt-5 max-w-2xl text-white/80">
            What students say about the weekends, the capstone pitch, and
            life after graduating.
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container>
          <SectionHeading
            eyebrow="Sample Testimonials"
            title="What graduates say"
            description="These sample testimonials illustrate the kind of feedback the program generates. They are placeholders — see notice below."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="rounded-xl border border-navy-100 p-7 shadow-card">
                <p className="text-navy-700">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-5 border-t border-navy-100 pt-4">
                  <p className="text-sm font-semibold text-navy-900">{t.name}</p>
                  <p className="text-xs text-navy-500">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>

          <p className="mt-10 rounded-lg border border-dashed border-navy-200 bg-navy-50 p-5 text-sm text-navy-500">
            Placeholder notice: the testimonials above are illustrative
            samples written to reflect the real program structure — they are
            not real student quotes. Replace with actual graduate
            testimonials (collected with consent, per the program&apos;s
            photo/video &amp; testimonial consent clause) before launch. See{" "}
            <code>src/data/testimonials.ts</code>.
          </p>

          <div className="mt-10 text-center">
            <Link href="/apply" className="rounded-md bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-navy-700">
              Start Your Own Story — Apply Now
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
