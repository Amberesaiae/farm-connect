import { MapPinIcon, CheckIcon } from "@/components/icons";
import { listingPhotoUrl } from "@/lib/photo-url";
import { AGRO_PILLAR_LABEL, type AgroPillar } from "@/lib/agro-store-status";

interface Props {
  name: string;
  pillar: AgroPillar;
  region: string;
  district: string | null;
  blurb: string | null;
  cover_path: string | null;
  logo_path: string | null;
  delivers: boolean;
  approved: boolean;
}

export function StoreHero({
  name,
  pillar,
  region,
  district,
  blurb,
  cover_path,
  logo_path,
  delivers,
  approved,
}: Props) {
  const cover = listingPhotoUrl(cover_path);
  const logo = listingPhotoUrl(logo_path);
  return (
    <section className="overflow-hidden rounded-2xl border-[1.5px] border-border bg-card">
      <div className="relative h-44 w-full bg-surface md:h-56">
        {cover ? (
          <img src={cover} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No cover</div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:gap-5 md:p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[1.5px] border-border bg-card">
          {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <span className="text-base font-bold text-muted-foreground">{name[0]}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight md:text-2xl">{name}</h1>
            {approved ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <CheckIcon size={10} strokeWidth={3} /> Verified
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {AGRO_PILLAR_LABEL[pillar]}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon size={12} /> {district ? `${district}, ` : ""}{region}
            </span>
            {delivers ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Delivers</span> : null}
          </div>
          {blurb ? <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-foreground/90">{blurb}</p> : null}
        </div>
      </div>
    </section>
  );
}
