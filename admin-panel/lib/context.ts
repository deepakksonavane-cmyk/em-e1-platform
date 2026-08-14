import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { prisma } from "./prisma";

export async function getFacultyContext() {
  const session = await getSession();
  if (!session) redirect("/login");

  const faculty = await prisma.faculty.findUnique({
    where: { id: session.facultyId },
    include: {
      user: true,
      subjects: true,
    },
  });

  if (!faculty) redirect("/login");

  const isAdmin = session.role === "ADMIN";

  return { session, faculty, isAdmin };
}
