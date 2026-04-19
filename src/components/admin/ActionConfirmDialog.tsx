import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  destructive?: boolean;
  reasonRequired?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
}

/**
 * Reason-required destructive action shell. Always captures a reason
 * (mandatory by default) so that admin actions are auditable.
 */
export function ActionConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  destructive,
  reasonRequired = true,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (reasonRequired && !reason.trim()) return;
    setBusy(true);
    try {
      await onConfirm(reason.trim());
      setOpen(false);
      setReason("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rzn">
              Reason {reasonRequired ? "*" : <span className="text-muted-foreground">(optional)</span>}
            </Label>
            <Textarea
              id="rzn"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Logged for audit. Visible to other admins."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant={destructive ? "destructive" : "default"}
              onClick={submit}
              disabled={busy || (reasonRequired && !reason.trim())}
            >
              {busy ? "Working…" : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
