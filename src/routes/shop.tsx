import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { CategoryTile } from "@/components/CategoryTile";
import { CATEGORIES } from "@/lib/data";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop by Category — Agri Farming" },
      {
        name: "description",
        content:
          "Shop by category: vegetables, fruits, grains, dairy, spices, oils and more.",
      },
      { property: "og:title", content: "Shop by Category — Agri Farming" },
      {
        property: "og:description",
        content: "Browse all farm categories: produce, grains, dairy, spices and more.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  return (
    <PhoneFrame withBottomNav>
      <header className="px-5 pt-6">
        <h1 className="text-center text-base font-semibold tracking-tight">Shop</h1>
        <div className="mt-4">
          <label className="flex items-center gap-2 rounded-full bg-surface-2 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search categories…"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </label>
        </div>
      </header>

      <section className="mt-5 px-5">
        <div className="grid grid-cols-3 gap-4">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
      </section>

      <div className="h-10" />
      <BottomTabBar />
    </PhoneFrame>
  );
}
