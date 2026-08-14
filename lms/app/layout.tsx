import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Management & Team Leadership E1 — Student LMS",
  description:
    "Student Learning Management System for the Event Management & Team Leadership E1 diploma program.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
