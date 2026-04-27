import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appErrorResponse } from "@/integrations/supabase/errors";
import { requireAnyRole } from "@/integrations/supabase/role-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Visitor-facing content report. Wraps the SECURITY DEFINER `report_content`
 * RPC (which validates the kind enum and stamps reporter_id from auth.uid()).
 */
const reportInput = z.object({
  kind: z.enum(["listing", "hatchery", "agro_store", "service_profile", "profile"]),
  id: z.string().uuid(),
  reason: z.string().trim().min(2).max(120),
  details: z.string().trim().max(800).optional().nullable(),
});

export const submitReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reportInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: res, error } = await supabase.rpc("report_content", {
      _kind: data.kind,
      _id: data.id,
      _reason: data.reason,
      _details: data.details ?? undefined,
    });
    if (error) throw appErrorResponse({ code: "INTERNAL", message: error.message });
    const r = res as { ok?: boolean; code?: string; id?: string } | null;
    if (!r?.ok) {
      throw appErrorResponse({
        code: r?.code === "UNAUTHENTICATED" ? "UNAUTHENTICATED" : "VALIDATION",
        message: "Could not submit report",
      });
    }
    return { id: r.id };
  });

/* -------------------------------------------------------------------------- */
/*  Staff inbox: list + resolve reports                                        */
/* -------------------------------------------------------------------------- */

export interface ReportRow {
  id: string;
  created_at: string;
  reporter_id: string;
  reporter_name: string | null;
  target_kind: string;
  target_id: string;
  target_label: string | null;
  reason: string;
  details: string | null;
  status: string;
}

const listInput = z.object({
  status: z.enum(["open", "resolved", "dismissed", "all"]).default("open"),
  limit: z.number().int().min(1).max(200).default(100),
});

/**
 * Staff-only inbox of user-submitted reports. Joins reporter display name and
 * a best-effort target label so moderators see "Listing: Live cockerels —
 * Greater Accra" instead of a bare UUID.
 */
export const listReports = createServerFn({ method: "POST" })
  .middleware([requireAnyRole(["admin", "moderator"])])
  .inputValidator((d: unknown) => listInput.parse(d))
  .handler(async ({ data }): Promise<{ reports: ReportRow[] }> => {
    let q = supabaseAdmin
      .from("reports")
      .select("id, created_at, reporter_id, target_kind, target_id, reason, details, status")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const reporterIds = Array.from(new Set((rows ?? []).map((r) => r.reporter_id)));
    const { data: reporters } = reporterIds.length
      ? await supabaseAdmin.from("profiles").select("id, display_name").in("id", reporterIds)
      : { data: [] as { id: string; display_name: string }[] };
    const nameById = new Map(reporters?.map((p) => [p.id, p.display_name]) ?? []);

    // Best-effort label lookup per kind
    const groups = new Map<string, string[]>();
    for (const r of rows ?? []) {
      const arr = groups.get(r.target_kind) ?? [];
      arr.push(r.target_id);
      groups.set(r.target_kind, arr);
    }
    const labelById = new Map<string, string>();
    if (groups.get("listing")?.length) {
      const { data } = await supabaseAdmin
        .from("listings").select("id, title").in("id", groups.get("listing")!);
      data?.forEach((d) => labelById.set(`listing:${d.id}`, d.title));
    }
    if (groups.get("hatchery")?.length) {
      const { data } = await supabaseAdmin
        .from("hatcheries").select("id, name").in("id", groups.get("hatchery")!);
      data?.forEach((d) => labelById.set(`hatchery:${d.id}`, d.name));
    }
    if (groups.get("agro_store")?.length) {
      const { data } = await supabaseAdmin
        .from("agro_vendor_stores").select("id, business_name").in("id", groups.get("agro_store")!);
      data?.forEach((d) => labelById.set(`agro_store:${d.id}`, d.business_name));
    }
    if (groups.get("service_profile")?.length) {
      const { data } = await supabaseAdmin
        .from("service_profiles").select("id, business_name").in("id", groups.get("service_profile")!);
      data?.forEach((d) => labelById.set(`service_profile:${d.id}`, d.business_name));
    }
    if (groups.get("profile")?.length) {
      const { data } = await supabaseAdmin
        .from("profiles").select("id, display_name").in("id", groups.get("profile")!);
      data?.forEach((d) => labelById.set(`profile:${d.id}`, d.display_name));
    }

    const reports: ReportRow[] = (rows ?? []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      reporter_id: r.reporter_id,
      reporter_name: nameById.get(r.reporter_id) ?? null,
      target_kind: r.target_kind,
      target_id: r.target_id,
      target_label: labelById.get(`${r.target_kind}:${r.target_id}`) ?? null,
      reason: r.reason,
      details: r.details,
      status: r.status,
    }));
    return { reports };
  });

const resolveInput = z.object({
  report_id: z.string().uuid(),
  action: z.enum(["resolve", "dismiss"]),
  note: z.string().max(500).optional().nullable(),
});

export const resolveReport = createServerFn({ method: "POST" })
  .middleware([requireAnyRole(["admin", "moderator"])])
  .inputValidator((d: unknown) => resolveInput.parse(d))
  .handler(async ({ data, context }) => {
    const status = data.action === "resolve" ? "resolved" : "dismissed";
    const { error } = await supabaseAdmin
      .from("reports")
      .update({
        status,
        resolution_note: data.note ?? null,
        resolved_by: context.userId,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", data.report_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------------------------------------------------- */
/*  Abuse-signals snapshot                                                    */
/* -------------------------------------------------------------------------- */

export interface AbuseSnapshot {
  open_reports: number;
  reports_24h: number;
  pending_verifications: number;
  pending_hatcheries: number;
  pending_stores: number;
  hidden_listings: number;
  suspended_users: number;
}

export const getAbuseSnapshot = createServerFn({ method: "GET" })
  .middleware([requireAnyRole(["admin", "moderator"])])
  .handler(async (): Promise<AbuseSnapshot> => {
    const since24 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const counts = await Promise.all([
      supabaseAdmin.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabaseAdmin.from("reports").select("id", { count: "exact", head: true }).gte("created_at", since24),
      supabaseAdmin.from("verification_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("hatcheries").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      supabaseAdmin.from("agro_vendor_stores").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      supabaseAdmin.from("listings").select("id", { count: "exact", head: true }).eq("status", "hidden"),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    ]);
    return {
      open_reports: counts[0].count ?? 0,
      reports_24h: counts[1].count ?? 0,
      pending_verifications: counts[2].count ?? 0,
      pending_hatcheries: counts[3].count ?? 0,
      pending_stores: counts[4].count ?? 0,
      hidden_listings: counts[5].count ?? 0,
      suspended_users: counts[6].count ?? 0,
    };
  });

/* -------------------------------------------------------------------------- */
/*  Audit log viewer                                                          */
/* -------------------------------------------------------------------------- */

export interface AuditRow {
  id: number;
  created_at: string;
  actor_id: string;
  actor_name: string | null;
  action: string;
  target_type: string;
  target_id: string;
  reason: string | null;
}

const auditInput = z.object({
  limit: z.number().int().min(1).max(500).default(100),
  target_type: z.string().max(60).optional().nullable(),
});

export const listAuditLog = createServerFn({ method: "POST" })
  .middleware([requireAnyRole(["admin", "moderator"])])
  .inputValidator((d: unknown) => auditInput.parse(d))
  .handler(async ({ data }): Promise<{ rows: AuditRow[] }> => {
    let q = supabaseAdmin
      .from("admin_audit_logs")
      .select("id, created_at, actor_id, action, target_type, target_id, reason")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.target_type) q = q.eq("target_type", data.target_type);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const actorIds = Array.from(new Set((rows ?? []).map((r) => r.actor_id)));
    const { data: actors } = actorIds.length
      ? await supabaseAdmin.from("profiles").select("id, display_name").in("id", actorIds)
      : { data: [] as { id: string; display_name: string }[] };
    const nameById = new Map(actors?.map((a) => [a.id, a.display_name]) ?? []);

    return {
      rows: (rows ?? []).map((r) => ({
        id: r.id,
        created_at: r.created_at,
        actor_id: r.actor_id,
        actor_name: nameById.get(r.actor_id) ?? null,
        action: r.action,
        target_type: r.target_type,
        target_id: r.target_id,
        reason: r.reason,
      })),
    };
  });