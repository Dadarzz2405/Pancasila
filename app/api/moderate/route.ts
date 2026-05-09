import { NextResponse } from "next/server";
import { moderateContent } from "@/src/lib/moderation";
import { createClient } from "@/src/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
