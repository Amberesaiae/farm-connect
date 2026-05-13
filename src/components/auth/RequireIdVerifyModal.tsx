import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/**
 * Lightweight gate modal shown when a server function returns
 * `ID_VERIFICATION_REQUIRED`. Submission UX lives on
 * `/dashboard/verification` — this modal explains why and links there.
 */
export function RequireIdVerifyModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Verify your Ghana Card</DialogTitle>
          <DialogDescription className="text-center">
            This action requires an ID-verified seller. Upload a clear photo of
            your Ghana Card — we usually approve within a few hours.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:flex-col sm:items-stretch">
          <Button asChild className="rounded-full">
            <Link to="/dashboard/verification" onClick={() => onOpenChange(false)}>
              Start ID verification
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}