import { NextResponse } from "next/server";
import { moderateContent } from "@/src/lib/moderation";
import { createClient } from "@/src/lib/supabase-server";
import { addDiscussion, listDiscussions } from "@/src/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get("unit_id") ?? undefined;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("discussions")
      .select("id,unit_id,author_id,title,content,status,ai_feedback,created_at")
      .eq("status", "verified")
      .order("created_at", { ascending: false });

    if (unitId) {
      query = query.eq("unit_id", unitId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Discussions API fallback:", error);
    return NextResponse.json(listDiscussions(unitId));
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    content?: string;
    title?: string;
    unit_id?: string;
  };

  const title = body.title?.trim();
  const content = body.content?.trim();
  const unitId = body.unit_id?.trim();

  if (!title || !content || !unitId) {
    return NextResponse.json(
      { error: "Title, content, and unit_id are required." },
      { status: 400 },
    );
  }

  const moderation = await moderateContent(`${title}\n${content}`);

  if (!moderation.valid) {
    return NextResponse.json(
      { error: moderation.reason || "Discussion rejected by moderation." },
      { status: 422 },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("discussions")
      .insert({
        unit_id: unitId,
        author_id: user.id,
        title,
        content,
        status: "verified",
      })
      .select("id,unit_id,author_id,title,content,status,ai_feedback,created_at")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Discussions POST fallback:", error);
    return NextResponse.json(
      addDiscussion({
        title,
        content,
        unit_id: unitId,
      }),
      { status: 201 },
    );
  }
}
