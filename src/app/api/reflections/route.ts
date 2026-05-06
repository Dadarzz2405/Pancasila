import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    // Get all verified reflections
    const { data, error } = await supabase
      .from("reflections")
      .select(`
        id,
        unit_id,
        content,
        is_anonymous,
        author_name,
        created_at,
        units (
          title,
          color_accent
        )
      `)
      .eq("status", "verified")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching reflections:", error);
    return NextResponse.json(
      { error: "Failed to fetch reflections" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content, unit_id, is_anonymous } = await request.json();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Insert new reflection
    const { data, error } = await supabase
      .from("reflections")
      .insert({
        unit_id,
        author_id: user.id,
        content,
        is_anonymous,
        author_name: is_anonymous ? "Anonim" : user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonim",
        status: "pending", // Will be updated by moderation
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating reflection:", error);
    return NextResponse.json(
      { error: "Failed to create reflection" },
      { status: 500 }
    );
  }
}