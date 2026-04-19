import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { QuoteRow, type QuoteRowData } from "@/components/services/QuoteRow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { MessageCircleMore } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/quotes")({
  head: () => ({ meta: [{ title: "My quote requests — farmlink" }] }),
  component: BuyerQuotes,
});

function BuyerQuotes() {
  const { user } = useAuth();
  const [rows, setRows] = useState<QuoteRowData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("service_requests")
      .select(
        "id,status,service_type,region,district,preferred_date,preferred_window,budget_min_ghs,budget_max_ghs,notes,buyer_contact,provider_response,responded_price_ghs,created_at",
      )
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as QuoteRowData[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-5 md:py-8">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">My quote requests</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Quotes you've requested from service providers.
        </p>

        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border-[1.5px] border-dashed border-border bg-card p-10 text-center">
              <MessageCircleMore className="mx-auto h-8 w-8 text-primary" strokeWidth={1.6} />
              <p className="mt-3 text-sm text-muted-foreground">No quote requests yet.</p>
              <Button asChild className="mt-4 rounded-xl">
                <Link to="/services">Browse providers</Link>
              </Button>
            </div>
          ) : (
            rows.map((r) => (
              <QuoteRow key={r.id} row={r} perspective="buyer" onChanged={() => void load()} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
