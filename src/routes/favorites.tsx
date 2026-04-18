import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ProductCard";
import { productById } from "@/lib/data";
import { useFavorites } from "@/stores/favorites-store";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "My Favorites — Farmlink" },
      { name: "description", content: "Your saved favorite products." },
      { property: "og:title", content: "My Favorites — Farmlink" },
      { property: "og:description", content: "Saved favorites for quick reordering." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const ids = useFavorites((s) => s.ids);
  const items = ids.map(productById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <PhoneFrame>
      <TopBar title="My Favorites" />
      <section className="flex-1 px-5 pb-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Heart className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm font-semibold">No favorites yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the heart on any product to save it here.
            </p>
            <Link
              to="/freshly-stocked"
              className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Discover products
            </Link>
          </div>
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
