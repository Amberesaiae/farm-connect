import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRightIcon, SearchIcon, CheckIcon } from "@/components/icons";
import { DisplayAccent } from "@/components/shared/DisplayAccent";
import heroBasket from "@/assets/hero-basket.jpg";

const QUICK_CHIPS = [
  { label: "Cattle", category: "cattle" },
  { label: "Goats", category: "goats" },
  { label: "Sheep", category: "sheep" },
  { label: "Poultry", category: "poultry" },
  { label: "Hatcheries", to: "/hatcheries" as const },
  { label: "Vets & Services", to: "/services" as const },
];

const TRUST = [
  "Verified farmers",
  "WhatsApp direct",
  "16 regions covered",
];

/**
 * Agora-style bright editorial hero. No carousel — one decisive headline,
 * a prominent search pill, and a lifestyle portrait on the right.
 */
export function HomeHero() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/listings", search: { q: q.trim() || undefined } as never });
  };

  return (
    <section
      aria-label="farmlink marketplace"
      className="relative overflow-hidden rounded-[28px] border border-border bg-surface-cream"
    >
      <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
        {/* Left: copy + search + chips */}
        <div className="flex flex-col gap-7 p-7 sm:p-10 md:p-14">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            Ghana's farmer-direct marketplace
          </span>

          <h1 className="font-display text-[40px] font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-[52px] md:text-[68px] lg:text-[78px]">
            Livestock,{" "}
            <DisplayAccent>direct</DisplayAccent>{" "}
            from the farm that raised them.
          </h1>

          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-[17px]">
            Cattle, goats, sheep, poultry, feed and vets — sourced from
            verified farmers across all 16 regions. No middlemen, no markup,
            one WhatsApp away.
          </p>

          {/* Search pill */}
          <form
            onSubmit={onSearch}
            className="flex w-full max-w-xl items-center gap-1.5 rounded-full border border-border bg-card p-1.5 shadow-soft focus-within:border-primary"
          >
            <div className="flex flex-1 items-center gap-2 px-4">
              <SearchIcon size={18} className="text-muted-foreground" />
              <label htmlFor="hero-search" className="sr-only">
                Search livestock, breeds, or regions
              </label>
              <input
                id="hero-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Sanga, Boer, layers, Tamale…"
                className="h-12 w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[14px] font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Search
              <ArrowRightIcon size={14} />
            </button>
          </form>

          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Popular
            </span>
            {QUICK_CHIPS.map((c) =>
              "to" in c ? (
                <Link
                  key={c.label}
                  to={c.to}
                  className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-[12.5px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {c.label}
                </Link>
              ) : (
                <Link
                  key={c.label}
                  to="/listings"
                  search={{ topCategory: "livestock", category: c.category } as never}
                  className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-[12.5px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {c.label}
                </Link>
              ),
            )}
          </div>

          {/* Trust strip */}
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5">
            {TRUST.map((t) => (
              <li
                key={t}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground/80"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <CheckIcon size={10} strokeWidth={3} className="text-primary-foreground" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: lifestyle portrait inside cream basket */}
        <div className="relative min-h-[320px] md:min-h-full">
          <div className="absolute inset-4 overflow-hidden rounded-[24px] md:inset-6">
            <img
              src={heroBasket}
              alt="Ghanaian farmer holding a young goat kid in warm light"
              width={1024}
              height={1024}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
            {/* Floating price card */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl bg-card/95 p-3 shadow-soft backdrop-blur md:left-6 md:right-auto md:max-w-[260px]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-mint text-[16px]">
                  🐐
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Ashanti · today
                  </p>
                  <p className="font-display text-[14px] font-bold text-foreground">
                    Boer kid · 4 months
                  </p>
                </div>
              </div>
              <span className="font-mono text-[15px] font-bold text-primary">GH₵ 380</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
