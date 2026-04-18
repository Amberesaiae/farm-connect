import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { MARKET_MOVES, productById } from "@/lib/data";

export const Route = createFileRoute("/market-moves")({
  head: () => ({
    meta: [
      { title: "Top Market Moves — Agri Farming" },
      {
        name: "description",
        content: "Track the latest agricultural market price movements across produce and grains.",
      },
      { property: "og:title", content: "Top Market Moves — Agri Farming" },
      {
        property: "og:description",
        content: "Daily updates on agricultural commodity prices and market moves.",
      },
    ],
  }),
  component: MarketMoves,
});

function MarketMoves() {
  return (
    <PhoneFrame>
      <TopBar title="Top Market Moves" />
      <section className="px-5 pb-8">
        <ul className="space-y-2">
          {MARKET_MOVES.map((m) => {
            const p = productById(m.id);
            if (!p) return null;
            const up = m.change >= 0;
            return (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-2xl bg-surface-2/70 p-3"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${p.price.toFixed(2)}</p>
                  <p
                    className={
                      "mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold " +
                      (up ? "text-success" : "text-destructive")
                    }
                  >
                    {up ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {up ? "+" : ""}
                    {m.change.toFixed(1)}%
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </PhoneFrame>
  );
}
