import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { hatcheryPhotoUrl } from "@/lib/hatchery-photo-url";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { formatGhs } from "@/lib/format";

export interface ServiceProfileCardData {
  id: string;
  slug: string;
  business_name: string;
  category: string;
  blurb: string | null;
  coverage_regions: string[];
  pricing_model: string | null;
  base_rate_ghs: number | string | null;
  cover_path: string | null;
  rating_avg: number | string;
  rating_count: number;
  badge_tier: string;
}

export function ServiceProfileCard({ profile }: { profile: ServiceProfileCardData }) {
  const { taxonomy } = useTaxonomy();
  const cover = hatcheryPhotoUrl(profile.cover_path);
  const verified = profile.badge_tier && profile.badge_tier !== "none";
  return (
    <Link
      to="/services/$slug"
      params={{ slug: profile.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border-[1.5px] border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="aspect-[5/3] overflow-hidden bg-surface">
        {cover ? (
          <img
            src={cover}
            alt={profile.business_name}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft to-surface">
            <span className="font-display text-3xl font-extrabold text-primary/40">
              {profile.business_name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
            {taxonomy.labelFor("services", profile.category)}
          </span>
          {verified ? (
            <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Verified
            </span>
          ) : null}
        </div>
        <h3 className="font-display mt-2 text-[16.5px] font-extrabold tracking-tight text-foreground">
          {profile.business_name}
        </h3>
        <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {profile.coverage_regions.length === 0
            ? "Coverage tba"
            : profile.coverage_regions.length <= 2
              ? profile.coverage_regions.join(", ")
              : `${profile.coverage_regions.slice(0, 2).join(", ")} +${profile.coverage_regions.length - 2}`}
        </p>
        {profile.blurb ? (
          <p className="mt-2 line-clamp-2 flex-1 text-[13px] text-foreground/75">{profile.blurb}</p>
        ) : (
          <div className="flex-1" />
        )}
        <div className="mt-3 flex items-end justify-between">
          <div>
            {profile.base_rate_ghs ? (
              <p className="font-mono text-[15px] font-bold leading-none">
                {formatGhs(profile.base_rate_ghs)}
                <span className="ml-1 text-[10.5px] font-normal text-muted-foreground">
                  {profile.pricing_model ?? "from"}
                </span>
              </p>
            ) : (
              <p className="text-[12px] text-muted-foreground">Quote on request</p>
            )}
          </div>
          {profile.rating_count > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {Number(profile.rating_avg).toFixed(1)}
              <span className="font-normal text-muted-foreground">({profile.rating_count})</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
