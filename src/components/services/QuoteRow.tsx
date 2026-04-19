import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuoteStatusPill } from "./QuoteStatusPill";
import { useServerFn } from "@tanstack/react-start";
import {
  declineServiceRequest,
  respondServiceRequest,
} from "@/server/service-requests.functions";
import { toast } from "sonner";
import { formatGhs, formatRelative } from "@/lib/format";
import type { QuoteStatus } from "@/lib/quote-status";

export interface QuoteRowData {
  id: string;
  status: QuoteStatus;
  service_type: string;
  region: string;
  district: string | null;
  preferred_date: string | null;
  preferred_window: string | null;
  budget_min_ghs: number | string | null;
  budget_max_ghs: number | string | null;
  notes: string | null;
  buyer_contact: string | null;
  provider_response: string | null;
  responded_price_ghs: number | string | null;
  created_at: string;
  buyer_name?: string | null;
}

export function QuoteRow({
  row,
  onChanged,
  perspective,
}: {
  row: QuoteRowData;
  onChanged: () => void;
  perspective: "provider" | "buyer";
}) {
  const respond = useServerFn(respondServiceRequest);
  const decline = useServerFn(declineServiceRequest);
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!response.trim()) return toast.error("Write a response");
    setBusy(true);
    try {
      await respond({
        data: {
          request_id: row.id,
          response: response.trim(),
          responded_price_ghs: price ? Number(price) : null,
        },
      });
      toast.success("Response sent");
      setOpen(false);
      setResponse("");
      setPrice("");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const doDecline = async () => {
    if (!confirm("Decline this request?")) return;
    setBusy(true);
    try {
      await decline({ data: { request_id: row.id } });
      toast.success("Declined");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border-[1.5px] border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-extrabold tracking-tight">
            {row.service_type}
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {perspective === "provider" && row.buyer_name ? `${row.buyer_name} · ` : ""}
            {row.district ? `${row.district}, ` : ""}
            {row.region} · {formatRelative(row.created_at)}
          </p>
        </div>
        <QuoteStatusPill status={row.status} />
      </div>

      {row.notes ? (
        <p className="mt-3 rounded-lg bg-surface p-2.5 text-[12.5px] text-foreground/85">
          {row.notes}
        </p>
      ) : null}

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        {row.preferred_date ? (
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Preferred
            </dt>
            <dd>
              {new Date(row.preferred_date).toLocaleDateString()}
              {row.preferred_window ? ` · ${row.preferred_window}` : ""}
            </dd>
          </div>
        ) : null}
        {row.budget_min_ghs || row.budget_max_ghs ? (
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Budget
            </dt>
            <dd className="font-mono">
              {row.budget_min_ghs ? formatGhs(row.budget_min_ghs) : "—"} –{" "}
              {row.budget_max_ghs ? formatGhs(row.budget_max_ghs) : "—"}
            </dd>
          </div>
        ) : null}
        {perspective === "provider" && row.buyer_contact ? (
          <div className="col-span-2">
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Buyer phone
            </dt>
            <dd className="font-mono">{row.buyer_contact}</dd>
          </div>
        ) : null}
      </dl>

      {row.provider_response ? (
        <div className="mt-3 rounded-lg border-l-4 border-primary bg-primary-soft/40 p-2.5">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-primary">
            Provider reply{row.responded_price_ghs ? ` · ${formatGhs(row.responded_price_ghs)}` : ""}
          </p>
          <p className="mt-1 text-[12.5px] text-foreground">{row.provider_response}</p>
        </div>
      ) : null}

      {perspective === "provider" &&
        (row.status === "submitted" || row.status === "viewed") && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setOpen(true)} className="rounded-lg">
              Respond with quote
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={doDecline}
              disabled={busy}
              className="rounded-lg text-destructive hover:text-destructive"
            >
              Decline
            </Button>
          </div>
        )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="qprice">Quote (GH₵)</Label>
              <Input
                id="qprice"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="qresp">Response *</Label>
              <Textarea
                id="qresp"
                rows={5}
                maxLength={2000}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Confirm scope, availability, and any conditions."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "Sending…" : "Send response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
