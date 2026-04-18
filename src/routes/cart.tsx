import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { TopBar } from "@/components/TopBar";
import { QtyStepper } from "@/components/QtyStepper";
import { StickyCTA } from "@/components/StickyCTA";
import { productById } from "@/lib/data";
import { useCart, selectCartSubtotal } from "@/stores/cart-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "My Cart — Farmlink" },
      { name: "description", content: "Review your selected fresh items before checkout." },
      { property: "og:title", content: "My Cart — Farmlink" },
      { property: "og:description", content: "Your cart of fresh farm picks." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(selectCartSubtotal);

  return (
    <PhoneFrame>
      <TopBar title="My Cart" hideBack />

      <section className="flex-1 px-5 pb-6">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm font-semibold">Your cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse fresh picks and add a few to get started.
            </p>
            <Link
              to="/freshly-stocked"
              className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
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
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-2xl bg-surface-2/70 p-3"
                >
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="shrink-0"
                    aria-label={`View ${p.name}`}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  </Link>
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
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <QtyStepper value={l.qty} onChange={(n) => setQty(l.id, n)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {lines.length > 0 && (
        <StickyCTA to="/checkout" label="Checkout" trailing={`$${subtotal.toFixed(2)}`} />
      )}

      <BottomTabBar />
    </PhoneFrame>
  );
}
