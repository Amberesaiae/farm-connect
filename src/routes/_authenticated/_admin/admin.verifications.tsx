import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { reviewVerification } from "@/server/verification.functions";
import { VERIFICATION_DOCS_BUCKET } from "@/lib/constants";
import { toast } from "sonner";
import { formatRelative } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/_admin/admin/verifications")({
  head: () => ({ meta: [{ title: "Verification queue — Farmlink admin" }] }),
  component: VerificationQueue,
});

interface Sub {
  id: string;
  user_id: string;
  ghana_card_path: string;
  selfie_path: string;
  created_at: string;
  profiles: { display_name: string } | null;
}

function VerificationQueue() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [signed, setSigned] = useState<Record<string, { card?: string; selfie?: string }>>({});
  const review = useServerFn(reviewVerification);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("verification_submissions")
      .select("id,user_id,ghana_card_path,selfie_path,created_at,profiles!verification_submissions_user_id_fkey(display_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    const list = (data ?? []) as unknown as Sub[];
    setRows(list);
    // Get signed URLs for each doc
    const map: Record<string, { card?: string; selfie?: string }> = {};
    for (const s of list) {
      const [{ data: c }, { data: f }] = await Promise.all([
        supabase.storage.from(VERIFICATION_DOCS_BUCKET).createSignedUrl(s.ghana_card_path, 600),
        supabase.storage.from(VERIFICATION_DOCS_BUCKET).createSignedUrl(s.selfie_path, 600),
      ]);
      map[s.id] = { card: c?.signedUrl, selfie: f?.signedUrl };
    }
    setSigned(map);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    if (decision === "rejected" && !reasons[id]?.trim()) {
      return toast.error("Please give a reason");
    }
    await review({ data: { submission_id: id, decision, reason: reasons[id] } });
    toast.success(`Submission ${decision}`);
    void load();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Verification queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">{rows.length} pending</p>
        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No submissions in the queue.
            </div>
          ) : (
            rows.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{s.profiles?.display_name ?? "Seller"}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(s.created_at)}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <a href={signed[s.id]?.card} target="_blank" rel="noreferrer" className="block">
                    {signed[s.id]?.card ? (
                      <img src={signed[s.id]?.card} alt="Ghana Card" className="aspect-video rounded-md object-cover" />
                    ) : (
                      <div className="aspect-video rounded-md bg-surface" />
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">Ghana Card</p>
                  </a>
                  <a href={signed[s.id]?.selfie} target="_blank" rel="noreferrer" className="block">
                    {signed[s.id]?.selfie ? (
                      <img src={signed[s.id]?.selfie} alt="Selfie" className="aspect-video rounded-md object-cover" />
                    ) : (
                      <div className="aspect-video rounded-md bg-surface" />
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">Selfie with card</p>
                  </a>
                </div>
                <Textarea
                  rows={2}
                  className="mt-3"
                  placeholder="Reason if rejecting…"
                  value={reasons[s.id] ?? ""}
                  onChange={(e) => setReasons((r) => ({ ...r, [s.id]: e.target.value }))}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => decide(s.id, "rejected")}>
                    Reject
                  </Button>
                  <Button onClick={() => decide(s.id, "approved")}>Approve</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
