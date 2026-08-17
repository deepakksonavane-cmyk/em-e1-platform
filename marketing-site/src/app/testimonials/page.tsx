import { redirect } from "next/navigation";

// This page has moved — replaced by the honest, non-fabricated Career
// Pathways page since the program hasn't graduated a first batch yet.
// See src/app/career-pathways/page.tsx.
export default function TestimonialsRedirect() {
  redirect("/career-pathways");
}
