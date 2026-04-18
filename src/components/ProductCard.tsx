import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: Props) {
  const [liked, setLiked] = React.useState(false);
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-surface-2/70 transition-transform hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-2">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setLiked((v) => !v);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
          aria-label={liked ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn("h-4 w-4 transition-colors", liked ? "fill-destructive text-destructive" : "")}
          />
        </button>
      </div>
      <div className="px-1 pb-2 pt-2">
        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
        <p className="mt-0.5 text-sm font-semibold text-primary">
          ${product.price.toFixed(2)}
          <span className="ml-1 text-[11px] font-normal text-muted-foreground">{product.unit}</span>
        </p>
      </div>
    </Link>
  );
}
