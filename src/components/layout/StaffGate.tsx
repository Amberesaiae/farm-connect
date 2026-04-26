import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useMySession } from "@/hooks/useMySession";

/**
 * Staff (admin OR moderator) route gate. Mirrors `requireAnyRole(['admin','moderator'])`
 * on the server so moderation pages don't surface a flash of protected content.
 */
export function StaffGate({ children }: { children: ReactNode }) {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { session, loading: sessLoading } = useMySession();
  const navigate = useNavigate();

  const loading = authLoading || (isAuthenticated && sessLoading);
  const isStaff = !!session?.roles.some((r) => r === "admin" || r === "moderator");

  useEffect(() => {
    if (!loading && !isStaff) {
      navigate({ to: "/listings", replace: true });
    }
  }, [loading, isStaff, navigate]);

  if (loading || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking permissions…
      </div>
    );
  }
  return <>{children}</>;
}