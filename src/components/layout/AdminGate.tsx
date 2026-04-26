import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useMySession } from "@/hooks/useMySession";

/**
 * Admins-only route gate. Reads from the cached `useMySession` so it stays
 * consistent with the server-side `requireRole('admin')` middleware.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { session, loading: sessLoading } = useMySession();
  const navigate = useNavigate();

  const loading = authLoading || (isAuthenticated && sessLoading);
  const isAdmin = !!session?.roles.includes("admin");

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/listings", replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking permissions…
      </div>
    );
  }
  return <>{children}</>;
}