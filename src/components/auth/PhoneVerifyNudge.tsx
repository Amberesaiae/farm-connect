import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/useCan";
import { useMySession } from "@/hooks/useMySession";
import { RequirePhoneVerifyModal } from "@/components/auth/RequirePhoneVerifyModal";

/**
 * Slim banner shown to authenticated users whose phone is not yet verified.
 * Renders nothing once the user is verified or while the session is still
 * loading. Lets the user tap once to open the OTP modal.
 */
export function PhoneVerifyNudge() {
  const { session, loading } = useMySession();
  const { why } = useCan("listings.create");
  const [open, setOpen] = useState(false);

  if (loading || !session || session.trust.phone_verified) return null;
  if (why !== "needs_phone") return null;

  return (
    <div className="rounded-2xl border-[1.5px] border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold tracking-tight">
            Verify your phone to unlock contact and posting
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            One-time SMS code. Verified sellers convert ~3× better.
          </p>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => setOpen(true)}>
          Verify phone
        </Button>
      </div>
      <RequirePhoneVerifyModal open={open} onOpenChange={setOpen} />
    </div>
  );
}