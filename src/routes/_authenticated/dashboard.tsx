import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { markSold, relistListing } from "@/server/listings.functions";
import { formatGhs, formatPriceUnit, formatRelative } from "@/lib/format";
import { listingPhotoUrl } from "@/lib/photo-url";
import { toast } from "sonner";
import { Eye, MessageCircle, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My listings — Farmlink" }] }),
  component: Dashboard,
});

interface Row {
  id: string;
  title: string;
  price_ghs: number | string;
  price_unit: string;
  status: string;
  view_count: number;
  contact_count: number;
  created_at: string;
  expires_at: string;
  listing_photos: { storage_path: string; is_cover: boolean; display_order: number }[];
}

function Dashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const sold = useServerFn(markSold);
  const relist = useServerFn(relistListing);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,price_ghs,price_unit,status,view_count,contact_count,created_at,expires_at,listing_photos(storage_path,is_cover,display_order)",
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const byStatus = (s: string) => rows.filter((r) => r.status === s);

  const renderRow = (r: Row) => {
    const cover = [...(r.listing_photos ?? [])].sort(
      (a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || a.display_order - b.display_order,
    )[0]?.storage_path;
    return (
      <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
          {cover ? (
            <img src={listingPhotoUrl(cover)} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <Link to="/listings/$id" params={{ id: r.id }} className="block truncate font-semibold hover:underline">
            {r.title}
          </Link>
          <p className="text-sm">
            <span className="font-semibold">{formatGhs(r.price_ghs)}</span>{" "}
            <span className="text-muted-foreground">{formatPriceUnit(r.price_unit)}</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {r.view_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {r.contact_count}
            </span>
            <span>posted {formatRelative(r.created_at)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {r.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await sold({ data: { id: r.id } });
                toast.success("Marked as sold");
                void load();
              }}
            >
              Mark sold
            </Button>
          )}
          {r.status === "expired" && (
            <Button
              size="sm"
              onClick={async () => {
                await relist({ data: { id: r.id } });
                toast.success("Relisted for 60 days");
                void load();
              }}
            >
              Relist
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My listings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your active and past listings</p>
          </div>
          <Button asChild>
            <Link to="/post">
              <Plus className="h-4 w-4" /> New listing
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="active" className="mt-6">
          <TabsList>
            <TabsTrigger value="active">Active ({byStatus("active").length})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({byStatus("expired").length})</TabsTrigger>
            <TabsTrigger value="sold">Sold ({byStatus("sold").length})</TabsTrigger>
            <TabsTrigger value="hidden">Hidden ({byStatus("hidden").length})</TabsTrigger>
          </TabsList>
          {(["active", "expired", "sold", "hidden"] as const).map((s) => (
            <TabsContent key={s} value={s} className="mt-4 space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : byStatus(s).length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Nothing here yet.
                </div>
              ) : (
                byStatus(s).map(renderRow)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell>
  );
}
