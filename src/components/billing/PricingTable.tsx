import Link from "next/link";
import { Check } from "lucide-react";
import { PLAN_PRICING, type PlanTier } from "@/lib/plans";

export function PricingTable({ currentPlan }: { currentPlan?: PlanTier }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PLAN_PRICING.map((tier) => {
        const isCurrent = currentPlan === tier.id;
        return (
          <div
            key={tier.id}
            className={`flex flex-col rounded-2xl border p-6 ${
              tier.highlighted
                ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{tier.name}</h2>
              <p
                className={`mt-1 text-sm ${
                  tier.highlighted ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {tier.description}
              </p>
            </div>
            <p className="mb-6">
              <span className="text-3xl font-bold">{tier.price}</span>
              <span
                className={`text-sm ${
                  tier.highlighted ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {tier.period}
              </span>
            </p>
            <ul className="mb-8 flex-1 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      tier.highlighted ? "text-emerald-400" : "text-emerald-600"
                    }`}
                    aria-hidden
                  />
                  {feature}
                </li>
              ))}
            </ul>
            {isCurrent ? (
              <span
                className={`rounded-lg px-4 py-2.5 text-center text-sm font-medium ${
                  tier.highlighted
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Current plan
              </span>
            ) : tier.id === "free" ? (
              <Link
                href="/signup"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Get started
              </Link>
            ) : (
              <a
                href="mailto:hello@auctionmap.in?subject=AuctionMap%20upgrade"
                className={`rounded-lg px-4 py-2.5 text-center text-sm font-medium ${
                  tier.highlighted
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {tier.cta}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}