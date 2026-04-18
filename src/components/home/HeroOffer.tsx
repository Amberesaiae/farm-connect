import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-livestock.jpg";

export function HeroOffer() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary-soft">
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div className="px-6 pt-8 md:px-10 md:py-12">
          <span className="inline-flex items-center rounded-full bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Direct from farmers
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            Buy livestock direct from Ghanaian farmers
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
            Verified sellers, transparent prices, and a quick WhatsApp away — no middlemen, no
            guesswork.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="lg" className="rounded-full font-semibold">
              <Link to="/listings">
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-background font-semibold">
              <Link to="/post">Post a listing</Link>
            </Button>
          </div>
        </div>
        <div className="relative md:py-6 md:pr-6">
          <div className="aspect-[4/3] overflow-hidden rounded-t-3xl md:rounded-3xl">
            <img
              src={heroImage}
              alt="West African cattle in a Ghanaian savanna at golden hour"
              className="h-full w-full object-cover"
              width={1280}
              height={960}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
