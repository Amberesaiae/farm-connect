import { Link } from "@tanstack/react-router";
import { ServiceCard } from "@/components/services/ServiceCard";
import { HatcheryCard } from "@/components/services/HatcheryCard";
import { SERVICES } from "@/lib/services-data";
import { HATCHERIES } from "@/lib/hatcheries-data";
import { ArrowRightIcon } from "@/components/icons";

/**
 * Two-up section: vets/services on the left, hatcheries on the right.
 * Reuses existing card components so styling stays consistent across the app.
 */
export function ServicesAndHatcheries() {
  const services = SERVICES.slice(0, 3);
  const hatcheries = HATCHERIES.slice(0, 3);

  return (
    <section aria-label="Services and hatcheries" className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <SubSection
        eyebrow="Beyond the marketplace"
        title="Vets, transport & training"
        copy="Trusted partners ready to keep your herd healthy and moving."
        to="/services"
        ctaLabel="All services"
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {services.map((s) => (
            <li key={s.id}><ServiceCard service={s} /></li>
          ))}
        </ul>
      </SubSection>

      <SubSection
        eyebrow="Chicks & fingerlings"
        title="Hatcheries near you"
        copy="Day-olds, layers, broilers and fish fry from licenced hatcheries."
        to="/hatcheries"
        ctaLabel="All hatcheries"
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {hatcheries.map((h) => (
            <li key={h.id}><HatcheryCard hatchery={h} /></li>
          ))}
        </ul>
      </SubSection>
    </section>
  );
}

function SubSection({
  eyebrow, title, copy, to, ctaLabel, children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  to: "/services" | "/hatcheries";
  ctaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary/80">
            {eyebrow}
          </p>
          <h2 className="font-display mt-1.5 text-[22px] font-extrabold tracking-tight md:text-[26px]">
            {title}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{copy}</p>
        </div>
        <Link
          to={to}
          className="hidden shrink-0 items-center gap-1.5 self-end text-[13px] font-semibold text-primary hover:underline md:inline-flex"
        >
          {ctaLabel} <ArrowRightIcon size={14} />
        </Link>
      </div>
      {children}
      <div className="mt-4 md:hidden">
        <Link to={to} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          {ctaLabel} <ArrowRightIcon size={14} />
        </Link>
      </div>
    </div>
  );
}
