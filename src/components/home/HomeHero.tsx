import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, ShieldIcon, WhatsAppIcon } from "@/components/icons";
import { MarketSearch } from "@/components/home/MarketSearch";
import mixedHero from "@/assets/mixed-hero.jpg";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-primary text-primary-foreground">
      {/* Warm overlay shapes */}
      <span
        aria-hidden
        className="fl-drift pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-[color:var(--accent-2)]/30 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 85% 60%, rgba(20,83,45,0.55) 0%, transparent 70%)",
        }}
      />
      <div className="relative grid items-center gap-0 md:grid-cols-[1.15fr_1fr]">
        <div className="px-6 pb-10 pt-12 md:px-12 md:py-16">
          <span className="fl-fade-in inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90 ring-1 ring-inset ring-white/15">
            <ShieldIcon size={12} />
            Verified farmers · 16 regions
          </span>
          <h1 className="fl-rise-in font-display mt-4 text-[36px] font-extrabold leading-[1.02] tracking-tight md:text-[54px]">
            Ghana's livestock,
            <br />
            <span className="text-emerald-300">one WhatsApp tap away.</span>
          </h1>
          <p className="fl-rise-in mt-5 max-w-md text-[15px] leading-relaxed text-white/85 md:text-[16.5px]">
            Buy direct from farmers. Sell without middlemen. Find vets,
            hatcheries and feed for your herd — all in one trusted marketplace.
          </p>
          <div className="fl-rise-in mt-7">
            <MarketSearch variant="hero" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/post"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/15"
            >
              Post a listing <ArrowRightIcon size={14} />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white/85 transition-colors hover:text-white"
            >
              How it works
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[12px] text-white/70">
            <WhatsAppIcon size={14} />
            <span>Contact sellers directly. No platform fees on chats.</span>
          </div>
        </div>

        <div className="relative h-72 md:h-full md:min-h-[420px]">
          <img
            src={mixedHero}
            alt="Mixed livestock on a Ghanaian farm at golden hour"
            className="absolute inset-0 h-full w-full object-cover"
            width={1280}
            height={960}
          />
          <div
            aria-hidden
            className="absolute inset-0 md:bg-gradient-to-r md:from-primary md:via-primary/40 md:to-transparent"
          />
          {/* Soft warm wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background:
                "linear-gradient(135deg, rgba(217,119,6,0.35), rgba(20,83,45,0))",
            }}
          />
        </div>
      </div>
    </section>
  );
}