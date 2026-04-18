import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { moderateListing } from "@/server/admin.functions";
import { toast } from "sonner";
import { formatGhs, formatRelative } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/_admin/admin/listings")({
  head: () => ({ meta: [{ title: "Listing moderation — Farmlink admin" }] }),
  component: ListingMod,
});

interface Row {
  id: string;
  title: string;
  status: string;
  price_ghs: number | string;
  region: string;
  created_at: string;
  profiles: { display_name: string } | null;
}

function ListingMod() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const moderate = useServerFn(moderateListing);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("id,title,status,price_ghs,region,created_at,profiles!listings_seller_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const act = async (id: string, action: "hide" | "restore" | "delete") => {
    if (action === "delete" && !confirm("Permanently delete this listing?")) return;
    await moderate({ data: { listing_id: id, action } });
    toast.success(`${action} done`);
    void load();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Listing moderation</h1>
        <div className="mt-6 space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <Link to="/listings/$id" params={{ id: r.id }} className="block truncate font-semibold hover:underline">
                    {r.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {r.profiles?.display_name ?? "—"} · {r.region} · {formatGhs(r.price_ghs)} · {formatRelative(r.created_at)}
                  </p>
                </div>
                <Badge variant="outline">{r.status}</Badge>
                {r.status !== "hidden" ? (
                  <Button size="sm" variant="outline" onClick={() => act(r.id, "hide")}>Hide</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => act(r.id, "restore")}>Restore</Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => act(r.id, "delete")}>Delete</Button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
