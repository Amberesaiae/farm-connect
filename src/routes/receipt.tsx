import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, CheckCircle2 } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { productById } from "@/lib/data";
import { useCart, selectCartSubtotal } from "@/stores/cart-store";

export const Route = createFileRoute("/receipt")({
  head: () => ({
    meta: [
      { title: "E-Receipt — Farmlink" },
      { name: "description", content: "Your order receipt with itemized totals." },
      { property: "og:title", content: "E-Receipt — Farmlink" },
      { property: "og:description", content: "Download your e-receipt." },
    ],
  }),
  component: Receipt,
});

function Barcode() {
  const bars = Array.from({ length: 48 }, (_, i) => {
    const w = (i * 7) % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
    return { x: i * 4, w };
  });
  return (
    <svg
      viewBox="0 0 200 60"
      className="h-14 w-full"
      role="img"
      aria-label="Order barcode"
    >
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={4} width={b.w} height={48} fill="currentColor" />
      ))}
    </svg>
  );
}

function Receipt() {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart(selectCartSubtotal);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <PhoneFrame>
      <TopBar title="E-Receipt" />
      <section className="flex-1 px-5 pb-10">
        <div className="rounded-3xl bg-surface-2/70 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold">Thank you!</p>
            <p className="text-xs text-muted-foreground">Order ORD-1024 confirmed</p>
          </div>

          <ul className="mt-5 space-y-3 border-t border-dashed border-border pt-4">
            {lines.map((l) => {
              const p = productById(l.id);
              if (!p) return null;
              return (
                <li key={l.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    {p.name} <span className="text-muted-foreground">×{l.qty}</span>
                  </span>
                  <span className="font-semibold">${(p.price * l.qty).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 space-y-1.5 border-t border-dashed border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-5 border-t border-dashed border-border pt-4 text-foreground">
            <Barcode />
            <p className="mt-1 text-center text-[11px] tracking-[0.3em] text-muted-foreground">
              ORD-1024-AGR
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01]"
        >
          <Download className="h-4 w-4" />
          Download E-Receipt
        </button>

        <Link
          to="/orders"
          className="mt-3 flex w-full items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          View My Orders
        </Link>
      </section>
    </PhoneFrame>
  );
}
