import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "@/components/icons";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { GHANA_REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Suggestion =
  | { kind: "category"; pillar: string; slug: string; label: string }
  | { kind: "breed"; slug: string; label: string; categoryId: string }
  | { kind: "region"; value: string }
  | { kind: "query"; value: string };

/**
 * Search-first marketplace input — primary discovery affordance on the
 * homepage. Autosuggests across taxonomy categories, breeds, and Ghana
 * regions; falls back to a free-text `q=` search.
 *
 * Pattern follows NN/G + Baymard recommendations: search > category tiles
 * on classifieds, particularly on mobile where carousel-blindness kills
 * tile-strip discovery.
 */
export function MarketSearch({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  const navigate = useNavigate();
  const { taxonomy } = useTaxonomy();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = value.trim().toLowerCase();
    const out: Suggestion[] = [];

    if (q.length === 0) {
      // Empty-state: top categories from the first marketplace pillar.
      const cats = taxonomy.categoriesFor(taxonomy.marketplacePillars[0]?.slug).slice(0, 6);
      for (const c of cats) {
        out.push({ kind: "category", pillar: c.pillarSlug, slug: c.slug, label: c.label });
      }
      return out;
    }

    for (const c of taxonomy.categories) {
      if (c.label.toLowerCase().includes(q)) {
        out.push({ kind: "category", pillar: c.pillarSlug, slug: c.slug, label: c.label });
      }
      if (out.length >= 4) break;
    }
    for (const b of taxonomy.breeds) {
      if (b.labelEn.toLowerCase().includes(q)) {
        out.push({ kind: "breed", slug: b.slug, label: b.labelEn, categoryId: b.categoryId });
      }
      if (out.filter((s) => s.kind === "breed").length >= 4) break;
    }
    for (const r of GHANA_REGIONS) {
      if (r.toLowerCase().includes(q)) {
        out.push({ kind: "region", value: r });
      }
      if (out.filter((s) => s.kind === "region").length >= 3) break;
    }
    out.push({ kind: "query", value: value.trim() });
    return out.slice(0, 10);
  }, [value, taxonomy]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const go = (s: Suggestion) => {
    setOpen(false);
    if (s.kind === "category") {
      // Resolve the pillar's top-level slug to set both `topCategory` and `category`.
      navigate({
        to: "/listings",
        search: { topCategory: s.pillar, category: s.slug } as never,
      });
    } else if (s.kind === "breed") {
      const cat = taxonomy.categories.find((c) => c.id === s.categoryId);
      navigate({
        to: "/listings",
        search: {
          topCategory: cat?.pillarSlug,
          category: cat?.slug,
          q: s.label,
        } as never,
      });
    } else if (s.kind === "region") {
      navigate({ to: "/listings", search: { region: s.value } as never });
    } else {
      navigate({ to: "/listings", search: { q: s.value || undefined } as never });
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[active]) go(suggestions[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const isHero = variant === "hero";

  return (
    <div ref={wrapRef} className={cn("relative", isHero ? "w-full max-w-xl" : "w-full")}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl bg-white text-foreground shadow-[0_8px_28px_rgba(0,0,0,0.18)] ring-1 ring-black/5",
          isHero ? "p-2" : "p-1.5",
        )}
      >
        <div className="flex flex-1 items-center gap-2 px-3">
          <SearchIcon size={18} className="text-muted-foreground" />
          <input
            type="search"
            inputMode="search"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            placeholder="Search breeds, categories, regions…"
            className={cn(
              "w-full bg-transparent outline-none placeholder:text-muted-foreground/70",
              isHero ? "py-3 text-[15px]" : "py-2 text-[14px]",
            )}
            aria-label="Search the marketplace"
          />
        </div>
        <button
          type="button"
          onClick={() => go({ kind: "query", value: value.trim() })}
          className={cn(
            "rounded-xl bg-primary font-bold text-primary-foreground transition-transform hover:-translate-y-0.5",
            isHero ? "px-5 py-2.5 text-[14px]" : "px-4 py-2 text-[13px]",
          )}
        >
          Search
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          {value.trim().length === 0 && (
            <p className="px-3 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Popular categories
            </p>
          )}
          <ul className="space-y-0.5">
            {suggestions.map((s, i) => (
              <li key={`${s.kind}:${"value" in s ? s.value : s.slug}:${i}`}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(s)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors",
                    active === i ? "bg-primary-soft text-primary" : "hover:bg-surface",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <SuggestionIcon kind={s.kind} />
                    <span className="font-medium">
                      {s.kind === "query"
                        ? s.value
                          ? `Search “${s.value}”`
                          : "Browse all listings"
                        : s.kind === "region"
                          ? s.value
                          : s.label}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {s.kind}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SuggestionIcon({ kind }: { kind: Suggestion["kind"] }) {
  const sym =
    kind === "category" ? "▦" : kind === "breed" ? "✦" : kind === "region" ? "◉" : "↪";
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[12px] font-bold text-primary">
      {sym}
    </span>
  );
}
