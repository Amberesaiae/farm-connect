import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireGate } from "@/integrations/supabase/role-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

const upsertInput = z.object({
  id: z.string().uuid().optional(),
  business_name: z.string().trim().min(2).max(120),
  category: z.string().min(1).max(40),
  blurb: z.string().max(800).optional().nullable(),
  coverage_regions: z.array(z.string().max(60)).max(16).default([]),
  coverage_districts: z.array(z.string().max(60)).max(40).default([]),
  pricing_model: z.string().max(60).optional().nullable(),
  base_rate_ghs: z.number().nonnegative().optional().nullable(),
  whatsapp_e164: z.string().max(20).optional().nullable(),
  email: z.string().email().max(120).optional().nullable(),
  cover_path: z.string().max(300).optional().nullable(),
  is_active: z.boolean().default(true),
});

export const upsertServiceProfile = createServerFn({ method: "POST" })
  .middleware([requireGate("id_verified")])
  .inputValidator((d: unknown) => upsertInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;

    if (id) {
      const { error } = await supabase
        .from("service_profiles")
        .update(rest)
        .eq("id", id)
        .eq("owner_id", userId);
      if (error) throw new Error(error.message);
      return { id };
    }

    let slug = slugify(data.business_name);
    if (!slug) slug = `provider-${Date.now()}`;
    const { data: existing } = await supabaseAdmin
      .from("service_profiles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const { data: row, error } = await supabase
      .from("service_profiles")
      .insert({ ...rest, slug, owner_id: userId })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);

    // Add 'provider' role
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("roles")
      .eq("id", userId)
      .maybeSingle();
    const roles = new Set<string>(prof?.roles ?? ["buyer"]);
    roles.add("provider");
    await supabaseAdmin.from("profiles").update({ roles: Array.from(roles) }).eq("id", userId);

    return { id: row.id, slug: row.slug };
  });
