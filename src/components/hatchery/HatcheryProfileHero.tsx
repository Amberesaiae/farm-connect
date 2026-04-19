import { MapPin, Award } from "lucide-react";
import { hatcheryPhotoUrl } from "@/lib/hatchery-photo-url";
import { HATCHERY_CATEGORY_LABEL, type HatcheryCategory } from "@/lib/categories";

export interface HatcheryHeroData {
  name: string;
  category: HatcheryCategory;
  region: string;
  district: string | null;
  blurb: string | null;
  cover_path: string | null;
  capacity_per_cycle: number | null;
  permit_authority: string | null;
  permit_number: string | null;
}

export function HatcheryProfileHero({ hatchery }: { hatchery: HatcheryHeroData }) {
  const cover = hatcheryPhotoUrl(hatchery.cover_path);
  return (
    <section className="overflow-hidden rounded-3xl border-[1.5px] border-border bg-card">
      <div className="relative h-44 w-full bg-surface md:h-64">
        {cover ? (
          <img
            src={cover}
            alt={`${hatchery.name} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft to-surface">
            <span className="font-display text-4xl font-extrabold text-primary/40">
              {hatchery.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-secondary/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-secondary">
            {HATCHERY_CATEGORY_LABEL[hatchery.category]}
          </span>
          {hatchery.permit_number ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
              <Award className="h-3 w-3" /> Permit on file
            </span>
          ) : null}
        </div>
        <h1 className="font-display mt-3 text-[28px] font-extrabold leading-[1.05] tracking-tight md:text-[36px]">
          {hatchery.name}
        </h1>
        <p className="mt-2 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {hatchery.district ? `${hatchery.district}, ` : ""}
          {hatchery.region}
        </p>
        {hatchery.blurb ? (
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-foreground/80">
            {hatchery.blurb}
          </p>
        ) : null}
        {hatchery.capacity_per_cycle ? (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Capacity:{" "}
            <span className="font-mono font-semibold text-foreground">
              {hatchery.capacity_per_cycle.toLocaleString()}
            </span>{" "}
            per cycle
          </p>
        ) : null}
      </div>
    </section>
  );
}
