import { createServerSupabase } from "./supabase/server";
import type { ListingPublic } from "./types";
import type {
  PipelineDeal,
  PipelineDealWithListing,
  SavedSearch,
  UserPropertyNote,
} from "./workflow-types";

export type { PipelineStage } from "./workflow-types";
export {
  PIPELINE_STAGES,
  describeFilters,
  filtersToSearchParams,
} from "./workflow-types";
export type {
  PipelineDeal,
  PipelineDealWithListing,
  SavedSearch,
  UserPropertyNote,
} from "./workflow-types";

export async function requireUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SavedSearch[];
}

export async function fetchPipelineDeals(): Promise<PipelineDealWithListing[]> {
  const { supabase } = await requireUser();
  const { data: deals, error } = await supabase
    .from("pipeline_deals")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  const propertyIds = [...new Set((deals ?? []).map((d) => d.property_id as string))];
  if (propertyIds.length === 0) return [];

  const { data: listings, error: listError } = await supabase
    .from("listings_public")
    .select("*")
    .in("property_id", propertyIds);

  if (listError) throw new Error(listError.message);

  const byId = new Map(
    ((listings ?? []) as ListingPublic[]).map((l) => [l.property_id, l]),
  );

  return (deals ?? []).map((deal) => ({
    ...(deal as PipelineDeal),
    listing: byId.get(deal.property_id as string) ?? null,
  }));
}

export async function fetchPropertyNote(
  propertyId: string,
): Promise<UserPropertyNote | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("user_property_notes")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserPropertyNote | null;
}

export async function fetchPipelineDealForProperty(
  propertyId: string,
): Promise<PipelineDeal | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("pipeline_deals")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as PipelineDeal | null;
}