import { Link } from "@tanstack/react-router";
import { ShieldAlert, FileBadge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanPostPillar } from "@/hooks/useCanPostPillar";

/**
 * Renders an inline alert when the active pillar requires a business licence
 * but the seller hasn't completed (or hasn't been approved for) a vendor
 * store yet. Veterinary / agromed is the canonical case in Ghana.
 */
export function LicenceRequiredNudge({ pillar }: { pillar: string }) {
  const { check, loading } = useCanPostPillar(pillar);
  if (loading || !check || check.ok) return null;

  if (check.code === "BUSINESS_LICENCE_REQUIRED") {
    return (
      <div className="rounded-2xl border-[1.5px] border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-100">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-extrabold tracking-tight">
              This category needs a registered vendor store
            </p>
            <p className="mt-0.5 text-xs leading-relaxed opacity-90">
              Veterinary and pharma listings can only be posted by approved
              vendors with a Veterinary Services Directorate (VSD) licence on
              file. Open a vendor store and upload your licence to get approved.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-full">
                <Link to="/dashboard/store/agro/onboarding">
                  <FileBadge className="mr-1.5 h-3.5 w-3.5" />
                  Open a vendor store
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (check.code === "ID_VERIFICATION_REQUIRED") {
    return (
      <div className="rounded-2xl border-[1.5px] border-primary/30 bg-primary/5 p-4 text-foreground">
        <p className="font-display text-sm font-extrabold tracking-tight">
          Verify your Ghana Card to continue
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          This category requires an ID-verified seller.
        </p>
        <Button asChild size="sm" className="mt-2 rounded-full">
          <Link to="/dashboard/verification">Verify ID</Link>
        </Button>
      </div>
    );
  }

  return null;
}