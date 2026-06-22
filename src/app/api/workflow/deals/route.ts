import { NextRequest, NextResponse } from "next/server";
import { assertPipelineDealLimit } from "@/lib/billing";
import { requireUser } from "@/lib/workflow";
import type { PipelineStage } from "@/lib/workflow-types";

const STAGES = new Set(["shortlist", "dd", "bid", "won", "lost"]);

export async function GET() {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("pipeline_deals")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ deals: data ?? [] });
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
    const propertyId = body.property_id as string | undefined;
    const stage = (body.stage as PipelineStage | undefined) ?? "shortlist";

    if (!propertyId) {
      return NextResponse.json({ error: "property_id required" }, { status: 400 });
    }
    if (!STAGES.has(stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("pipeline_deals")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (!existing) {
      await assertPipelineDealLimit();
    }

    const { data, error } = await supabase
      .from("pipeline_deals")
      .upsert(
        {
          user_id: user.id,
          property_id: propertyId,
          stage,
          notes: body.notes ?? null,
        },
        { onConflict: "user_id,property_id" },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ deal: data });
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