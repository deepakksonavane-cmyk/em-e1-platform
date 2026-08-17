import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import FeedbackForm from "@/components/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "Send Feedback",
  description:
    "Reviewing the Event Management & Team Leadership E1 site? Tell us what's confusing, broken, or working well.",
};

export default function FeedbackPage() {
  return (
    <>
      <section className="bg-navy-gradient py-16 text-white md:py-20">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            We&apos;d Genuinely Like To Know
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Send Feedback
          </h1>
          <p className="mt-5 max-w-2xl text-white/80">
            If someone shared this site with you to get your honest take, this
            is the place to leave it. Broken links, confusing copy, pricing
            that doesn&apos;t make sense, or things you genuinely liked — all
            of it is useful.
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container className="max-w-2xl">
          <FeedbackForm />
        </Container>
      </section>
    </>
  );
}
