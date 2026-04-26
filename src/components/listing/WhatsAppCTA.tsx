import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { useServerFn } from "@tanstack/react-start";
import { revealContact } from "@/server/contact.functions";
import { whatsappLink } from "@/lib/format";
import { useCan } from "@/hooks/useCan";
import { parseAppError } from "@/integrations/supabase/errors";
import { toast } from "sonner";
import { RequireSignInModal } from "@/components/auth/RequireSignInModal";
import { RequirePhoneVerifyModal } from "@/components/auth/RequirePhoneVerifyModal";

interface WhatsAppCTAProps {
  listingId: string;
  listingTitle: string;
  /** Optional masked hint (e.g. "024 ••• ••87"). Not required. */
  maskedHint?: string | null;
  /**
   * Legacy prop: if present, used only as a fallback when the reveal
   * RPC is unavailable. New code should let the server resolve the number.
   */
  sellerWhatsappE164?: string | null;
}

/**
 * Contact-seller CTA. Resolves the seller's WhatsApp number through the
 * `reveal_contact` RPC instead of relying on a number embedded in the page —
 * so anonymous and unverified visitors never see raw numbers.
 */
export function WhatsAppCTA({ listingId, listingTitle, maskedHint, sellerWhatsappE164 }: WhatsAppCTAProps) {
  const [busy, setBusy] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const reveal = useServerFn(revealContact);
  const { can, why } = useCan("listings.contact_reveal");

  const message = `Hi! I'm interested in your Farmlink listing: ${listingTitle}. Is it still available?`;

  const openWhatsApp = (number: string) => {
    window.open(whatsappLink(number, message), "_blank", "noopener,noreferrer");
  };

  const onClick = async () => {
    if (why === "needs_login") {
      setSignInOpen(true);
      return;
    }
    if (why === "needs_phone") {
      setVerifyOpen(true);
      return;
    }
    if (!can) {
      toast.error("You don't have permission to contact this seller");
      return;
    }
    setBusy(true);
    try {
      const { whatsapp_e164 } = await reveal({ data: { listingId } });
      openWhatsApp(whatsapp_e164);
    } catch (e) {
      const err = await parseAppError(e);
      if (err.requires === "phone_verify") {
        setVerifyOpen(true);
      } else if (err.code === "NOT_FOUND" && sellerWhatsappE164) {
        // Legacy fallback — seller exposed a number directly
        openWhatsApp(sellerWhatsappE164);
      } else {
        toast.error(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const label =
    why === "needs_login"
      ? "Sign in to contact seller"
      : why === "needs_phone"
        ? "Verify phone to contact"
        : busy
          ? "Opening WhatsApp…"
          : "Contact on WhatsApp";

  return (
    <>
      <button
        onClick={onClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "#25D366" }}
      >
        <WhatsAppIcon size={20} />
        {label}
        {maskedHint && why !== "ok" ? (
          <span className="ml-2 font-mono text-xs opacity-80">{maskedHint}</span>
        ) : null}
      </button>
      <RequireSignInModal
        open={signInOpen}
        onOpenChange={setSignInOpen}
        title="Sign in to contact seller"
        description="Create a free account to message sellers on WhatsApp."
      />
      <RequirePhoneVerifyModal
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        onVerified={() => {
          // Re-trigger the reveal flow after verification
          void onClick();
        }}
      />
    </>
  );
}
