import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/data";

type Search = { category?: string };

export const Route = createFileRoute("/freshly-stocked")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Freshly Stocked — Agri Farming" },
      {
        name: "description",
        content: "All freshly stocked produce from local farms — handpicked daily.",
      },
      { property: "og:title", content: "Freshly Stocked — Agri Farming" },
      {
        property: "og:description",
        content: "Browse all freshly stocked items from local farms.",
      },
    ],
  }),
  component: FreshlyStocked,
});

function FreshlyStocked() {
  const { category } = Route.useSearch();
  const items = category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
  return (
    <PhoneFrame>
      <TopBar
        title={category ?? "Freshly Stocked"}
        right={
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-foreground transition-colors hover:bg-muted"
            aria-label="Filter"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        }
      />
      <section className="px-5 pb-8">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No items found in {category}.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </PhoneFrame>
  );
}
