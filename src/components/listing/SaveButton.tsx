import { Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  listingId: string;
  initialSaved: boolean;
  variant?: "icon" | "full" | "square";
}

export function SaveButton({ listingId, initialSaved, variant = "icon" }: SaveButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: `/listings/${listingId}` } as never });
      return;
    }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const userId = u.user?.id;
    if (!userId) {
      setBusy(false);
      return;
    }
    if (saved) {
      const { error } = await supabase
        .from("saved_listings")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);
      if (error) toast.error("Couldn't unsave");
      else setSaved(false);
    } else {
      const { error } = await supabase
        .from("saved_listings")
        .insert({ user_id: userId, listing_id: listingId });
      if (error) toast.error("Couldn't save");
      else setSaved(true);
    }
    setBusy(false);
  };

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors",
          saved
            ? "border-primary bg-primary-soft text-primary"
            : "border-border bg-background hover:bg-surface",
        )}
      >
        <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        {saved ? "Saved" : "Save listing"}
      </button>
    );
  }

  if (variant === "square") {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        aria-label={saved ? "Unsave" : "Save"}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background transition-colors",
          saved ? "border-primary text-primary" : "border-border text-foreground",
        )}
      >
        <Heart className={cn("h-5 w-5", saved && "fill-current")} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Unsave" : "Save"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border bg-background/90 backdrop-blur transition-colors",
        saved ? "border-primary text-primary" : "border-border text-foreground",
      )}
    >
      <Heart className={cn("h-5 w-5", saved && "fill-current")} />
    </button>
  );
}
