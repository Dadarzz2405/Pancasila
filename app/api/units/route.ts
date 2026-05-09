import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase-server";
import { listUnits } from "@/src/lib/store";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("units")
      .select("id,sila_number,title,hook_question,color_accent")
      .order("sila_number", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Units API fallback:", error);
    return NextResponse.json(listUnits());
  }
}
