/**
 * Marketplace taxonomy — single source of truth for pillars and categories.
 *
 * Backed by the `market_pillars` / `market_categories` / `market_category_synonyms`
 * tables. The frontend reads a snapshot once per session and uses the helpers
 * here for every pillar / category lookup. No file should hardcode pillar or
 * category lists ever again — add a row to the DB instead.
 */
import { supabase } from "@/integrations/supabase/client";

export type PillarSlug = string;

export interface Pillar {
  slug: PillarSlug;
  label: string;
  shortLabel: string;
  iconKey: string | null;
  description: string | null;
  sortOrder: number;
  isMarketplace: boolean;
  requiresExpiry: boolean;
  requiresCondition: boolean;
  requiresLicence: boolean;
}

export interface Category {
  id: string;
  pillarSlug: PillarSlug;
  slug: string;
  label: string;
  iconKey: string | null;
  description: string | null;
  sortOrder: number;
}

export interface Synonym {
  pillarSlug: PillarSlug;
  alias: string;
  canonical: string;
}

export interface Taxonomy {
  pillars: Pillar[];
  categories: Category[];
  synonyms: Synonym[];

  /** All marketplace pillars (where listings live), sorted. */
  marketplacePillars: Pillar[];
  /** Pillar by slug — does not honour synonyms (pillars don't have aliases). */
  getPillar(slug: string | undefined | null): Pillar | null;
  /** Categories under a given pillar, in display order. */
  categoriesFor(pillar: string | undefined | null): Category[];
  /**
   * Resolve a possibly-aliased slug to the canonical category in `pillar`.
   * Returns null when the slug is unknown.
   */
  resolveCategory(pillar: string | undefined | null, slug: string | undefined | null): Category | null;
  /** Just the canonical slug (mirrors the DB `resolve_category_slug` function). */
  canonicalSlug(pillar: string | undefined | null, slug: string | undefined | null): string | null;
  /** Human label for a `(pillar, slug)` pair, falling back to the slug itself. */
  labelFor(pillar: string | undefined | null, slug: string | undefined | null): string;
  /** Icon key for a category; falls back to the pillar icon. */
  iconFor(pillar: string | undefined | null, slug: string | undefined | null): string | null;
}

function buildTaxonomy(
  pillars: Pillar[],
  categories: Category[],
  synonyms: Synonym[],
): Taxonomy {
  const pillarBySlug = new Map(pillars.map((p) => [p.slug, p]));
  const categoriesByPillar = new Map<string, Category[]>();
  for (const c of categories) {
    const list = categoriesByPillar.get(c.pillarSlug) ?? [];
    list.push(c);
    categoriesByPillar.set(c.pillarSlug, list);
  }
  for (const list of categoriesByPillar.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  }
  const synonymKey = (pillar: string, alias: string) => `${pillar}::${alias}`;
  const synonymMap = new Map<string, string>();
  for (const s of synonyms) {
    synonymMap.set(synonymKey(s.pillarSlug, s.alias), s.canonical);
  }

  function categoriesFor(pillar: string | undefined | null) {
    if (!pillar) return [];
    return categoriesByPillar.get(pillar) ?? [];
  }

  function canonicalSlug(pillar: string | undefined | null, slug: string | undefined | null) {
    if (!pillar || !slug) return null;
    const direct = categoriesFor(pillar).find((c) => c.slug === slug);
    if (direct) return direct.slug;
    return synonymMap.get(synonymKey(pillar, slug)) ?? null;
  }

  function resolveCategory(pillar: string | undefined | null, slug: string | undefined | null) {
    const canon = canonicalSlug(pillar, slug);
    if (!canon || !pillar) return null;
    return categoriesFor(pillar).find((c) => c.slug === canon) ?? null;
  }

  return {
    pillars,
    categories,
    synonyms,
    marketplacePillars: pillars.filter((p) => p.isMarketplace),
    getPillar(slug) {
      return slug ? (pillarBySlug.get(slug) ?? null) : null;
    },
    categoriesFor,
    resolveCategory,
    canonicalSlug,
    labelFor(pillar, slug) {
      const cat = resolveCategory(pillar, slug);
      if (cat) return cat.label;
      const p = pillar ? pillarBySlug.get(pillar) : null;
      if (!slug && p) return p.label;
      return slug ?? p?.label ?? "";
    },
    iconFor(pillar, slug) {
      const cat = resolveCategory(pillar, slug);
      if (cat?.iconKey) return cat.iconKey;
      const p = pillar ? pillarBySlug.get(pillar) : null;
      return p?.iconKey ?? null;
    },
  };
}

/**
 * Empty taxonomy used as the initial value before the snapshot resolves.
 * Helpers return `null` / empty lists so render code stays safe during the
 * first paint.
 */
export const EMPTY_TAXONOMY: Taxonomy = buildTaxonomy([], [], []);

let snapshotPromise: Promise<Taxonomy> | null = null;

/**
 * Fetch (and cache) the taxonomy snapshot. Returns the same promise for
 * concurrent callers. Call `refreshTaxonomy()` after admin edits.
 */
export function loadTaxonomy(): Promise<Taxonomy> {
  if (snapshotPromise) return snapshotPromise;
  snapshotPromise = (async () => {
    const [pillarsRes, categoriesRes, synonymsRes] = await Promise.all([
      supabase
        .from("market_pillars")
        .select(
          "slug,label,short_label,icon_key,description,sort_order,is_marketplace,requires_expiry,requires_condition,requires_licence",
        )
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("market_categories")
        .select("id,pillar_slug,slug,label,icon_key,description,sort_order")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("market_category_synonyms")
        .select("pillar_slug,alias_slug,canonical_slug"),
    ]);

    const pillars: Pillar[] = (pillarsRes.data ?? []).map((p) => ({
      slug: p.slug,
      label: p.label,
      shortLabel: p.short_label,
      iconKey: p.icon_key,
      description: p.description,
      sortOrder: p.sort_order,
      isMarketplace: p.is_marketplace,
      requiresExpiry: p.requires_expiry,
      requiresCondition: p.requires_condition,
      requiresLicence: p.requires_licence,
    }));
    const categories: Category[] = (categoriesRes.data ?? []).map((c) => ({
      id: c.id,
      pillarSlug: c.pillar_slug,
      slug: c.slug,
      label: c.label,
      iconKey: c.icon_key,
      description: c.description,
      sortOrder: c.sort_order,
    }));
    const synonyms: Synonym[] = (synonymsRes.data ?? []).map((s) => ({
      pillarSlug: s.pillar_slug,
      alias: s.alias_slug,
      canonical: s.canonical_slug,
    }));

    return buildTaxonomy(pillars, categories, synonyms);
  })();
  return snapshotPromise;
}

export function refreshTaxonomy(): Promise<Taxonomy> {
  snapshotPromise = null;
  return loadTaxonomy();
}
