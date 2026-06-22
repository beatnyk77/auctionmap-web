import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/workflow";

export async function GET(request: NextRequest) {
  try {
    const propertyId = request.nextUrl.searchParams.get("property_id");
    if (!propertyId) {
      return NextResponse.json({ error: "property_id required" }, { status: 400 });
    }

    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("user_property_notes")
      .select("*")
      .eq("property_id", propertyId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return NextResponse.json({ note: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();
    const propertyId = body.property_id as string | undefined;
    const noteBody = (body.body as string | undefined) ?? "";

    if (!propertyId) {
      return NextResponse.json({ error: "property_id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_property_notes")
      .upsert(
        {
          user_id: user.id,
          property_id: propertyId,
          body: noteBody,
        },
        { onConflict: "user_id,property_id" },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ note: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}