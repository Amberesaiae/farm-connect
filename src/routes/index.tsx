import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Search, ArrowRight, TrendingUp, TrendingDown, Leaf } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, MARKET_MOVES, productById } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Agri Farming" },
      {
        name: "description",
        content:
          "Browse fresh, freshly stocked produce from local farmers. Track top market moves and shop directly.",
      },
      { property: "og:title", content: "Home — Agri Farming" },
      {
        property: "og:description",
        content: "Fresh produce from local farmers, freshly stocked daily.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = PRODUCTS.slice(0, 4);
  const marketPreview = MARKET_MOVES.slice(0, 3);

  return (
    <PhoneFrame withBottomNav>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <p className="text-lg font-bold tracking-tight text-foreground">
            farm<span className="text-primary">link</span>
          </p>
        </div>
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-foreground transition-colors hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
      </header>

      {/* Search */}
      <div className="mt-5 px-5">
        <label className="flex items-center gap-2 rounded-full bg-surface-2 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search vegetables, fruits, grains…"
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
      </div>

      {/* Promo */}
      <div className="mt-5 px-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.55_0.18_150)] p-5 text-primary-foreground">
          <div className="relative z-10 max-w-[60%]">
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
              Limited offer
            </p>
            <h3 className="mt-1 text-xl font-bold leading-tight">
              Fresh Sales,
              <br />
              Fast Profits
            </h3>
            <p className="mt-1 text-sm opacity-90">25% Off on first order</p>
            <Link
              to="/freshly-stocked"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-background px-3.5 py-2 text-xs font-semibold text-primary transition-transform hover:scale-105"
            >
              Start Shopping <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=400&q=80"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-2 h-44 w-44 rounded-full object-cover opacity-90"
          />
          <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/10" />
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
        </div>
      </div>

      {/* Freshly Stocked */}
      <section className="mt-6 px-5">
        <SectionHeader title="Freshly Stocked" viewAllTo="/freshly-stocked" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Market moves */}
      <section className="mt-6 px-5">
        <SectionHeader title="Top Market Moves" viewAllTo="/market-moves" />
        <ul className="mt-3 space-y-2">
          {marketPreview.map((m) => {
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
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${p.price.toFixed(2)}</p>
                  <p
                    className={
                      "inline-flex items-center gap-0.5 text-[11px] font-semibold " +
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

      <div className="h-6" />
      <BottomTabBar />
    </PhoneFrame>
  );
}
