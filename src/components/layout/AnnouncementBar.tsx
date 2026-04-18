import { Link } from "@tanstack/react-router";

export function AnnouncementBar() {
  return (
    <div className="flex items-center justify-center gap-3 bg-primary px-4 py-2 text-center text-[12.5px] font-medium text-primary-foreground">
      <span className="inline-flex items-center gap-2">
        <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Verified sellers across all 16 regions
      </span>
      <Link
        to="/listings"
        className="hidden text-[11.5px] text-white/70 underline decoration-white/35 underline-offset-2 hover:text-white sm:inline"
      >
        Browse all listings
      </Link>
    </div>
  );
}
