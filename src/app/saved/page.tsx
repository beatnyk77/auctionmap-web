import { SavedSearchesList } from "@/components/workflow/SavedSearchesList";
import { fetchSavedSearches } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const searches = await fetchSavedSearches();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Saved searches</h1>
        <p className="mt-1 text-sm text-slate-500">
          Re-run filters or export results as CSV.
        </p>
      </div>

      <SavedSearchesList initialSearches={searches} />
    </div>
  );
}