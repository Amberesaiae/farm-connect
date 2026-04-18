import * as React from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { Heart, Star, ShoppingCart, ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { QtyStepper } from "@/components/QtyStepper";
import { StickyCTA } from "@/components/StickyCTA";
import { PRODUCTS, productById } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart-store";
import { useFavorites } from "@/stores/favorites-store";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = productById(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — Farmlink` : "Product — Farmlink" },
        { name: "description", content: p?.description ?? "Fresh from the farm." },
        ...(p
          ? [
              { property: "og:title", content: `${p.name} — Farmlink` },
              { property: "og:description", content: p.description ?? "" },
              { property: "og:image", content: p.image },
              { name: "twitter:image", content: p.image },
            ]
          : []),
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <PhoneFrame>
      <TopBar title="Not found" />
      <div className="flex-1 px-5 py-12 text-center text-sm text-muted-foreground">
        That product doesn't exist.
        <div className="mt-4">
          <Link to="/freshly-stocked" className="text-primary underline">
            Browse all products
          </Link>
        </div>
      </div>
    </PhoneFrame>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const router = useRouter();
  const [qty, setQty] = React.useState(1);
  const [slide, setSlide] = React.useState(0);

  const liked = useFavorites((s) => s.ids.includes(product.id));
  const toggleFav = useFavorites((s) => s.toggle);
  const addToCart = useCart((s) => s.add);

  const slides = [product.image, product.image, product.image];
  const related = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  ).slice(0, 4);

  const onAdd = () => {
    addToCart(product.id, qty);
    router.navigate({ to: "/cart" });
  };

  return (
    <PhoneFrame>
      {/* Hero with header overlay */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-surface-2">
          <img src={slides[slide]} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => toggleFav(product.id)}
            aria-pressed={liked}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            aria-label={liked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-destructive text-destructive")} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === slide ? "w-5 bg-primary" : "w-1.5 bg-background/80",
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pb-6 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-primary">{product.category}</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">by {product.brand}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary/20 px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
            {product.rating?.toFixed(1) ?? "4.5"}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Price</p>
            <p className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {product.unit}
              </span>
            </p>
          </div>
          <QtyStepper value={qty} onChange={setQty} />
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold">Description</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>

        {related.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold">Related Products</h2>
            <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 no-scrollbar">
              {related.map((p) => (
                <Link
                  to="/product/$id"
                  params={{ id: p.id }}
                  key={p.id}
                  className="w-32 shrink-0"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-surface-2">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 truncate text-xs font-medium">{p.name}</p>
                  <p className="text-xs font-semibold text-primary">${p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <StickyCTA
        onClick={onAdd}
        label="Add to Cart"
        trailing={
          <span className="inline-flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />${(product.price * qty).toFixed(2)}
          </span>
        }
      />
    </PhoneFrame>
  );
}
