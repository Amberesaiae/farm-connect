import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { ORDERS, productById } from "@/lib/data";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Agri Farming" },
      { name: "description", content: "View your past and pending orders." },
      { property: "og:title", content: "My Orders — Agri Farming" },
      { property: "og:description", content: "Order history and status." },
    ],
  }),
  component: Orders,
});

function Orders() {
  return (
    <PhoneFrame>
      <TopBar title="My Orders" />
      <section className="px-5 pb-8">
        <ul className="space-y-3">
          {ORDERS.map((o) => {
            const first = productById(o.items[0]?.id);
            return (
              <li key={o.id} className="rounded-2xl bg-surface-2/70 p-3">
                <div className="flex items-center gap-3">
                  {first && (
                    <img
                      src={first.image}
                      alt={first.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{o.id}</p>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{o.date}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {o.items.length} item{o.items.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-bold text-primary">${o.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </PhoneFrame>
  );
}
