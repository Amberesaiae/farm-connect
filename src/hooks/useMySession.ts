import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { getMySession, type MySession } from "@/server/session.functions";

const QUERY_KEY = ["my-session"] as const;

/**
 * Single source of truth for the caller's roles + trust gates.
 * Returns `null` when not authenticated.
 */
export function useMySession() {
  const { isAuthenticated, loading } = useAuth();
  const fn = useServerFn(getMySession);

  const query = useQuery<MySession | null>({
    queryKey: QUERY_KEY,
    queryFn: () => fn(),
    enabled: isAuthenticated && !loading,
    staleTime: 60_000,
  });

  return {
    session: query.data ?? null,
    loading: query.isLoading || loading,
    refresh: query.refetch,
  };
}

/** Imperative invalidator — call after phone verify, role grant, etc. */
export function useInvalidateMySession() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: QUERY_KEY });
}