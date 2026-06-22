import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const state = request.nextUrl.searchParams.get("state");
    const supabase = await createServerSupabase();

    let query = supabase
      .from("listings_public")
      .select("city, state")
      .not("city", "is", null)
      .limit(2000);

    if (state) {
      query = query.eq("state", state);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const city = (row.city as string)?.trim();
      if (!city) continue;
      counts.set(city, (counts.get(city) ?? 0) + 1);
    }

    const cities = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({ cities });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}