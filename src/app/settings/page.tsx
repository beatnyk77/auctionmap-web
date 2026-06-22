import Link from "next/link";
import { redirect } from "next/navigation";
import { TenantBrandingForm } from "@/components/billing/TenantBrandingForm";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { UpgradeBanner } from "@/components/billing/UpgradeBanner";
import { getSessionUser } from "@/lib/auth";
import { fetchPlanUsage, fetchUserProfile } from "@/lib/billing";
import { PLAN_LIMITS, canUseWhiteLabel } from "@/lib/plans";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Tenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

async function fetchUserTenant(userId: string): Promise<Tenant | null> {
  const supabase = await createServerSupabase();
  const { data: memberships, error: memberError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId);

  if (memberError || !memberships?.length) return null;

  const orgIds = memberships.map((m) => m.organization_id as string);
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .in("organization_id", orgIds)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as Tenant;
}

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/settings");

  const [profile, usage, tenant] = await Promise.all([
    fetchUserProfile(user.id),
    fetchPlanUsage(),
    fetchUserTenant(user.id),
  ]);

  const plan = profile?.plan ?? "free";
  const limits = PLAN_LIMITS[plan];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Account settings</h1>
      <p className="mt-1 text-sm text-slate-500">{user.email}</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-slate-900">Current plan</h2>
          <PlanBadge plan={plan} />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Saved searches</dt>
            <dd className="font-medium text-slate-900">
              {usage.saved_searches}
              {Number.isFinite(limits.savedSearches) && ` / ${limits.savedSearches}`}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Pipeline deals</dt>
            <dd className="font-medium text-slate-900">
              {usage.pipeline_deals}
              {Number.isFinite(limits.pipelineDeals) && ` / ${limits.pipelineDeals}`}
            </dd>
          </div>
        </dl>
        {plan === "free" && (
          <div className="mt-4">
            <UpgradeBanner message="Upgrade to Pro for CSV export and unlimited workflow." />
          </div>
        )}
      </div>

      {canUseWhiteLabel(plan) ? (
        tenant ? (
          <div className="mt-6">
            <TenantBrandingForm tenant={tenant} />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            White-label subdomain not provisioned yet. Email{" "}
            <a href="mailto:hello@auctionmap.in" className="font-medium text-slate-900 hover:underline">
              hello@auctionmap.in
            </a>{" "}
            to set up your branded domain.
          </div>
        )
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-medium text-slate-900">White-label branding</h2>
          <p className="mt-2 text-sm text-slate-500">
            Custom subdomain and branding are available on the white-label plan.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block text-sm font-medium text-slate-900 hover:underline"
          >
            Compare plans →
          </Link>
        </div>
      )}
    </div>
  );
}