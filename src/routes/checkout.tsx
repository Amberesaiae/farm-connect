import * as React from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { StickyCTA } from "@/components/StickyCTA";
import { productById } from "@/lib/data";
import { useCart, selectCartSubtotal } from "@/stores/cart-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Farmlink" },
      { name: "description", content: "Review your order summary and complete your purchase." },
      { property: "og:title", content: "Checkout — Farmlink" },
      { property: "og:description", content: "Secure checkout for your fresh farm order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const router = useRouter();
  const [promo, setPromo] = React.useState("");
  const [applied, setApplied] = React.useState(false);
  const lines = useCart((s) => s.lines);
  const subtotal = useCart(selectCartSubtotal);

  const discount = applied && promo.trim().toLowerCase() === "fresh25" ? subtotal * 0.25 : 0;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax;

  return (
    <PhoneFrame>
      <TopBar title="Checkout" />
      <section className="flex-1 px-5 pb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Order Summary
        </h2>
        <ul className="mt-2 space-y-3 rounded-2xl bg-surface-2/70 p-3">
          {lines.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Your cart is empty.
            </li>
          )}
          {lines.map((l) => {
            const p = productById(l.id);
            if (!p) return null;
            return (
              <li key={l.id} className="flex items-center gap-3">
                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {l.qty}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  ${(p.price * l.qty).toFixed(2)}
                </p>
              </li>
            );
          })}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(true);
          }}
          className="mt-5 rounded-2xl bg-surface-2/70 p-3"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <input
              value={promo}
              onChange={(e) => {
                setPromo(e.target.value);
                setApplied(false);
              }}
              placeholder="Promo code (try FRESH25)"
              aria-label="Promo code"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Apply
            </button>
          </div>
          {applied && (
            <p
              className={
                "mt-2 text-[11px] font-medium " +
                (discount > 0 ? "text-success" : "text-destructive")
              }
            >
              {discount > 0 ? "Promo applied — 25% off" : "Invalid promo code"}
            </p>
          )}
        </form>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd>${subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Discount</dt>
            <dd className="text-success">−${discount.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Tax (5%)</dt>
            <dd>${tax.toFixed(2)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold">
            <dt>Total</dt>
            <dd className="text-primary">${total.toFixed(2)}</dd>
          </div>
        </dl>
      </section>

      <StickyCTA
        onClick={() => router.navigate({ to: "/receipt" })}
        disabled={lines.length === 0}
        label="Continue to Payment"
        trailing={`$${total.toFixed(2)}`}
      />
    </PhoneFrame>
  );
}
