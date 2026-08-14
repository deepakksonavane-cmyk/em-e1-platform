import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import ContactForm from "@/components/contact/ContactForm";
import SocialIcons from "@/components/ui/SocialIcons";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Event Management & Team Leadership E1 admissions team — phone, email, WhatsApp, and our office address.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-navy-gradient py-14 text-white md:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">
            Get In Touch
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Contact Us</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Questions about the curriculum, admissions, fees, or in-person
            weekends? Reach out — we typically respond within 1-2 business
            days.
          </p>
        </Container>
      </section>

      <section className="section bg-white">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="font-display text-2xl font-bold text-navy-900">Send a Message</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-navy-900 p-8 text-white">
              <h3 className="font-display text-lg font-semibold">Admissions Office</h3>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-white/50">Email</dt>
                  <dd className="mt-0.5">admissions@eventmanagement-e1.example.edu</dd>
                </div>
                <div>
                  <dt className="text-white/50">Phone</dt>
                  <dd className="mt-0.5">+91 98765 43210</dd>
                </div>
                <div>
                  <dt className="text-white/50">WhatsApp</dt>
                  <dd className="mt-0.5">+91 98765 43210</dd>
                </div>
                <div>
                  <dt className="text-white/50">Address</dt>
                  <dd className="mt-0.5">
                    4th Floor, Skyline Business Centre,
                    <br />
                    Andheri East, Mumbai,
                    <br />
                    Maharashtra 400069, India
                  </dd>
                </div>
              </dl>
              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="text-xs uppercase tracking-wide text-white/50">Follow Us</p>
                <SocialIcons className="mt-3" />
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-navy-100">
              <iframe
                title="Office location map"
                src="https://www.google.com/maps?q=Andheri+East,+Mumbai,+Maharashtra&output=embed"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
