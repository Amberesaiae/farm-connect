import { Link } from "@tanstack/react-router";
import { listingPhotoUrl } from "@/lib/photo-url";

interface Props {
  slug: string;
  name: string;
  logo_path: string | null;
  region: string;
}

export function StorefrontCard({ slug, name, logo_path, region }: Props) {
  const logo = listingPhotoUrl(logo_path);
  return (
    <Link
      to="/stores/$slug"
      params={{ slug }}
      className="flex items-center gap-3 rounded-2xl border-[1.5px] border-border bg-card p-3 transition-colors hover:border-input"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-muted-foreground">{name[0]}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sold by</div>
        <div className="truncate text-[14px] font-semibold text-foreground">{name}</div>
        <div className="truncate text-[11px] text-muted-foreground">{region}</div>
      </div>
      <span className="shrink-0 text-[12px] font-semibold text-primary">Visit →</span>
    </Link>
  );
}
