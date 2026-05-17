import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/brand/Wordmark";

const COLS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Marketplace",
    links: [
      { to: "/listings", label: "Browse livestock" },
      { to: "/post", label: "Sell on farmlink" },
      { to: "/services", label: "Services" },
      { to: "/hatcheries", label: "Hatcheries" },
      { to: "/stores", label: "Agro stores" },
    ],
  },
  {
    title: "Trust & safety",
    links: [
      { to: "/dashboard/verification", label: "Get verified" },
      { to: "/safety", label: "Safety guide" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/contact", label: "Report an issue" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About farmlink" },
      { to: "/contact", label: "Contact us" },
      { to: "/help", label: "Help & FAQ" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/sitemap", label: "Sitemap" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Wordmark size="text-[22px]" />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            A direct livestock marketplace for Ghanaian farmers and buyers — no
            middlemen, no guesswork, one WhatsApp tap away.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
            <span aria-hidden>🇬🇭</span> Built in Ghana · 16 regions
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {col.title}
            </p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to as never}
                    className="text-[13.5px] font-medium text-foreground/85 transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline focus-visible:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-[12px] text-muted-foreground md:flex-row md:items-center md:px-8">
          <p>© {new Date().getFullYear()} farmlink. Built for Ghanaian farmers.</p>
          <p className="font-mono text-[11px] uppercase tracking-wider">
            v2 · serving 16 regions
          </p>
        </div>
      </div>
    </footer>
  );
}
