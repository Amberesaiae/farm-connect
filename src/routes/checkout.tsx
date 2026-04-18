import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { INITIAL_CART, productById } from "@/lib/data";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Agri Farming" },
      { name: "description", content: "Review your order summary and complete your purchase." },
      { property: "og:title", content: "Checkout — Agri Farming" },
      { property: "og:description", content: "Secure checkout for your fresh farm order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const [promo, setPromo] = React.useState("");
  const lines = INITIAL_CART;
  const subtotal = lines.reduce((sum, l) => {
    const p = productById(l.id);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);
  const discount = promo.toLowerCase() === "fresh25" ? subtotal * 0.25 : 0;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax;

  return (
    <PhoneFrame>
      <TopBar title="Checkout" />
      <section className="flex-1 px-5 pb-32">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Order Summary
        </h2>
        <ul className="mt-2 space-y-2 rounded-2xl bg-surface-2/70 p-3">
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

        <div className="mt-5 rounded-2xl bg-surface-2/70 p-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Promo code (try FRESH25)"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Apply
            </button>
          </div>
        </div>

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
          <div className="mt-2 border-t border-border pt-3 flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd className="text-primary">${total.toFixed(2)}</dd>
          </div>
        </dl>
      </section>

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="pointer-events-auto mx-auto max-w-[440px] bg-gradient-to-t from-background via-background to-background/0 px-5 pb-5 pt-6">
          <Link
            to="/receipt"
            className="flex w-full items-center justify-center rounded-full bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
          >
            Continue
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
