import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import ApplicationForm from "@/components/apply/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply Now",
  description:
    "Apply to the Event Management & Team Leadership E1 diploma program. Complete the application, upload your documents, and secure your seat.",
};

export default function ApplyPage() {
  return (
    <>
      <section className="bg-navy-gradient py-14 text-white md:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            Admissions
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Apply Now</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Complete the form below in one sitting. It mirrors our official
            application form — personal details, education, professional
            background, program preferences, and payment.
          </p>
        </Container>
      </section>

      <section className="section bg-navy-50">
        <Container>
          <ApplicationForm />
        </Container>
      </section>
    </>
  );
}
