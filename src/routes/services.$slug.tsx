import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QuoteRequestForm } from "@/components/services/QuoteRequestForm";
import { hatcheryPhotoUrl } from "@/lib/hatchery-photo-url";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SERVICE_CATEGORY_LABEL } from "@/lib/categories";
import { formatGhs } from "@/lib/format";
import { MapPin, MessageCircleMore } from "lucide-react";

export const Route = createFileRoute("/services/$slug")({
  head: () => ({ meta: [{ title: "Service provider — farmlink" }] }),
  component: ServiceDetail,
});

interface Profile {
  id: string;
  slug: string;
  business_name: string;
  category: string;
  blurb: string | null;
  coverage_regions: string[];
  pricing_model: string | null;
  base_rate_ghs: number | string | null;
  cover_path: string | null;
  whatsapp_e164: string | null;
  email: string | null;
  badge_tier: string;
}

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("service_profiles")
        .select(
          "id,slug,business_name,category,blurb,coverage_regions,pricing_model,base_rate_ghs,cover_path,whatsapp_e164,email,badge_tier",
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (!cancelled) {
        setP((data as Profile | null) ?? null);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const cover = hatcheryPhotoUrl(p?.cover_path);

  const requestQuote = () => {
    if (!isAuthenticated) {
      navigate({
        to: "/login",
        search: { redirect: `/services/${slug}` } as never,
      });
      return;
    }
    setOpen(true);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !p ? (
          <div className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">Provider not found.</p>
            <Button asChild className="mt-3 rounded-xl">
              <Link to="/services">Back to services</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border-[1.5px] border-border bg-card">
              <div className="h-44 w-full bg-surface md:h-60">
                {cover ? (
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-soft to-surface">
                    <span className="font-display text-4xl font-extrabold text-primary/40">
                      {p.business_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 md:p-7">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-secondary/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-secondary">
                    {SERVICE_CATEGORY_LABEL[p.category] ?? p.category}
                  </span>
                  {p.badge_tier && p.badge_tier !== "none" ? (
                    <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
                      Verified
                    </span>
                  ) : null}
                </div>
                <h1 className="font-display mt-3 text-[28px] font-extrabold tracking-tight md:text-[34px]">
                  {p.business_name}
                </h1>
                <p className="mt-2 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.coverage_regions.length === 0
                    ? "Coverage tba"
                    : p.coverage_regions.join(", ")}
                </p>
                {p.blurb ? (
                  <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-foreground/80">
                    {p.blurb}
                  </p>
                ) : null}
                {p.base_rate_ghs ? (
                  <p className="mt-4 font-mono text-[18px] font-bold">
                    {formatGhs(p.base_rate_ghs)}{" "}
                    <span className="text-[12px] font-normal text-muted-foreground">
                      {p.pricing_model ?? "from"}
                    </span>
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                      <Button onClick={requestQuote} className="rounded-xl">
                        <MessageCircleMore className="h-4 w-4" /> Request quote
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                      <SheetHeader>
                        <SheetTitle>Request a quote from {p.business_name}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">
                        <QuoteRequestForm
                          serviceProfileId={p.id}
                          defaultServiceType={SERVICE_CATEGORY_LABEL[p.category]}
                          onDone={() => {
                            setOpen(false);
                            navigate({ to: "/dashboard/quotes" });
                          }}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
