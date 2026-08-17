import Link from "next/link";
import Container from "@/components/ui/Container";
import SocialIcons from "@/components/ui/SocialIcons";
import NewsletterForm from "@/components/layout/NewsletterForm";
import { program } from "@/lib/program";

export default function SiteFooter() {
  return (
    <footer className="bg-navy-gradient text-white">
      <Container className="section grid grid-cols-1 gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-400 font-display text-lg font-bold text-navy-900">
              E1
            </span>
            <span className="font-display text-base font-semibold">
              Event Management &amp; Team Leadership
            </span>
          </div>
          <p className="mt-4 text-sm text-white/70">
            {program.durationMonths}-month blended diploma program preparing
            the next generation of event leaders — {program.totalHours} hours,
            {" "}
            {program.totalSubjects} subjects, {program.totalSessions} sessions.
          </p>
          <SocialIcons className="mt-5" />
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold-300">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li><Link href="/program" className="hover:text-gold-300">Program Curriculum</Link></li>
            <li><Link href="/faculty" className="hover:text-gold-300">Faculty</Link></li>
            <li><Link href="/career-pathways" className="hover:text-gold-300">Career Pathways</Link></li>
            <li><Link href="/blog" className="hover:text-gold-300">Blog &amp; News</Link></li>
            <li><Link href="/faq" className="hover:text-gold-300">FAQ</Link></li>
            <li><Link href="/feedback" className="hover:text-gold-300">Send Feedback</Link></li>
            <li><Link href="/apply" className="hover:text-gold-300">Apply Now</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold-300">
            Contact
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li>Email: admissions@eventmanagement-e1.example.edu</li>
            <li>Phone: +91 98765 43210</li>
            <li>WhatsApp: +91 98765 43210</li>
            <li>Address: 4th Floor, Skyline Business Centre, Andheri East, Mumbai, Maharashtra 400069, India</li>
          </ul>
          <Link href="/contact" className="mt-3 inline-block text-sm font-semibold text-gold-300 hover:text-gold-200">
            Get in touch →
          </Link>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-gold-300">
            Stay Updated
          </h4>
          <p className="mt-4 text-sm text-white/70">
            Subscribe for admissions updates, curriculum news, and event
            leadership insights.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {program.programName}. All rights
            reserved.
          </p>
          <p>Program Code: {program.programCode} · {program.level}</p>
        </Container>
      </div>
    </footer>
  );
}
