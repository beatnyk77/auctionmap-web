import Link from "next/link";
import { PricingTable } from "@/components/billing/PricingTable";
import { getSessionUser } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/billing";
import type { PlanTier } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getSessionUser();
  let currentPlan: PlanTier | undefined;

  if (user) {
    const profile = await fetchUserProfile(user.id);
    currentPlan = profile?.plan;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Plans for serious buyers</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Start free on the map. Upgrade to Pro for exports and unlimited workflow,
          or white-label for a branded subdomain for your clients.
        </p>
      </div>

      <PricingTable currentPlan={currentPlan} />

      <p className="mt-10 text-center text-sm text-slate-500">
        Payments via invoice today — Stripe checkout coming soon.{" "}
        <a href="mailto:hello@auctionmap.in" className="font-medium text-slate-800 hover:underline">
          hello@auctionmap.in
        </a>
      </p>

      {!user && (
        <p className="mt-4 text-center text-sm">
          <Link href="/signup" className="font-medium text-slate-900 hover:underline">
            Create a free account →
          </Link>
        </p>
      )}
    </div>
  );
}