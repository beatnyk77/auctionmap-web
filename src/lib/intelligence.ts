import { createServerSupabase } from "./supabase/server";
import type { ListingDetail, RiskTier } from "./types";

export interface PriceHistoryPoint {
  event_id: string;
  reserve_price_lakhs: number | null;
  auction_date: string | null;
  scraped_at: string;
  event_rank: number;
}

export interface PriceSignals {
  auction_count: number;
  is_relisting: boolean;
  price_drop_pct: number | null;
  prior_reserve_lakhs: number | null;
  current_reserve_lakhs: number | null;
}

export interface RiskReason {
  label: string;
  detail: string;
  severity: "info" | "warning" | "critical";
}

export async function fetchPriceHistory(
  propertyId: string,
): Promise<PriceHistoryPoint[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("property_price_history")
    .select("event_id, reserve_price_lakhs, auction_date, scraped_at, event_rank")
    .eq("property_id", propertyId)
    .order("event_rank", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PriceHistoryPoint[];
}

export async function fetchPriceSignals(
  propertyId: string,
): Promise<PriceSignals | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("property_price_signals")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    auction_count: data.auction_count ?? 1,
    is_relisting: Boolean(data.is_relisting),
    price_drop_pct: data.price_drop_pct,
    prior_reserve_lakhs: data.prior_reserve_lakhs,
    current_reserve_lakhs: data.current_reserve_lakhs,
  };
}

export function deriveRiskReasons(listing: ListingDetail): RiskReason[] {
  const reasons: RiskReason[] = [];
  const tier = listing.risk_tier ?? "Unscored";

  if (listing.possession_status === "Bank in Possession") {
    reasons.push({
      label: "Physical possession",
      detail: "Bank holds physical possession — generally lower execution risk.",
      severity: "info",
    });
  } else if (listing.possession_status === "Borrower Occupying") {
    reasons.push({
      label: "Borrower occupying",
      detail: "Property may still be occupied — eviction risk after purchase.",
      severity: "warning",
    });
  } else if (listing.possession_status === "Symbolic Possession") {
    reasons.push({
      label: "Symbolic possession only",
      detail: "Possession may not be physical — verify on-ground status.",
      severity: "warning",
    });
  }

  if (listing.encumbrance_status === "Stay Order Active") {
    reasons.push({
      label: "Stay order",
      detail: "Court stay order reported — bidding may be blocked or delayed.",
      severity: "critical",
    });
  } else if (listing.encumbrance_status === "Municipal Dues Pending") {
    reasons.push({
      label: "Municipal dues",
      detail: "Outstanding municipal charges may transfer to buyer.",
      severity: "warning",
    });
  }

  if (listing.auction_type === "DRT") {
    reasons.push({
      label: "DRT auction",
      detail: "Debt Recovery Tribunal route — verify case status and timelines.",
      severity: "warning",
    });
  }

  if (listing.completeness_score != null && listing.completeness_score < 0.65) {
    reasons.push({
      label: "Incomplete data",
      detail: `Data completeness ${Math.round(listing.completeness_score * 100)}% — key fields may be missing.`,
      severity: "warning",
    });
  }

  const litTag = listing.tags?.find((t) => t.includes("Litigation"));
  if (litTag) {
    reasons.push({
      label: "Litigation keywords",
      detail: "Notice text mentions litigation or stay — verify with legal counsel.",
      severity: "critical",
    });
  }

  if (tier === "Green" && reasons.filter((r) => r.severity !== "info").length === 0) {
    reasons.push({
      label: "Favorable signals",
      detail: "Strong data quality and no major encumbrance flags detected.",
      severity: "info",
    });
  }

  if (reasons.length === 0) {
    reasons.push({
      label: "Unscored",
      detail: "Insufficient signals to explain risk tier — review source notice.",
      severity: "info",
    });
  }

  return reasons;
}

export function circleRateDiscount(
  pricePerSqft: number | null | undefined,
  circleRate: number | null | undefined,
): number | null {
  if (!pricePerSqft || !circleRate || circleRate <= 0) return null;
  return Math.round((1 - pricePerSqft / circleRate) * 100);
}

export async function fetchWeeklyBrief(): Promise<Record<string, unknown>> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.rpc("weekly_brief_stats");
  if (error) throw new Error(error.message);
  return (data ?? {}) as Record<string, unknown>;
}

export async function subscribeAlert(
  email: string,
  filters: Record<string, unknown>,
): Promise<string> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.rpc("subscribe_alert", {
    p_email: email,
    p_filters: filters,
  });
  if (error) throw new Error(error.message);
  return data as string;
}