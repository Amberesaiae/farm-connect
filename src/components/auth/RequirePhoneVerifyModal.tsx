import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPhoneOtp, verifyPhoneOtp } from "@/server/auth-otp.functions";
import { useInvalidateMySession } from "@/hooks/useMySession";
import { parseAppError } from "@/integrations/supabase/errors";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called once the phone is verified successfully. */
  onVerified?: () => void;
}

/**
 * Two-step OTP modal: collect phone -> request code -> verify.
 * On success the SQL trigger flips `phone_verified=true` and we
 * invalidate the session cache so `useCan` updates immediately.
 */
export function RequirePhoneVerifyModal({ open, onOpenChange, onVerified }: Props) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const sendFn = useServerFn(sendPhoneOtp);
  const verifyFn = useServerFn(verifyPhoneOtp);
  const invalidate = useInvalidateMySession();

  const reset = () => {
    setStep("phone");
    setPhone("");
    setCode("");
    setBusy(false);
  };

  const requestCode = async () => {
    if (!phone.trim()) return;
    setBusy(true);
    try {
      await sendFn({ data: { phone } });
      toast.success("Code sent", { description: `Check ${phone} for a 6-digit code.` });
      setStep("code");
    } catch (e) {
      const err = await parseAppError(e);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!code.trim()) return;
    setBusy(true);
    try {
      await verifyFn({ data: { phone, code } });
      toast.success("Phone verified");
      await invalidate();
      onVerified?.();
      reset();
      onOpenChange(false);
    } catch (e) {
      const err = await parseAppError(e);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Verify your phone</DialogTitle>
          <DialogDescription>
            We send a one-time code to confirm your number. This unlocks contacting sellers and posting listings.
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="otp-phone">Phone number</Label>
              <Input
                id="otp-phone"
                inputMode="tel"
                placeholder="+233 24 400 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
              />
              <p className="mt-1 text-xs text-muted-foreground">Use full international format (E.164).</p>
            </div>
            <DialogFooter className="gap-2 sm:flex-col sm:items-stretch">
              <Button onClick={requestCode} disabled={busy} className="rounded-full">
                {busy ? "Sending…" : "Send code"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="otp-code">Enter the 6-digit code</Label>
              <Input
                id="otp-code"
                inputMode="numeric"
                maxLength={8}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:flex-col sm:items-stretch">
              <Button onClick={verify} disabled={busy || code.length < 4} className="rounded-full">
                {busy ? "Verifying…" : "Verify phone"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep("phone")}
                className="rounded-full"
                disabled={busy}
              >
                Use a different number
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}