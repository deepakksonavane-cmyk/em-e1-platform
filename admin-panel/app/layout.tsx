import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EM&TL E1 — Faculty Admin Panel",
  description: "Faculty Admin Panel for Event Management & Team Leadership E1 diploma program",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
