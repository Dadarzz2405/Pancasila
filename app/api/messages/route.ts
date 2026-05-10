import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase-server";
import { addMessage, listMessages } from "@/src/lib/store";
import { createAdminClient } from "@/src/lib/supabase-admin";

type AuthUserLike = {
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    [key: string]: unknown;
  } | null;
};

function displayNameFromUser(user: AuthUserLike | null) {
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  if (fullName) return fullName;
  const email = user?.email ?? "";
  if (email.includes("@")) return email.split("@")[0];
  return "Peserta";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discussionId = searchParams.get("discussion_id") ?? undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabase
      .from("messages")
      .select("id,discussion_id,author_id,content,created_at")
      .order("created_at", { ascending: true });

    if (discussionId) {
      query = query.eq("discussion_id", discussionId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const authorIds = Array.from(
      new Set((data ?? []).map((message) => message.author_id).filter(Boolean)),
    ) as string[];

    const admin = createAdminClient();
    const entries = await Promise.all(
      authorIds.map(async (id) => {
        const { data: userData } = await admin.auth.admin.getUserById(id);
        return [id, displayNameFromUser(userData.user ?? null)] as const;
      }),
    );

    const authorMap = new Map(entries);
    const enriched = (data ?? []).map((message) => ({
      ...message,
      author_name: message.author_id ? authorMap.get(message.author_id) ?? "Peserta" : "Anonim",
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Messages API fallback:", error);
    return NextResponse.json(listMessages(discussionId));
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    content?: string;
    discussion_id?: string;
  };

  const content = body.content?.trim();
  const discussionId = body.discussion_id?.trim();

  if (!content || !discussionId) {
    return NextResponse.json(
      { error: "Content and discussion_id are required." },
      { status: 400 },
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
      .from("messages")
      .insert({
        discussion_id: discussionId,
        author_id: user.id,
        content,
      })
      .select("id,discussion_id,author_id,content,created_at")
      .single();

    if (error) throw error;
    return NextResponse.json(
      {
        ...data,
        author_name: displayNameFromUser(user),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Messages POST fallback:", error);
    return NextResponse.json(
      addMessage({
        content,
        discussion_id: discussionId,
      }),
      { status: 201 },
    );
  }
}
