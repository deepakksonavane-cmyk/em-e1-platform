import { NextRequest, NextResponse } from "next/server";
import { pool, queryOne, newId } from "@/lib/db";
import { createSessionToken, hashPassword, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const phone = String(form.get("phone") || "").trim();
  const city = String(form.get("city") || "").trim();
  const state = String(form.get("state") || "").trim();

  const fail = (message: string) => {
    const url = new URL("/register", req.url);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url, { status: 303 });
  };

  if (!name || !email || !password) {
    return fail("Name, email and password are required.");
  }
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }

  const existing = await queryOne('SELECT id FROM "User" WHERE email = $1', [email]);
  if (existing) return fail("An account with that email already exists.");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userId = newId();
    const passwordHash = await hashPassword(password);
    await client.query(
      `INSERT INTO "User" (id, email, "passwordHash", role, name, phone, "isActive")
       VALUES ($1,$2,$3,'STUDENT',$4,$5,true)`,
      [userId, email, passwordHash, name, phone || null]
    );

    const countRows = await client.query('SELECT COUNT(*)::int AS c FROM "Student"');
    const nextNum = (countRows.rows[0]?.c ?? 0) + 1;
    const studentId = `E1-${String(nextNum).padStart(3, "0")}`;
    const studId = newId();
    await client.query(
      `INSERT INTO "Student" (id, "studentId", "userId", batch, city, state, status)
       VALUES ($1,$2,$3,'Batch A',$4,$5,'ACTIVE')`,
      [studId, studentId, userId, city || null, state || null]
    );
    await client.query(
      `INSERT INTO "Certificate" (id, "studentId", issued) VALUES ($1,$2,false)`,
      [newId(), studId]
    );
    await client.query(
      `INSERT INTO "InternshipRecord" (id, "studentId", "requiredHours", "loggedHours", status)
       VALUES ($1,$2,30,0,'not_started')`,
      [newId(), studId]
    );
    await client.query(
      `INSERT INTO "Notification" (id, "userId", type, title, body, link)
       VALUES ($1,$2,'ANNOUNCEMENT','Welcome to the E1 Program!','Your account has been created. Explore My Courses and Sessions to get started.','/courses')`,
      [newId(), userId]
    );

    await client.query("COMMIT");

    const token = await createSessionToken({
      userId,
      email,
      role: "STUDENT",
      name,
    });
    const res = NextResponse.redirect(new URL("/dashboard", req.url), { status: 303 });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return fail("Something went wrong creating your account. Please try again.");
  } finally {
    client.release();
  }
}
