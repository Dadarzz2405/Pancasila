import { NextResponse } from "next/server";
import { verifyHCaptcha } from "@/src/lib/hcaptcha";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  const token = body.token?.trim();

  if (!token) {
    return NextResponse.json({ error: "Captcha token is required." }, { status: 400 });
  }

  const result = await verifyHCaptcha({ token });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, codes: result.codes }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

