import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  redirectTo?: string;
}

/** Prompts an anonymous visitor to sign in to perform an action. */
export function RequireSignInModal({
  open,
  onOpenChange,
  title = "Sign in to continue",
  description = "Create a free account or sign in to contact sellers, save listings, and post your own.",
  redirectTo,
}: Props) {
  const target =
    redirectTo ??
    (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:flex-col sm:items-stretch">
          <Button asChild className="rounded-full">
            <Link to="/login" search={{ redirect: target } as never}>
              Sign in
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}