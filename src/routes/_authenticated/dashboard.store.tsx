import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Store, Egg, Wrench } from "lucide-react";
import {
  AGRO_STORE_STATUS_LABEL,
  AGRO_STORE_STATUS_TONE,
  AGRO_PILLAR_LABEL,
  type AgroPillar,
  type AgroStoreStatus,
} from "@/lib/agro-store-status";
import { HATCHERY_STATUS_LABEL, HATCHERY_STATUS_TONE, type HatcheryStatus } from "@/lib/hatchery-status";

export const Route = createFileRoute("/_authenticated/dashboard/store")({
  head: () => ({ meta: [{ title: "My shops — farmlink" }] }),
  component: StoreHub,
});

interface AgroStore {
  id: string;
  slug: string;
  business_name: string;
  pillar: AgroPillar;
  status: AgroStoreStatus;
  region: string;
}
interface Hatchery {
  id: string;
  slug: string;
  name: string;
  status: HatcheryStatus;
  region: string;
}
interface ServiceRow {
  id: string;
  slug: string;
  business_name: string;
  is_active: boolean;
  category: string;
  region: string | null;
}

function StoreHub() {
  const { user } = useAuth();
  const [agros, setAgros] = useState<AgroStore[]>([]);
  const [hatcheries, setHatcheries] = useState<Hatchery[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [a, h, s] = await Promise.all([
        supabase.from("agro_vendor_stores").select("id,slug,business_name,pillar,status,region").eq("owner_id", user.id),
        supabase.from("hatcheries").select("id,slug,name,status,region").eq("owner_id", user.id),
        supabase.from("service_profiles").select("id,slug,business_name,is_active,category,region").eq("owner_id", user.id),
      ]);
      setAgros((a.data ?? []) as AgroStore[]);
      setHatcheries((h.data ?? []) as Hatchery[]);
      setServices((s.data ?? []) as ServiceRow[]);
      setLoading(false);
    })();
  }, [user]);

  const empty = !loading && agros.length === 0 && hatcheries.length === 0 && services.length === 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
        <div className="flex items-center gap-2 text-primary">
          <Store className="h-5 w-5" strokeWidth={1.7} />
          <span className="text-[12px] font-bold uppercase tracking-wider">My shops</span>
        </div>
        <h1 className="font-display mt-2 text-[28px] font-extrabold tracking-tight">Vendor hub</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Each shop has its own commerce flow. You can run more than one.
        </p>

        {empty && (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <p className="text-[14px] text-muted-foreground">
              You don't have any shops yet. Pick what you'd like to start with.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <KindCard title="Open a shop" desc="Feed, agromed or equipment dealer." to="/dashboard/store/agro/onboarding" Icon={Store} />
          <KindCard title="Run a hatchery" desc="Sell day-olds, fingerlings, breeding stock." to="/dashboard/hatchery/onboarding" Icon={Egg} />
          <KindCard title="Offer a service" desc="Vet, transport, training, advisory." to="/dashboard/provider" Icon={Wrench} />
        </div>

        {agros.length > 0 && (
          <Section title="Agro shops">
            {agros.map((s) => (
              <RowItem key={s.id} title={s.business_name} sub={`${AGRO_PILLAR_LABEL[s.pillar]} · ${s.region}`} pill={AGRO_STORE_STATUS_LABEL[s.status]} pillTone={AGRO_STORE_STATUS_TONE[s.status]} viewTo={{ to: "/stores/$slug", params: { slug: s.slug } }} />
            ))}
          </Section>
        )}

        {hatcheries.length > 0 && (
          <Section title="Hatcheries">
            {hatcheries.map((h) => (
              <RowItem key={h.id} title={h.name} sub={h.region} pill={HATCHERY_STATUS_LABEL[h.status]} pillTone={HATCHERY_STATUS_TONE[h.status]} viewTo={{ to: "/hatcheries/$slug", params: { slug: h.slug } }} dashTo={{ to: "/dashboard/hatchery" }} />
            ))}
          </Section>
        )}

        {services.length > 0 && (
          <Section title="Services">
            {services.map((s) => (
              <RowItem key={s.id} title={s.business_name} sub={`${s.category}${s.region ? ` · ${s.region}` : ""}`} pill={s.is_active ? "Active" : "Hidden"} pillTone={s.is_active ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"} viewTo={{ to: "/services/$slug", params: { slug: s.slug } }} dashTo={{ to: "/dashboard/provider" }} />
            ))}
          </Section>
        )}
      </div>
    </AppShell>
  );
}

function KindCard({ title, desc, to, Icon }: { title: string; desc: string; to: "/dashboard/store/agro/onboarding" | "/dashboard/hatchery/onboarding" | "/dashboard/provider"; Icon: typeof Store }) {
  return (
    <Link to={to} className="group flex flex-col gap-2 rounded-2xl border-[1.5px] border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-input hover:shadow-[0_8px_32px_rgba(17,24,20,0.08)]">
      <Icon className="h-6 w-6 text-primary" strokeWidth={1.7} />
      <div className="font-display text-[15px] font-extrabold tracking-tight">{title}</div>
      <div className="text-[12.5px] text-muted-foreground">{desc}</div>
      <span className="mt-auto pt-1 text-[12px] font-semibold text-primary">Start →</span>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-[15px] font-extrabold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function RowItem({ title, sub, pill, pillTone, viewTo, dashTo }: { title: string; sub: string; pill: string; pillTone: string; viewTo: { to: "/stores/$slug" | "/hatcheries/$slug" | "/services/$slug"; params: { slug: string } }; dashTo?: { to: "/dashboard/hatchery" | "/dashboard/provider" } }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold">{title}</div>
        <div className="truncate text-[12px] text-muted-foreground">{sub}</div>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pillTone}`}>{pill}</span>
      <div className="flex gap-2">
        {dashTo ? (
          <Button asChild size="sm" variant="outline" className="rounded-xl">
            <Link to={dashTo.to}>Manage</Link>
          </Button>
        ) : null}
        <Button asChild size="sm" className="rounded-xl">
          <Link to={viewTo.to} params={viewTo.params}>View</Link>
        </Button>
      </div>
    </div>
  );
}
