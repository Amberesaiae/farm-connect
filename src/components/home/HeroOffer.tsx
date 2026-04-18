import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/hero-livestock.jpg";

export function HeroOffer() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground">
      {/* Radial highlight to add depth on the right side */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(22,101,52,0.6) 0%, transparent 70%)",
        }}
      />
      <div className="relative grid gap-0 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="px-6 pt-10 pb-8 md:px-12 md:py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90 ring-1 ring-inset ring-white/15">
            <ShieldCheck className="h-3 w-3" />
            Verified farmers · 16 regions
          </span>
          <h1 className="font-display mt-4 text-[34px] font-extrabold leading-[1.05] tracking-tight md:text-[46px]">
            Ghana's livestock<br />
            <span className="text-emerald-300">marketplace.</span>
          </h1>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/80 md:text-[15.5px]">
            Cattle, goats, sheep, poultry — listed by farmers, priced transparently,
            one WhatsApp tap away. No middlemen. No guesswork.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              to="/listings"
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-5 py-2.5 text-[13.5px] font-semibold text-primary transition-colors hover:bg-white/90"
            >
              Browse listings <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/post"
              className="inline-flex items-center rounded-md border-[1.5px] border-white/30 bg-transparent px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Post a listing
            </Link>
          </div>
        </div>

        <div className="relative h-64 md:h-full md:min-h-[360px]">
          <img
            src={heroImage}
            alt="West African cattle in a Ghanaian savanna at golden hour"
            className="absolute inset-0 h-full w-full object-cover"
            width={1280}
            height={960}
          />
          <div
            aria-hidden
            className="absolute inset-0 md:bg-gradient-to-r md:from-primary md:via-primary/40 md:to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
