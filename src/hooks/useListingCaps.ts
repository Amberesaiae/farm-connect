import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { getMyListingCaps, type ListingCaps } from "@/server/quotas.functions";

/** Active-listing cap + current count for the signed-in seller. */
export function useListingCaps() {
  const { isAuthenticated, loading } = useAuth();
  const fn = useServerFn(getMyListingCaps);

  const q = useQuery<ListingCaps>({
    queryKey: ["listing-caps"],
    queryFn: () => fn(),
    enabled: isAuthenticated && !loading,
    staleTime: 30_000,
  });

  return { caps: q.data, loading: q.isLoading || loading, refresh: q.refetch };
}