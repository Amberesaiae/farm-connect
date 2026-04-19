import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---------- Buyer creates a reservation (always pending) ----------
const createInput = z.object({
  batch_id: z.string().uuid(),
  requested_qty: z.number().int().min(1).max(1_000_000),
  pickup_date: z.string().optional().nullable(),
  fulfilment: z.enum(["pickup", "delivery"]).default("pickup"),
  delivery_address: z.string().max(300).optional().nullable(),
  buyer_contact: z.string().max(50).optional().nullable(),
  buyer_note: z.string().max(800).optional().nullable(),
  idempotency_key: z.string().min(8).max(80),
});

export const createReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Validate batch is open and has stock
    const { data: batch, error: bErr } = await supabaseAdmin
      .from("hatchery_batches")
      .select("id, status, available_quantity, min_order_qty, hatchery_id, hatcheries(owner_id, name)")
      .eq("id", data.batch_id)
      .maybeSingle();
    if (bErr) throw new Error(bErr.message);
    if (!batch) throw new Error("Batch not found");
    if (batch.status !== "open")
      throw new Error("Batch is not accepting reservations right now");
    if (data.requested_qty < (batch.min_order_qty ?? 1))
      throw new Error(`Minimum order is ${batch.min_order_qty}`);

    const { data: row, error } = await supabase
      .from("batch_reservations")
      .insert({
        batch_id: data.batch_id,
        buyer_id: userId,
        requested_qty: data.requested_qty,
        pickup_date: data.pickup_date ?? null,
        fulfilment: data.fulfilment,
        delivery_address: data.delivery_address ?? null,
        buyer_contact: data.buyer_contact ?? null,
        buyer_note: data.buyer_note ?? null,
        idempotency_key: data.idempotency_key,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // Notify hatchery owner
    const owner = (batch.hatcheries as unknown as { owner_id: string; name: string } | null);
    if (owner?.owner_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: owner.owner_id,
        type: "reservation_received",
        title: `New reservation for ${owner.name}`,
        body: `${data.requested_qty} units requested`,
        link: "/dashboard/hatchery/bookings",
      });
    }
    return { id: row.id };
  });

// ---------- Hatchery confirms (concurrency-safe via SQL function) ----------
export const confirmReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        reservation_id: z.string().uuid(),
        confirmed_qty: z.number().int().min(1).max(1_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: result, error } = await supabase.rpc("confirm_reservation", {
      _reservation_id: data.reservation_id,
      _confirmed_qty: data.confirmed_qty,
    });
    if (error) throw new Error(error.message);
    const r = result as { ok: boolean; code?: string; available?: number };
    if (!r.ok) {
      if (r.code === "INVENTORY_EXCEEDED") {
        throw new Error(
          `Only ${r.available} units left. Adjust the confirmed quantity or move this buyer to the waitlist.`,
        );
      }
      throw new Error(r.code ?? "Could not confirm");
    }

    // Notify buyer
    const { data: rsv } = await supabaseAdmin
      .from("batch_reservations")
      .select("buyer_id, batch_id")
      .eq("id", data.reservation_id)
      .maybeSingle();
    if (rsv?.buyer_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: rsv.buyer_id,
        type: "reservation_confirmed",
        title: "Your reservation is confirmed",
        body: `${data.confirmed_qty} units locked in.`,
        link: "/dashboard/reservations",
      });
    }
    return { ok: true };
  });

// ---------- Cancel (buyer or hatchery) ----------
export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        reservation_id: z.string().uuid(),
        by_hatchery: z.boolean().default(false),
        reason: z.string().max(500).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: result, error } = await supabase.rpc("cancel_reservation", {
      _reservation_id: data.reservation_id,
      _by_hatchery: data.by_hatchery,
    });
    if (error) throw new Error(error.message);
    const r = result as { ok: boolean; code?: string };
    if (!r.ok) throw new Error(r.code ?? "Could not cancel");

    if (data.reason) {
      await supabaseAdmin
        .from("batch_reservations")
        .update({ hatchery_note: data.by_hatchery ? data.reason : undefined, buyer_note: !data.by_hatchery ? data.reason : undefined })
        .eq("id", data.reservation_id);
    }

    // Notify counter-party
    const { data: rsv } = await supabaseAdmin
      .from("batch_reservations")
      .select("buyer_id, batch_id, hatchery_batches(hatcheries(owner_id, name))")
      .eq("id", data.reservation_id)
      .maybeSingle();
    if (rsv) {
      const owner = (rsv as any).hatchery_batches?.hatcheries;
      const targetUser = data.by_hatchery ? rsv.buyer_id : owner?.owner_id;
      if (targetUser) {
        await supabaseAdmin.from("notifications").insert({
          user_id: targetUser,
          type: "reservation_cancelled",
          title: data.by_hatchery
            ? "Your reservation was cancelled by the hatchery"
            : "A buyer cancelled their reservation",
          body: data.reason ?? null,
          link: data.by_hatchery ? "/dashboard/reservations" : "/dashboard/hatchery/bookings",
        });
      }
    }
    return { ok: true };
  });

// ---------- Waitlist a reservation (hatchery) ----------
export const waitlistReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ reservation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // Authorization via RLS (hatchery owner can update via owns_batch)
    const { supabase } = context;
    const { error } = await supabase
      .from("batch_reservations")
      .update({ status: "waitlisted" })
      .eq("id", data.reservation_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Mark fulfilled (hatchery) ----------
export const fulfillReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ reservation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("batch_reservations")
      .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
      .eq("id", data.reservation_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
