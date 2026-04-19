import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { useServerFn } from "@tanstack/react-start";
import { logContactTap } from "@/server/listings.functions";
import { whatsappLink } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";

interface WhatsAppCTAProps {
  listingId: string;
  listingTitle: string;
  sellerWhatsappE164: string | null;
}

export function WhatsAppCTA({ listingId, listingTitle, sellerWhatsappE164 }: WhatsAppCTAProps) {
  const [busy, setBusy] = useState(false);
  const logTap = useServerFn(logContactTap);
  const { isAuthenticated } = useAuth();

  if (!sellerWhatsappE164) {
    return (
      <div className="rounded-xl bg-surface p-4 text-center text-sm text-muted-foreground">
        Seller has not added a WhatsApp number yet.
      </div>
    );
  }

  const message = `Hi! I'm interested in your Farmlink listing: ${listingTitle}. Is it still available?`;
  const href = whatsappLink(sellerWhatsappE164, message);

  const onClick = async () => {
    setBusy(true);
    try {
      await logTap({ data: { listingId } });
    } catch {
      // non-blocking — we still open WhatsApp
    } finally {
      setBusy(false);
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "#25D366" }}
    >
      <WhatsAppIcon size={20} />
      {isAuthenticated ? "Contact on WhatsApp" : "Contact seller on WhatsApp"}
    </button>
  );
}
