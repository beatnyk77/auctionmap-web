export type PlanTier = "free" | "pro" | "white_label";

export const PLAN_LIMITS = {
  free: {
    savedSearches: 3,
    pipelineDeals: 20,
    csvExport: false,
    whiteLabel: false,
  },
  pro: {
    savedSearches: Infinity,
    pipelineDeals: Infinity,
    csvExport: true,
    whiteLabel: false,
  },
  white_label: {
    savedSearches: Infinity,
    pipelineDeals: Infinity,
    csvExport: true,
    whiteLabel: true,
  },
} as const;

export const PLAN_PRICING = [
  {
    id: "free" as const,
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Map, search, and basic workflow for individual investors.",
    features: [
      "Full map & search",
      "Up to 3 saved searches",
      "Up to 20 pipeline deals",
      "Email alerts",
      "Weekly brief",
    ],
    cta: "Current plan",
    highlighted: false,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "₹9,999",
    period: "/month",
    description: "Unlimited workflow and exports for active buyers and advisors.",
    features: [
      "Everything in Free",
      "Unlimited saved searches",
      "Unlimited deal pipeline",
      "CSV export (2,000 rows)",
      "Priority data refresh",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "white_label" as const,
    name: "White-label",
    price: "₹24,999",
    period: "/month",
    description: "Branded subdomain for consultants and boutique advisory firms.",
    features: [
      "Everything in Pro",
      "Custom subdomain branding",
      "Logo & color theming",
      "Territory filters (state/bank)",
      "Team workspace",
    ],
    cta: "Contact for white-label",
    highlighted: false,
  },
];

export function isProOrAbove(plan: PlanTier): boolean {
  return plan === "pro" || plan === "white_label";
}

export function canExport(plan: PlanTier): boolean {
  return PLAN_LIMITS[plan].csvExport;
}

export function canUseWhiteLabel(plan: PlanTier): boolean {
  return PLAN_LIMITS[plan].whiteLabel;
}