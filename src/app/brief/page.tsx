import { fetchWeeklyBrief } from "@/lib/intelligence";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BriefPage() {
  let brief: Record<string, unknown> = {};
  let error: string | null = null;

  try {
    brief = await fetchWeeklyBrief();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load brief";
  }

  const byState = (brief.by_state ?? {}) as Record<string, number>;
  const byRisk = (brief.by_risk ?? {}) as Record<string, number>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Weekly brief</h1>
      <p className="mt-2 text-sm text-slate-600">
        Snapshot of public listing inventory for advisor review.
      </p>

      {error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <BriefStat label="Map-ready listings" value={String(brief.total_public ?? 0)} />
            <BriefStat label="Added (7 days)" value={String(brief.added_7d ?? 0)} />
            <BriefStat label="With price drops" value={String(brief.price_drops ?? 0)} />
          </div>

          <BriefSection title="By state">
            <BriefList data={byState} />
          </BriefSection>

          <BriefSection title="By risk tier">
            <BriefList data={byRisk} />
          </BriefSection>

          <p className="text-xs text-slate-500">
            Generated {formatDate(String(brief.generated_at ?? ""))}
          </p>
        </div>
      )}
    </div>
  );
}

function BriefStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function BriefSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function BriefList({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="text-sm text-slate-500">No data</p>;
  return (
    <ul className="space-y-1 text-sm text-slate-700">
      {entries.map(([k, v]) => (
        <li key={k} className="flex justify-between">
          <span>{k}</span>
          <span className="font-medium">{v}</span>
        </li>
      ))}
    </ul>
  );
}