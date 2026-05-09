import { NextResponse } from "next/server";
import { moderateContent } from "@/src/lib/moderation";
import { createClient } from "@/src/lib/supabase-server";
import { addReflection, listReflections } from "@/src/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get("unit_id") ?? undefined;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("reflections")
      .select("id,unit_id,author_id,content,is_anonymous,author_name,status,ai_feedback,created_at")
      .eq("status", "verified")
      .order("created_at", { ascending: false });

    if (unitId) {
      query = query.eq("unit_id", unitId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reflections API fallback:", error);
    return NextResponse.json(listReflections(unitId));
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    content?: string;
    is_anonymous?: boolean;
    unit_id?: string;
  };

  const content = body.content?.trim();
  const unitId = body.unit_id?.trim();

  if (!content || !unitId) {
    return NextResponse.json(
      { error: "Content and unit_id are required." },
      { status: 400 },
    );
  }

  const moderation = await moderateContent(content);

  if (!moderation.valid) {
    return NextResponse.json(
      { error: moderation.reason || "Reflection rejected by moderation." },
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

    const isAnonymous = body.is_anonymous ?? true;
    const authorName = isAnonymous
      ? "Anonim"
      : user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Peserta";

    const { data, error } = await supabase
      .from("reflections")
      .insert({
        unit_id: unitId,
        author_id: user.id,
        content,
        is_anonymous: isAnonymous,
        author_name: authorName,
        status: "verified",
      })
      .select("id,unit_id,author_id,content,is_anonymous,author_name,status,ai_feedback,created_at")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Reflections POST fallback:", error);
    return NextResponse.json(
      addReflection({
        content,
        unit_id: unitId,
        is_anonymous: body.is_anonymous ?? true,
      }),
      { status: 201 },
    );
  }
}
