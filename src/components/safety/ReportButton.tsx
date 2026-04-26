import { useState } from "react";
import { Flag } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { RequireSignInModal } from "@/components/auth/RequireSignInModal";
import { submitReport } from "@/server/reports.functions";
import { parseAppError } from "@/integrations/supabase/errors";

type Kind = "listing" | "hatchery" | "agro_store" | "service_profile" | "profile";

const REASONS: { value: string; label: string }[] = [
  { value: "scam", label: "Looks like a scam" },
  { value: "wrong_category", label: "Wrong category" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "prohibited", label: "Prohibited item" },
  { value: "offensive", label: "Offensive or harmful" },
  { value: "other", label: "Other" },
];

interface Props {
  targetKind: Kind;
  targetId: string;
  variant?: "ghost" | "outline";
  className?: string;
}

/**
 * Visitor-facing "report" button. Opens a small dialog that calls the
 * `report_content` RPC. Anonymous users get nudged to sign in first.
 */
export function ReportButton({ targetKind, targetId, variant = "ghost", className }: Props) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const fn = useServerFn(submitReport);

  const onTriggerClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setSignInOpen(true);
    }
  };

  const submit = async () => {
    if (!reason) return;
    setBusy(true);
    try {
      await fn({ data: { kind: targetKind, id: targetId, reason, details: details || null } });
      toast.success("Thanks — our team will review this.");
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (e) {
      const err = await parseAppError(e);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size="sm"
            className={className}
            onClick={onTriggerClick}
          >
            <Flag className="mr-1.5 h-4 w-4" />
            Report
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report this</DialogTitle>
            <DialogDescription>
              Help us keep Farmlink safe. Reports stay anonymous to other users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue placeholder="Pick a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-details">Details (optional)</Label>
              <Textarea
                id="report-details"
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What looked wrong?"
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={busy || !reason}>
              {busy ? "Sending…" : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RequireSignInModal
        open={signInOpen}
        onOpenChange={setSignInOpen}
        title="Sign in to report"
        description="Create a free account to flag suspicious or unsafe content."
      />
    </>
  );
}