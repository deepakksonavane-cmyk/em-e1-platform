import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FaqAccordion from "@/components/faq/FaqAccordion";
import { faqCategories } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the most common questions about admissions, fees, schedule, and outcomes for the Event Management & Team Leadership E1 diploma.",
};

export default function FaqPage() {
  return (
    <>
      <section className="bg-navy-gradient py-16 text-white md:py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            Before You Apply
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-5 max-w-2xl text-white/80">
            Straight answers on eligibility, fees, schedule, and what this
            diploma actually prepares you for — including the questions
            we&apos;d want answered before applying ourselves.
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container className="max-w-4xl">
          <SectionHeading
            eyebrow="Quick Navigation"
            title="Jump to a section"
            description="Every question below is grouped by what stage of the decision it applies to."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {faqCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-700 transition hover:border-gold-400 hover:text-gold-600"
              >
                {category.title}
              </a>
            ))}
          </div>

          <div className="mt-16 space-y-16">
            {faqCategories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl font-semibold tracking-tightest text-navy-900 sm:text-3xl">
                  {category.title}
                </h2>
                <div className="mt-6">
                  <FaqAccordion items={category.items} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-xl border border-dashed border-navy-200 bg-navy-50 p-7 text-center">
            <p className="font-display text-lg font-semibold text-navy-900">
              Still have a question?
            </p>
            <p className="mt-2 text-sm text-navy-500">
              Admissions typically responds within 1–2 business days.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-full bg-navy-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-navy-700"
            >
              Contact Admissions
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
