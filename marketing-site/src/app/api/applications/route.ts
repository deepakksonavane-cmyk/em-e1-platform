import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validations";
import { saveApplication } from "@/lib/applications";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const record = await saveApplication(parsed.data);

  return NextResponse.json({
    applicationId: record.applicationId,
    status: record.status,
  });
}
