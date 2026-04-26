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
  acceptsVendorStores: boolean;
  hasDirectory: boolean;
  defaultUnitSlug: string | null;
  allowedUnits: string[];
}

export interface Category {
  id: string;
  pillarSlug: PillarSlug;
  slug: string;
  label: string;
  iconKey: string | null;
  description: string | null;
  sortOrder: number;
  parentId: string | null;
  isPromoted: boolean;
  acceptsListings: boolean;
  status: string;
}

export interface Synonym {
  pillarSlug: PillarSlug;
  alias: string;
  canonical: string;
}

export type AttributeDataType =
  | "text"
  | "integer"
  | "decimal"
  | "enum"
  | "date"
  | "boolean"
  | "reference";

export interface AttributeDefinition {
  id: string;
  key: string;
  labelEn: string;
  dataType: AttributeDataType;
  unitSlug: string | null;
  enumValues: string[];
  referenceTable: string | null;
  validation: Record<string, unknown>;
  helpText: string | null;
}

export interface CategoryAttributeLink {
  categoryId: string;
  attributeId: string;
  isRequired: boolean;
  isFilterable: boolean;
  isPromoted: boolean;
  displayOrder: number;
  defaultValue: unknown;
}

export interface Unit {
  slug: string;
  labelEn: string;
  kind: string;
  sortOrder: number;
}

export interface BreedEntry {
  id: string;
  slug: string;
  labelEn: string;
  categoryId: string;
  origin: string | null;
}

export interface VaccineEntry {
  id: string;
  slug: string;
  labelEn: string;
  disease: string | null;
  targetSpecies: string[];
  withdrawalDays: number | null;
}

export interface FeedBrandEntry {
  id: string;
  slug: string;
  labelEn: string;
  manufacturer: string | null;
}

/** Attribute + its metadata for rendering inside a category. */
export interface ResolvedAttribute extends CategoryAttributeLink {
  definition: AttributeDefinition;
}

export interface Taxonomy {
  pillars: Pillar[];
  categories: Category[];
  synonyms: Synonym[];
  attributes: AttributeDefinition[];
  categoryAttributes: CategoryAttributeLink[];
  units: Unit[];
  breeds: BreedEntry[];
  vaccines: VaccineEntry[];
  feedBrands: FeedBrandEntry[];

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
  /** Attribute definition by key. */
  attribute(key: string): AttributeDefinition | null;
  /** Resolved attributes for a category id, in display order. */
  attributesFor(categoryId: string | null | undefined): ResolvedAttribute[];
  /** Filterable attributes for a category id, in display order. */
  filterableFor(categoryId: string | null | undefined): ResolvedAttribute[];
  /** Unit by slug. */
  unit(slug: string | null | undefined): Unit | null;
  /** Breeds for a livestock species (category slug like "cattle"). */
  breedsForCategory(categoryId: string | null | undefined): BreedEntry[];
}

function buildTaxonomy(
  pillars: Pillar[],
  categories: Category[],
  synonyms: Synonym[],
  attributes: AttributeDefinition[],
  categoryAttributes: CategoryAttributeLink[],
  units: Unit[],
  breeds: BreedEntry[],
  vaccines: VaccineEntry[],
  feedBrands: FeedBrandEntry[],
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
  const attributeByKey = new Map(attributes.map((a) => [a.key, a]));
  const attributeById = new Map(attributes.map((a) => [a.id, a]));
  const linksByCategory = new Map<string, CategoryAttributeLink[]>();
  for (const link of categoryAttributes) {
    const list = linksByCategory.get(link.categoryId) ?? [];
    list.push(link);
    linksByCategory.set(link.categoryId, list);
  }
  for (const list of linksByCategory.values()) {
    list.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  const unitBySlug = new Map(units.map((u) => [u.slug, u]));
  const breedsByCategory = new Map<string, BreedEntry[]>();
  for (const b of breeds) {
    const list = breedsByCategory.get(b.categoryId) ?? [];
    list.push(b);
    breedsByCategory.set(b.categoryId, list);
  }
  for (const list of breedsByCategory.values()) {
    list.sort((a, b) => a.labelEn.localeCompare(b.labelEn));
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

  function resolveAttributes(categoryId: string | null | undefined): ResolvedAttribute[] {
    if (!categoryId) return [];
    const links = linksByCategory.get(categoryId) ?? [];
    return links
      .map((l) => {
        const def = attributeById.get(l.attributeId);
        return def ? { ...l, definition: def } : null;
      })
      .filter((x): x is ResolvedAttribute => x !== null);
  }

  return {
    pillars,
    categories,
    synonyms,
    attributes,
    categoryAttributes,
    units,
    breeds,
    vaccines,
    feedBrands,
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
    attribute(key) {
      return attributeByKey.get(key) ?? null;
    },
    attributesFor: resolveAttributes,
    filterableFor(categoryId) {
      return resolveAttributes(categoryId).filter((a) => a.isFilterable);
    },
    unit(slug) {
      return slug ? (unitBySlug.get(slug) ?? null) : null;
    },
    breedsForCategory(categoryId) {
      return categoryId ? (breedsByCategory.get(categoryId) ?? []) : [];
    },
  };
}

/**
 * Empty taxonomy used as the initial value before the snapshot resolves.
 * Helpers return `null` / empty lists so render code stays safe during the
 * first paint.
 */
export const EMPTY_TAXONOMY: Taxonomy = buildTaxonomy([], [], [], [], [], [], [], [], []);

let snapshotPromise: Promise<Taxonomy> | null = null;

/**
 * Fetch (and cache) the taxonomy snapshot. Returns the same promise for
 * concurrent callers. Call `refreshTaxonomy()` after admin edits.
 */
export function loadTaxonomy(): Promise<Taxonomy> {
  if (snapshotPromise) return snapshotPromise;
  snapshotPromise = (async () => {
    const [
      pillarsRes,
      categoriesRes,
      synonymsRes,
      attributesRes,
      catAttrsRes,
      unitsRes,
      breedsRes,
      vaccinesRes,
      feedBrandsRes,
    ] = await Promise.all([
      supabase
        .from("market_pillars")
        .select(
          "slug,label,short_label,icon_key,description,sort_order,is_marketplace,requires_expiry,requires_condition,requires_licence,accepts_vendor_stores,has_directory,default_unit_slug,allowed_units",
        )
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("market_categories")
        .select(
          "id,pillar_slug,slug,label,icon_key,description,sort_order,parent_id,is_promoted,accepts_listings,status",
        )
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("market_category_synonyms")
        .select("pillar_slug,alias_slug,canonical_slug"),
      supabase
        .from("attribute_definitions")
        .select(
          "id,key,label_en,data_type,unit_slug,enum_values,reference_table,validation,help_text_en",
        )
        .eq("is_active", true),
      supabase
        .from("category_attributes")
        .select(
          "category_id,attribute_id,is_required,is_filterable,is_promoted,display_order,default_value",
        ),
      supabase
        .from("units")
        .select("slug,label_en,kind,sort_order")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("breeds")
        .select("id,slug,label_en,category_id,origin")
        .eq("status", "active"),
      supabase
        .from("vaccines")
        .select("id,slug,label_en,disease,target_species,withdrawal_days")
        .eq("status", "active"),
      supabase
        .from("feed_brands")
        .select("id,slug,label_en,manufacturer")
        .eq("status", "active"),
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
      acceptsVendorStores: p.accepts_vendor_stores,
      hasDirectory: p.has_directory,
      defaultUnitSlug: p.default_unit_slug,
      allowedUnits: p.allowed_units ?? [],
    }));
    const categories: Category[] = (categoriesRes.data ?? []).map((c) => ({
      id: c.id,
      pillarSlug: c.pillar_slug,
      slug: c.slug,
      label: c.label,
      iconKey: c.icon_key,
      description: c.description,
      sortOrder: c.sort_order,
      parentId: c.parent_id,
      isPromoted: c.is_promoted,
      acceptsListings: c.accepts_listings,
      status: c.status,
    }));
    const synonyms: Synonym[] = (synonymsRes.data ?? []).map((s) => ({
      pillarSlug: s.pillar_slug,
      alias: s.alias_slug,
      canonical: s.canonical_slug,
    }));
    const attributes: AttributeDefinition[] = (attributesRes.data ?? []).map((a) => ({
      id: a.id,
      key: a.key,
      labelEn: a.label_en,
      dataType: a.data_type as AttributeDataType,
      unitSlug: a.unit_slug,
      enumValues: a.enum_values ?? [],
      referenceTable: a.reference_table,
      validation: (a.validation as Record<string, unknown>) ?? {},
      helpText: a.help_text_en,
    }));
    const categoryAttributes: CategoryAttributeLink[] = (catAttrsRes.data ?? []).map((c) => ({
      categoryId: c.category_id,
      attributeId: c.attribute_id,
      isRequired: c.is_required,
      isFilterable: c.is_filterable,
      isPromoted: c.is_promoted,
      displayOrder: c.display_order,
      defaultValue: c.default_value,
    }));
    const units: Unit[] = (unitsRes.data ?? []).map((u) => ({
      slug: u.slug,
      labelEn: u.label_en,
      kind: u.kind,
      sortOrder: u.sort_order,
    }));
    const breeds: BreedEntry[] = (breedsRes.data ?? []).map((b) => ({
      id: b.id,
      slug: b.slug,
      labelEn: b.label_en,
      categoryId: b.category_id,
      origin: b.origin,
    }));
    const vaccines: VaccineEntry[] = (vaccinesRes.data ?? []).map((v) => ({
      id: v.id,
      slug: v.slug,
      labelEn: v.label_en,
      disease: v.disease,
      targetSpecies: v.target_species ?? [],
      withdrawalDays: v.withdrawal_days,
    }));
    const feedBrands: FeedBrandEntry[] = (feedBrandsRes.data ?? []).map((f) => ({
      id: f.id,
      slug: f.slug,
      labelEn: f.label_en,
      manufacturer: f.manufacturer,
    }));

    return buildTaxonomy(
      pillars,
      categories,
      synonyms,
      attributes,
      categoryAttributes,
      units,
      breeds,
      vaccines,
      feedBrands,
    );
  })();
  return snapshotPromise;
}

export function refreshTaxonomy(): Promise<Taxonomy> {
  snapshotPromise = null;
  return loadTaxonomy();
}
