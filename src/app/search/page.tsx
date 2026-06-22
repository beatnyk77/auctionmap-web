import { SearchExplorer } from "@/components/search/SearchExplorer";
import { getSessionUser } from "@/lib/auth";
import { fetchAllListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const [initialListings, user] = await Promise.all([
    fetchAllListings().catch(() => []),
    getSessionUser(),
  ]);
  return (
    <SearchExplorer
      initialListings={initialListings}
      isAuthenticated={!!user}
    />
  );
}