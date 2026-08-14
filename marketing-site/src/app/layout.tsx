import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

// NOTE: next/font/google requires outbound network access to Google Fonts,
// which is unavailable in this build environment. We fall back to a
// carefully chosen system/web-safe font stack (see globals.css) that
// preserves the intended serif-display / sans-body pairing. Swap back to
// next/font/google (Playfair Display + Inter) once building in an
// environment with internet access, for self-hosted, zero-layout-shift
// font loading.
const siteUrl = "https://em-e1.example.edu";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Event Management & Team Leadership E1 | Diploma Program",
    template: "%s | Event Management & Team Leadership E1",
  },
  description:
    "A 420-hour, 24-week blended diploma in Event Management & Team Leadership — 6 subjects, 74 sessions, 6 expert lecturers, 3 in-person weekends, and a real-world capstone. Apply now.",
  keywords: [
    "event management diploma",
    "event management course",
    "team leadership training",
    "event planning certification",
    "event management institute",
  ],
  openGraph: {
    title: "Event Management & Team Leadership E1 | Diploma Program",
    description:
      "420 hours. 24 weeks. 6 subjects. 74 sessions. 3 in-person weekends. A complete, career-ready diploma in event management and team leadership.",
    url: siteUrl,
    siteName: "Event Management & Team Leadership E1",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Management & Team Leadership E1",
    description:
      "A 420-hour blended diploma program for aspiring event leaders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-navy-900 bg-white">
        <SiteHeader />
        <main className="min-h-screen">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
