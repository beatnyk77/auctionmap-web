import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/workflow";
import type { PipelineStage } from "@/lib/workflow-types";

const STAGES = new Set(["shortlist", "dd", "bid", "won", "lost"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.stage != null) {
      if (!STAGES.has(body.stage)) {
        return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
      }
      updates.stage = body.stage as PipelineStage;
    }
    if (body.notes !== undefined) updates.notes = body.notes;

    const { data, error } = await supabase
      .from("pipeline_deals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ deal: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();

    const { error } = await supabase.from("pipeline_deals").delete().eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}