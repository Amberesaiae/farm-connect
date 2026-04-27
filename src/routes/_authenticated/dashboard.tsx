import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { KpiTile } from "@/components/dashboard/KpiTile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { markSold, relistListing } from "@/server/listings.functions";
import { formatGhs, formatPriceUnit, formatRelative } from "@/lib/format";
import { listingPhotoUrl } from "@/lib/photo-url";
import { toast } from "sonner";
import { Eye, MessageCircle, MoreHorizontal, Package, Plus } from "lucide-react";
import { PhoneVerifyNudge } from "@/components/auth/PhoneVerifyNudge";
import { ListingQuotaBanner } from "@/components/dashboard/ListingQuotaBanner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My listings — farmlink" }] }),
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
  const activeListings = byStatus("active");
  const totalViews = rows.reduce((acc, r) => acc + (r.view_count ?? 0), 0);
  const totalTaps = rows.reduce((acc, r) => acc + (r.contact_count ?? 0), 0);

  const renderRow = (r: Row) => {
    const cover = [...(r.listing_photos ?? [])].sort(
      (a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || a.display_order - b.display_order,
    )[0]?.storage_path;
    return (
      <div
        key={r.id}
        className="flex items-center gap-3 rounded-2xl border-[1.5px] border-border bg-card p-3"
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
          {cover ? (
            <img src={listingPhotoUrl(cover)} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to="/listings/$id"
            params={{ id: r.id }}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {r.title}
          </Link>
          <p className="text-sm">
            <span className="font-mono font-bold">{formatGhs(r.price_ghs)}</span>{" "}
            <span className="text-xs text-muted-foreground">{formatPriceUnit(r.price_unit)}</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {r.view_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {r.contact_count}
            </span>
            <span>posted {formatRelative(r.created_at)}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Listing actions" className="rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link to="/listings/$id" params={{ id: r.id }}>
                View listing
              </Link>
            </DropdownMenuItem>
            {r.status === "active" && (
              <DropdownMenuItem
                onClick={async () => {
                  await sold({ data: { id: r.id } });
                  toast.success("Marked as sold");
                  void load();
                }}
              >
                Mark sold
              </DropdownMenuItem>
            )}
            {r.status === "expired" && (
              <DropdownMenuItem
                onClick={async () => {
                  await relist({ data: { id: r.id } });
                  toast.success("Relisted for 60 days");
                  void load();
                }}
              >
                Relist
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const empty = (msg: string) => (
    <div className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center">
      <p className="text-sm text-muted-foreground">{msg}</p>
      <Button asChild className="mt-4 rounded-xl">
        <Link to="/post">
          <Plus className="h-4 w-4" /> Post a listing
        </Link>
      </Button>
    </div>
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-5 md:py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-extrabold tracking-tight">My listings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your active and past livestock listings
            </p>
          </div>
          <Button asChild className="hidden rounded-xl sm:inline-flex">
            <Link to="/post">
              <Plus className="h-4 w-4" /> New listing
            </Link>
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <KpiTile label="Active" value={activeListings.length} Icon={Package} />
          <KpiTile label="Total views" value={totalViews} Icon={Eye} />
          <KpiTile label="WhatsApp taps" value={totalTaps} Icon={MessageCircle} />
        </div>

        <div className="mt-4">
          <PhoneVerifyNudge />
        </div>

        <div className="mt-4">
          <ListingQuotaBanner />
        </div>

        <Tabs defaultValue="active" className="mt-6">
          <TabsList className="rounded-xl border-[1.5px] border-border bg-card p-1">
            <TabsTrigger value="active" className="rounded-lg">
              Active ({byStatus("active").length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="rounded-lg">
              Expired ({byStatus("expired").length})
            </TabsTrigger>
            <TabsTrigger value="sold" className="rounded-lg">
              Sold ({byStatus("sold").length})
            </TabsTrigger>
            <TabsTrigger value="hidden" className="rounded-lg">
              Hidden ({byStatus("hidden").length})
            </TabsTrigger>
          </TabsList>
          {(["active", "expired", "sold", "hidden"] as const).map((s) => (
            <TabsContent key={s} value={s} className="mt-4 space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : byStatus(s).length === 0 ? (
                empty(
                  s === "active"
                    ? "You have no active listings yet — post your first one in under a minute."
                    : `Nothing in ${s} yet.`,
                )
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
