import { Link } from "@tanstack/react-router";
import { ServiceCard } from "@/components/services/ServiceCard";
import { HatcheryCard } from "@/components/services/HatcheryCard";
import { SERVICES } from "@/lib/services-data";
import { HATCHERIES } from "@/lib/hatcheries-data";
import { ArrowRightIcon } from "@/components/icons";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DisplayAccent } from "@/components/shared/DisplayAccent";

/**
 * Mixed editorial row of vets/services + hatcheries — one scroll-snap rail
 * with a single header, followed by twin pill CTAs on a cream sign-off.
 */
export function ServicesAndHatcheries() {
  const services = SERVICES.slice(0, 3);
  const hatcheries = HATCHERIES.slice(0, 3);

  return (
    <section aria-label="Services and hatcheries">
      <SectionHeader
        eyebrow="Beyond the marketplace"
        title={
          <>
            Vets, hatcheries <DisplayAccent>&amp; the people</DisplayAccent> who keep farms moving.
          </>
        }
        description="Mobile vets, certified hatcheries, transporters and trainers — every partner verified before they appear here."
        seeAll={{ to: "/services", label: "Browse services" }}
      />

      <div className="scroll-snap-row -mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8">
        {services.map((s) => (
          <div key={s.id} className="w-[260px] shrink-0 md:w-[300px]">
            <ServiceCard service={s} />
          </div>
        ))}
        {hatcheries.map((h) => (
          <div key={h.id} className="w-[260px] shrink-0 md:w-[300px]">
            <HatcheryCard hatchery={h} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/services"
          className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-5 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Vets &amp; services <ArrowRightIcon size={14} />
        </Link>
        <Link
          to="/hatcheries"
          className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-5 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Hatcheries <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
  );
}
