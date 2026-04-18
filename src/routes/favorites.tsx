import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ProductCard";
import { FAVORITES, productById } from "@/lib/data";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "My Favorites — Agri Farming" },
      { name: "description", content: "Your saved favorite products." },
      { property: "og:title", content: "My Favorites — Agri Farming" },
      { property: "og:description", content: "Saved favorites for quick reordering." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const items = FAVORITES.map(productById).filter(
    (p): p is NonNullable<ReturnType<typeof productById>> => Boolean(p),
  );
  return (
    <PhoneFrame>
      <TopBar title="My Favorites" />
      <section className="px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </PhoneFrame>
  );
}
