// Edge-compatible JWT sign/verify using `jose` (works in both the Edge runtime used by
// middleware.ts and the Node runtime used by server components / API routes).
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-do-not-use-in-production";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  userId: string;
  role: "FACULTY" | "ADMIN";
  facultyId: string;
  name: string;
  email: string;
}

export async function signSession(payload: SessionPayload, days = 7): Promise<string> {
  return new SignJWT({ ...payload } as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
