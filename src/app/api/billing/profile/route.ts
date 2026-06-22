import { NextResponse } from "next/server";
import { fetchPlanUsage } from "@/lib/billing";
import { requireUser } from "@/lib/workflow";

export async function GET() {
  try {
    await requireUser();
    const usage = await fetchPlanUsage();
    return NextResponse.json(usage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}