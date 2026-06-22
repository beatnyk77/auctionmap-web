import { SearchExplorer } from "@/components/search/SearchExplorer";
import { getSessionUser } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/billing";
import { isProOrAbove } from "@/lib/plans";
import { fetchAllListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const [initialListings, user] = await Promise.all([
    fetchAllListings().catch(() => []),
    getSessionUser(),
  ]);

  let isPro = false;
  if (user) {
    const profile = await fetchUserProfile(user.id);
    isPro = isProOrAbove(profile?.plan ?? "free");
  }

  return (
    <SearchExplorer
      initialListings={initialListings}
      isAuthenticated={!!user}
      isPro={isPro}
    />
  );
}