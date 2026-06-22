import { NextRequest, NextResponse } from "next/server";
import { canUseWhiteLabel } from "@/lib/plans";
import { fetchUserProfile } from "@/lib/billing";
import { requireUser } from "@/lib/workflow";

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const profile = await fetchUserProfile(user.id);
    const plan = profile?.plan ?? "free";

    if (!canUseWhiteLabel(plan)) {
      return NextResponse.json(
        { error: "White-label plan required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const tenantId = body.tenant_id as string | undefined;
    if (!tenantId) {
      return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (body.brand_name != null) updates.brand_name = body.brand_name;
    if (body.tagline != null) updates.tagline = body.tagline;
    if (body.logo_url != null) updates.logo_url = body.logo_url;
    if (body.primary_color != null) updates.primary_color = body.primary_color;
    if (body.accent_color != null) updates.accent_color = body.accent_color;
    if (body.listing_filters != null) updates.listing_filters = body.listing_filters;

    const { data, error } = await supabase
      .from("tenants")
      .update(updates)
      .eq("id", tenantId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ tenant: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}