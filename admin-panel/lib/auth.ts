import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { signSession, verifySessionToken, SessionPayload } from "./auth-edge";

export type { SessionPayload };

const COOKIE_NAME = "em_e1_admin_session";
const SESSION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload, SESSION_DAYS);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export async function authenticateFaculty(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { faculty: true },
  });
  if (!user || !user.faculty) return null;
  if (!user.isActive) return null;
  if (user.role !== "FACULTY" && user.role !== "ADMIN") return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return {
    userId: user.id,
    role: user.role as "FACULTY" | "ADMIN",
    facultyId: user.faculty.id,
    name: user.name,
    email: user.email,
  } satisfies SessionPayload;
}
