import { SearchExplorer } from "@/components/search/SearchExplorer";
import { fetchAllListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const initialListings = await fetchAllListings().catch(() => []);
  return <SearchExplorer initialListings={initialListings} />;
}