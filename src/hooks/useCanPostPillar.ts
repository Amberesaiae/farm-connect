import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { checkCanPostPillar, type PillarPostCheck } from "@/server/quotas.functions";

/**
 * Pillar-aware capability check. Returns the gate code so the caller can pick
 * the right CTA (phone-verify, id-verify, complete licence, or just post).
 */
export function useCanPostPillar(pillar: string | null | undefined) {
  const { isAuthenticated, loading } = useAuth();
  const fn = useServerFn(checkCanPostPillar);

  const q = useQuery<PillarPostCheck>({
    queryKey: ["can-post-pillar", pillar ?? ""],
    queryFn: () => fn({ data: { pillar: pillar! } }),
    enabled: !!pillar && isAuthenticated && !loading,
    staleTime: 30_000,
  });

  return { check: q.data, loading: q.isLoading || loading };
}