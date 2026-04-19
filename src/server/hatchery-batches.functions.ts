import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const upsertInput = z.object({
  id: z.string().uuid().optional(),
  hatchery_id: z.string().uuid(),
  batch_type: z.string().min(1).max(60),
  breed: z.string().max(60).optional().nullable(),
  hatch_date: z.string().optional().nullable(), // ISO date
  pickup_start_date: z.string(),
  pickup_end_date: z.string(),
  total_quantity: z.number().int().min(1).max(10_000_000),
  min_order_qty: z.number().int().min(1).max(10_000_000).default(1),
  price_per_unit: z.number().nonnegative().max(10_000_000),
  unit_label: z.string().min(1).max(20).default("chick"),
  region: z.string().min(1).max(60),
  allows_pickup: z.boolean().default(true),
  allows_delivery: z.boolean().default(false),
  notes: z.string().max(1000).optional().nullable(),
  status: z.enum(["draft", "open", "full", "closed", "cancelled"]).default("open"),
});

async function assertOwnsHatchery(userId: string, hatcheryId: string) {
  const { data } = await supabaseAdmin
    .from("hatcheries")
    .select("owner_id")
    .eq("id", hatcheryId)
    .maybeSingle();
  if (!data || data.owner_id !== userId) throw new Error("Forbidden");
}

export const upsertBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsHatchery(context.userId, data.hatchery_id);
    const { id, ...patch } = data;
    if (id) {
      const { error } = await supabaseAdmin
        .from("hatchery_batches")
        .update(patch)
        .eq("id", id)
        .eq("hatchery_id", data.hatchery_id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("hatchery_batches")
      .insert(patch)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const closeBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        batch_id: z.string().uuid(),
        action: z.enum(["close", "cancel", "reopen"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: batch } = await supabaseAdmin
      .from("hatchery_batches")
      .select("hatchery_id")
      .eq("id", data.batch_id)
      .maybeSingle();
    if (!batch) throw new Error("Not found");
    await assertOwnsHatchery(context.userId, batch.hatchery_id);
    const next = data.action === "close" ? "closed" : data.action === "cancel" ? "cancelled" : "open";
    const { error } = await supabaseAdmin
      .from("hatchery_batches")
      .update({ status: next })
      .eq("id", data.batch_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
