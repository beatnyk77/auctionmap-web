import { createServerSupabase } from "./supabase/server";
import { PLAN_LIMITS, type PlanTier, isProOrAbove } from "./plans";
import { requireUser } from "./workflow";

export interface UserProfile {
  user_id: string;
  plan: PlanTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_expires_at: string | null;
}

export interface PlanUsage {
  plan: PlanTier;
  saved_searches: number;
  pipeline_deals: number;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserProfile | null;
}

export async function getCurrentPlan(): Promise<PlanTier> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "free";

  const profile = await fetchUserProfile(user.id);
  return profile?.plan ?? "free";
}

export async function fetchPlanUsage(): Promise<PlanUsage> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("user_plan_usage");

  if (error) throw new Error(error.message);
  const usage = data as PlanUsage;
  return {
    plan: usage.plan ?? "free",
    saved_searches: usage.saved_searches ?? 0,
    pipeline_deals: usage.pipeline_deals ?? 0,
  };
}

export async function requireProPlan(): Promise<PlanTier> {
  const { supabase, user } = await requireUser();
  const profile = await fetchUserProfile(user.id);
  const plan = profile?.plan ?? "free";

  if (!isProOrAbove(plan)) {
    throw new Error("Pro plan required");
  }

  return plan;
}

export async function assertSavedSearchLimit(): Promise<void> {
  const usage = await fetchPlanUsage();
  const limit = PLAN_LIMITS[usage.plan].savedSearches;
  if (usage.saved_searches >= limit) {
    throw new Error(`Free plan allows up to ${limit} saved searches`);
  }
}

export async function assertPipelineDealLimit(): Promise<void> {
  const usage = await fetchPlanUsage();
  const limit = PLAN_LIMITS[usage.plan].pipelineDeals;
  if (usage.pipeline_deals >= limit) {
    throw new Error(`Free plan allows up to ${limit} pipeline deals`);
  }
}