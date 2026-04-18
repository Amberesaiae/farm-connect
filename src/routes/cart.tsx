import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { TopBar } from "@/components/TopBar";
import { QtyStepper } from "@/components/QtyStepper";
import { INITIAL_CART, productById } from "@/lib/data";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "My Cart — Agri Farming" },
      { name: "description", content: "Review your selected fresh items before checkout." },
      { property: "og:title", content: "My Cart — Agri Farming" },
      { property: "og:description", content: "Your cart of fresh farm picks." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const [lines, setLines] = React.useState(INITIAL_CART);

  const subtotal = lines.reduce((sum, l) => {
    const p = productById(l.id);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);

  const update = (id: string, qty: number) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)));
  const remove = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  return (
    <PhoneFrame withBottomNav>
      <TopBar title="My Cart" />

      <section className="flex-1 px-5 pb-32">
        {lines.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Link
              to="/freshly-stocked"
              className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {lines.map((l) => {
              const p = productById(l.id);
              if (!p) return null;
              return (
                <li key={l.id} className="flex items-center gap-3 rounded-2xl bg-surface-2/70 p-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      ${(p.price * l.qty).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => remove(l.id)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <QtyStepper value={l.qty} onChange={(n) => update(l.id, n)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {lines.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20">
          <div className="pointer-events-auto mx-auto max-w-[440px] px-5">
            <Link
              to="/checkout"
              className="flex w-full items-center justify-between rounded-full bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
            >
              <span>Checkout</span>
              <span>${subtotal.toFixed(2)}</span>
            </Link>
          </div>
        </div>
      )}

      <BottomTabBar />
    </PhoneFrame>
  );
}
