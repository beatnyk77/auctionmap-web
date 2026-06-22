import { NextRequest, NextResponse } from "next/server";
import { assertSavedSearchLimit } from "@/lib/billing";
import { requireUser } from "@/lib/workflow";

export async function GET() {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ searches: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("Free plan allows")
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();
    const name = (body.name as string | undefined)?.trim();
    const filters = body.filters ?? {};

    if (!name) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }

    await assertSavedSearchLimit();

    const { data, error } = await supabase
      .from("saved_searches")
      .insert({
        user_id: user.id,
        name,
        filters,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ search: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("Free plan allows")
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}