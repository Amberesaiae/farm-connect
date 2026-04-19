import { createFileRoute, Link } from "@tanstack/react-router";
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
import {
  ServiceProfileForm,
  type ServiceProfileFormValue,
} from "@/components/services/ServiceProfileForm";
import { QuoteRow, type QuoteRowData } from "@/components/services/QuoteRow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Inbox } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/provider")({
  head: () => ({ meta: [{ title: "Provider dashboard — farmlink" }] }),
  component: ProviderDashboard,
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
  whatsapp_e164: string | null;
  email: string | null;
  is_active: boolean;
}

function ProviderDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quotes, setQuotes] = useState<QuoteRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: prof } = await supabase
      .from("service_profiles")
      .select(
        "id,slug,business_name,category,blurb,coverage_regions,pricing_model,base_rate_ghs,whatsapp_e164,email,is_active",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setProfile((prof as Profile | null) ?? null);

    if (prof) {
      const { data: q } = await supabase
        .from("service_requests")
        .select(
          "id,status,service_type,region,district,preferred_date,preferred_window,budget_min_ghs,budget_max_ghs,notes,buyer_contact,provider_response,responded_price_ghs,created_at,buyer_id",
        )
        .eq("provider_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const buyerIds = Array.from(new Set((q ?? []).map((r) => r.buyer_id))).filter(Boolean);
      let names: Record<string, string> = {};
      if (buyerIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,display_name")
          .in("id", buyerIds);
        names = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
      }
      setQuotes(
        ((q ?? []) as unknown as (QuoteRowData & { buyer_id: string })[]).map((r) => ({
          ...r,
          buyer_name: names[r.buyer_id] ?? "Buyer",
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const initial: ServiceProfileFormValue | undefined = profile
    ? {
        id: profile.id,
        business_name: profile.business_name,
        category: profile.category,
        blurb: profile.blurb ?? "",
        coverage_regions: profile.coverage_regions,
        pricing_model: profile.pricing_model ?? "from",
        base_rate_ghs: profile.base_rate_ghs ? String(profile.base_rate_ghs) : "",
        whatsapp_e164: profile.whatsapp_e164 ?? "",
        email: profile.email ?? "",
        is_active: profile.is_active,
      }
    : undefined;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-5 md:py-8">
        {!profile ? (
          <div className="rounded-3xl border-[1.5px] border-dashed border-border bg-card p-8 text-center">
            <h1 className="font-display text-[24px] font-extrabold tracking-tight">
              Become a Farmlink service provider
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] text-muted-foreground">
              List your veterinary, transport, feed, training or insurance service and start receiving quote requests from farmers across Ghana.
            </p>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button className="mt-5 rounded-xl">Create service profile</Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>New service profile</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ServiceProfileForm onDone={() => { setOpen(false); void load(); }} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-[28px] font-extrabold tracking-tight">
                  {profile.business_name}
                </h1>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Provider dashboard · {profile.is_active ? "Listed" : "Hidden"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/services/$slug" params={{ slug: profile.slug }}>
                    View public page
                  </Link>
                </Button>
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button className="rounded-xl">Edit profile</Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                      <SheetTitle>Edit service profile</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <ServiceProfileForm
                        initial={initial}
                        onDone={() => { setOpen(false); void load(); }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <section className="mt-6">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-display text-[18px] font-extrabold tracking-tight">
                  Quote inbox
                </h2>
              </div>
              <div className="mt-3 space-y-3">
                {quotes.length === 0 ? (
                  <p className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    No quote requests yet. Share your profile link to get started.
                  </p>
                ) : (
                  quotes.map((q) => (
                    <QuoteRow
                      key={q.id}
                      row={q}
                      perspective="provider"
                      onChanged={() => void load()}
                    />
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
