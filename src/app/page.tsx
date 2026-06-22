import { Suspense } from "react";
import { MapExplorer } from "@/components/map/MapExplorer";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { getSessionUser } from "@/lib/auth";
import { fetchAllListings } from "@/lib/listings";
import type { ListingPublic } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialListings: ListingPublic[] = [];
  let setupError: string | null = null;

  const user = await getSessionUser();

  try {
    initialListings = await fetchAllListings();
  } catch (e) {
    setupError =
      e instanceof Error ? e.message : "Could not connect to Supabase";
  }

  if (setupError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-amber-900">Setup required</h2>
          <p className="mt-2 text-sm text-amber-800">{setupError}</p>
          <p className="mt-4 text-xs text-amber-700">
            Copy <code className="rounded bg-white px-1">.env.local.example</code> to{" "}
            <code className="rounded bg-white px-1">.env.local</code> and add your Supabase keys.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapExplorer initialListings={initialListings} isAuthenticated={!!user} />
    </Suspense>
  );
}