import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/layout/StaticPage";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Sitemap — farmlink" },
      { name: "description", content: "Every public page on farmlink, in one place." },
      { property: "og:title", content: "Sitemap — farmlink" },
      { property: "og:description", content: "All public farmlink routes." },
    ],
  }),
  component: SitemapPage,
});

const GROUPS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Marketplace",
    links: [
      { to: "/", label: "Home" },
      { to: "/listings", label: "Browse livestock" },
      { to: "/hatcheries", label: "Hatcheries" },
      { to: "/services", label: "Services directory" },
      { to: "/stores", label: "Agro stores" },
      { to: "/post", label: "Post a listing" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Sign in / sign up" },
      { to: "/dashboard", label: "My dashboard" },
      { to: "/saved", label: "Saved listings" },
      { to: "/dashboard/verification", label: "Verification" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About farmlink" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/safety", label: "Safety guide" },
      { to: "/help", label: "Help & FAQ" },
      { to: "/contact", label: "Contact" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

function SitemapPage() {
  return (
    <StaticPage
      eyebrow="Sitemap"
      title={<>Every page, <span className="text-primary">one click away.</span></>}
    >
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </p>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to as never}
                    className="text-[14px] font-semibold text-foreground hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}