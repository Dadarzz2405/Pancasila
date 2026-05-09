import { NextResponse } from "next/server";
import { moderateContent } from "@/src/lib/moderation";

export async function POST(request: Request) {
  const body = (await request.json()) as { content?: string };
  const content = body.content?.trim();

  if (!content) {
    return NextResponse.json(
      { error: "Content is required." },
      { status: 400 },
    );
  }

  const result = await moderateContent(content);
  return NextResponse.json(result);
}
