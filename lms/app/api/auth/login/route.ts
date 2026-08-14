import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { createSessionToken, verifyPassword, SESSION_COOKIE_NAME } from "@/lib/auth";
import type { User } from "@/lib/types";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/dashboard");

  const fail = (message: string) => {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", message);
    if (email) url.searchParams.set("email", email);
    return NextResponse.redirect(url, { status: 303 });
  };

  if (!email || !password) return fail("Please enter your email and password.");

  const user = await queryOne<User>('SELECT * FROM "User" WHERE email = $1', [email]);
  if (!user || !user.isActive) return fail("No account found with that email.");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return fail("Incorrect password. Please try again.");

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const redirectTo =
    user.role === "STUDENT" ? next || "/dashboard" : "/dashboard";
  const res = NextResponse.redirect(new URL(redirectTo, req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
