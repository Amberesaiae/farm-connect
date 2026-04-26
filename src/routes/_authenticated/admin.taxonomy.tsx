import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdminGate } from "@/components/layout/AdminGate";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { toast } from "sonner";
import { Plus, Save, RefreshCw } from "lucide-react";
import type {
  AttributeDefinition,
  Category,
  Pillar,
  ResolvedAttribute,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/_authenticated/admin/taxonomy")({
  head: () => ({ meta: [{ title: "Taxonomy — farmlink admin" }] }),
  component: TaxonomyAdmin,
});

function TaxonomyAdmin() {
  const { taxonomy, refresh, loading } = useTaxonomy();
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    setBusy(true);
    await refresh();
    setBusy(false);
  };

  return (
    <AdminGate>
      <AppShell>
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-[28px] font-extrabold tracking-tight">
                Taxonomy
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Single source of truth for pillars, categories, attributes and catalogs.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={reload}
              disabled={busy || loading}
              className="rounded-xl"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
          <div className="mt-5">
            <AdminNav />
          </div>

          <Tabs defaultValue="tree" className="mt-6">
            <TabsList className="flex flex-wrap gap-1.5 bg-card">
              <TabsTrigger value="tree">Tree</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="links">Per-category fields</TabsTrigger>
              <TabsTrigger value="synonyms">Synonyms</TabsTrigger>
              <TabsTrigger value="catalogs">Catalogs</TabsTrigger>
            </TabsList>

            <TabsContent value="tree" className="mt-4">
              <TreePanel onChanged={reload} />
            </TabsContent>
            <TabsContent value="attributes" className="mt-4">
              <AttributesPanel onChanged={reload} />
            </TabsContent>
            <TabsContent value="links" className="mt-4">
              <LinksPanel onChanged={reload} />
            </TabsContent>
            <TabsContent value="synonyms" className="mt-4">
              <SynonymsPanel onChanged={reload} />
            </TabsContent>
            <TabsContent value="catalogs" className="mt-4">
              <CatalogsPanel onChanged={reload} />
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </AdminGate>
  );
}

function Panel({ children, title, action }: { children: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-[1.5px] border-border bg-card p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-[18px] font-extrabold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/* -------------------------------- TREE -------------------------------- */

function TreePanel({ onChanged }: { onChanged: () => void }) {
  const { taxonomy } = useTaxonomy();
  const [pillarSlug, setPillarSlug] = useState<string>(
    taxonomy.marketplacePillars[0]?.slug ?? taxonomy.pillars[0]?.slug ?? "",
  );

  useEffect(() => {
    if (!pillarSlug && taxonomy.pillars[0]) setPillarSlug(taxonomy.pillars[0].slug);
  }, [taxonomy.pillars, pillarSlug]);

  const pillar = taxonomy.getPillar(pillarSlug);
  const cats = taxonomy.categoriesFor(pillarSlug);

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <Panel title="Pillars">
        <ul className="flex flex-col gap-1">
          {taxonomy.pillars.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => setPillarSlug(p.slug)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  pillarSlug === p.slug
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                <div>{p.label}</div>
                <div className="text-[11px] font-normal opacity-80">
                  {p.isMarketplace ? "Marketplace" : "Directory"} · {p.slug}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title={pillar ? `${pillar.label} — categories` : "Categories"}
        action={pillar ? <NewCategoryButton pillar={pillar} onCreated={onChanged} /> : null}
      >
        {cats.length === 0 ? (
          <p className="text-xs text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-1.5">Label</th>
                  <th className="px-2 py-1.5">Slug</th>
                  <th className="px-2 py-1.5 w-20">Sort</th>
                  <th className="px-2 py-1.5 w-24">Listings?</th>
                  <th className="px-2 py-1.5 w-24">Promoted</th>
                  <th className="px-2 py-1.5 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <CategoryRow key={c.id} cat={c} onChanged={onChanged} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function CategoryRow({ cat, onChanged }: { cat: Category; onChanged: () => void }) {
  const [label, setLabel] = useState(cat.label);
  const [sort, setSort] = useState<number>(cat.sortOrder);
  const [accepts, setAccepts] = useState(cat.acceptsListings);
  const [promoted, setPromoted] = useState(cat.isPromoted);
  const [saving, setSaving] = useState(false);

  const dirty =
    label !== cat.label ||
    sort !== cat.sortOrder ||
    accepts !== cat.acceptsListings ||
    promoted !== cat.isPromoted;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("market_categories")
      .update({
        label,
        sort_order: sort,
        accepts_listings: accepts,
        is_promoted: promoted,
      })
      .eq("id", cat.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Saved");
      onChanged();
    }
  };

  return (
    <tr className="border-t border-border">
      <td className="px-2 py-1.5">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-8 rounded-lg" />
      </td>
      <td className="px-2 py-1.5 font-mono text-[11px] text-muted-foreground">{cat.slug}</td>
      <td className="px-2 py-1.5">
        <Input
          type="number"
          value={sort}
          onChange={(e) => setSort(Number(e.target.value))}
          className="h-8 rounded-lg"
        />
      </td>
      <td className="px-2 py-1.5">
        <Checkbox checked={accepts} onCheckedChange={(v) => setAccepts(v === true)} />
      </td>
      <td className="px-2 py-1.5">
        <Checkbox checked={promoted} onCheckedChange={(v) => setPromoted(v === true)} />
      </td>
      <td className="px-2 py-1.5 text-right">
        <Button
          size="sm"
          variant={dirty ? "default" : "outline"}
          disabled={!dirty || saving}
          onClick={save}
          className="h-7 rounded-lg px-2"
        >
          <Save className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function NewCategoryButton({ pillar, onCreated }: { pillar: Pillar; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!label || !slug) return;
    setBusy(true);
    const { error } = await supabase.from("market_categories").insert({
      pillar_slug: pillar.slug,
      slug,
      label,
      sort_order: 100,
      accepts_listings: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Category added");
    setOpen(false);
    setLabel("");
    setSlug("");
    onCreated();
  };

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="rounded-xl">
        <Plus className="mr-1 h-3.5 w-3.5" />
        New
      </Button>
    );
  }
  return (
    <div className="flex items-end gap-2">
      <div>
        <Label className="text-[11px]">Label</Label>
        <Input
          className="h-8 w-40 rounded-lg"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
        />
      </div>
      <div>
        <Label className="text-[11px]">Slug</Label>
        <Input
          className="h-8 w-40 rounded-lg font-mono text-xs"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
        />
      </div>
      <Button size="sm" disabled={busy} onClick={submit} className="rounded-xl">
        Add
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
        Cancel
      </Button>
    </div>
  );
}

/* ----------------------------- ATTRIBUTES ----------------------------- */

function AttributesPanel({ onChanged }: { onChanged: () => void }) {
  const { taxonomy } = useTaxonomy();
  const [filter, setFilter] = useState("");
  const list = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const arr = [...taxonomy.attributes].sort((a, b) => a.key.localeCompare(b.key));
    if (!q) return arr;
    return arr.filter(
      (a) => a.key.includes(q) || a.labelEn.toLowerCase().includes(q) || a.dataType.includes(q),
    );
  }, [taxonomy.attributes, filter]);

  return (
    <Panel
      title={`Attribute definitions (${taxonomy.attributes.length})`}
      action={
        <Input
          placeholder="Search…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 w-48 rounded-xl"
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-1.5">Key</th>
              <th className="px-2 py-1.5">Label</th>
              <th className="px-2 py-1.5 w-28">Type</th>
              <th className="px-2 py-1.5 w-24">Unit</th>
              <th className="px-2 py-1.5 w-32">Reference</th>
              <th className="px-2 py-1.5">Enum / help</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <AttributeRow key={a.id} attr={a} onChanged={onChanged} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Need a brand new attribute key, type or enum? Create it via SQL — UI editing is limited to
        labels and help text to keep validation safe.
      </p>
    </Panel>
  );
}

function AttributeRow({ attr, onChanged }: { attr: AttributeDefinition; onChanged: () => void }) {
  const [label, setLabel] = useState(attr.labelEn);
  const [help, setHelp] = useState(attr.helpText ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = label !== attr.labelEn || (help || "") !== (attr.helpText ?? "");
  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("attribute_definitions")
      .update({ label_en: label, help_text_en: help || null })
      .eq("id", attr.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      onChanged();
    }
  };
  return (
    <tr className="border-t border-border align-top">
      <td className="px-2 py-1.5 font-mono text-[11px]">{attr.key}</td>
      <td className="px-2 py-1.5">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-8 rounded-lg" />
      </td>
      <td className="px-2 py-1.5">
        <Badge variant="outline" className="rounded-md">
          {attr.dataType}
        </Badge>
      </td>
      <td className="px-2 py-1.5 text-xs text-muted-foreground">{attr.unitSlug ?? "—"}</td>
      <td className="px-2 py-1.5 text-xs text-muted-foreground">{attr.referenceTable ?? "—"}</td>
      <td className="px-2 py-1.5">
        <Input
          value={help}
          placeholder={attr.enumValues.length ? attr.enumValues.join(", ") : "Help text"}
          onChange={(e) => setHelp(e.target.value)}
          className="h-8 rounded-lg"
        />
        <div className="mt-1 flex justify-end">
          <Button
            size="sm"
            variant={dirty ? "default" : "outline"}
            disabled={!dirty || saving}
            onClick={save}
            className="h-7 rounded-lg px-2"
          >
            <Save className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------- LINKS -------------------------------- */

function LinksPanel({ onChanged }: { onChanged: () => void }) {
  const { taxonomy } = useTaxonomy();
  const [pillarSlug, setPillarSlug] = useState<string>(
    taxonomy.marketplacePillars[0]?.slug ?? "",
  );
  const [categoryId, setCategoryId] = useState<string>("");
  const cats = taxonomy.categoriesFor(pillarSlug);

  useEffect(() => {
    if (cats[0] && !cats.find((c) => c.id === categoryId)) {
      setCategoryId(cats[0].id);
    }
  }, [pillarSlug, cats, categoryId]);

  const links = taxonomy.attributesFor(categoryId);
  const remaining = useMemo(() => {
    const linked = new Set(links.map((l) => l.attributeId));
    return taxonomy.attributes.filter((a) => !linked.has(a.id));
  }, [links, taxonomy.attributes]);

  return (
    <Panel title="Per-category fields">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-[11px]">Pillar</Label>
          <Select value={pillarSlug} onValueChange={setPillarSlug}>
            <SelectTrigger className="h-8 w-48 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taxonomy.pillars.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px]">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-8 w-64 rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {cats.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-1.5">Attribute</th>
              <th className="px-2 py-1.5 w-20">Order</th>
              <th className="px-2 py-1.5 w-24">Required</th>
              <th className="px-2 py-1.5 w-24">Filterable</th>
              <th className="px-2 py-1.5 w-24">Promoted</th>
              <th className="px-2 py-1.5 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <LinkRow key={l.attributeId} link={l} categoryId={categoryId} onChanged={onChanged} />
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={6} className="px-2 py-3 text-xs text-muted-foreground">
                  No fields linked yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {categoryId && remaining.length > 0 && (
        <AddLinkRow
          categoryId={categoryId}
          options={remaining}
          nextOrder={(links[links.length - 1]?.displayOrder ?? 0) + 10}
          onCreated={onChanged}
        />
      )}
    </Panel>
  );
}

function LinkRow({
  link,
  categoryId,
  onChanged,
}: {
  link: ResolvedAttribute;
  categoryId: string;
  onChanged: () => void;
}) {
  const [order, setOrder] = useState<number>(link.displayOrder);
  const [required, setRequired] = useState(link.isRequired);
  const [filterable, setFilterable] = useState(link.isFilterable);
  const [promoted, setPromoted] = useState(link.isPromoted);
  const [busy, setBusy] = useState(false);

  const dirty =
    order !== link.displayOrder ||
    required !== link.isRequired ||
    filterable !== link.isFilterable ||
    promoted !== link.isPromoted;

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("category_attributes")
      .update({
        display_order: order,
        is_required: required,
        is_filterable: filterable,
        is_promoted: promoted,
      })
      .eq("category_id", categoryId)
      .eq("attribute_id", link.attributeId);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      onChanged();
    }
  };

  const remove = async () => {
    if (!confirm(`Remove "${link.definition.labelEn}" from this category?`)) return;
    setBusy(true);
    const { error } = await supabase
      .from("category_attributes")
      .delete()
      .eq("category_id", categoryId)
      .eq("attribute_id", link.attributeId);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Removed");
      onChanged();
    }
  };

  return (
    <tr className="border-t border-border">
      <td className="px-2 py-1.5">
        <div className="font-medium">{link.definition.labelEn}</div>
        <div className="font-mono text-[10px] text-muted-foreground">
          {link.definition.key} · {link.definition.dataType}
        </div>
      </td>
      <td className="px-2 py-1.5">
        <Input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="h-8 rounded-lg"
        />
      </td>
      <td className="px-2 py-1.5">
        <Checkbox checked={required} onCheckedChange={(v) => setRequired(v === true)} />
      </td>
      <td className="px-2 py-1.5">
        <Checkbox checked={filterable} onCheckedChange={(v) => setFilterable(v === true)} />
      </td>
      <td className="px-2 py-1.5">
        <Checkbox checked={promoted} onCheckedChange={(v) => setPromoted(v === true)} />
      </td>
      <td className="px-2 py-1.5 text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant={dirty ? "default" : "outline"}
            disabled={!dirty || busy}
            onClick={save}
            className="h-7 rounded-lg px-2"
          >
            <Save className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={remove}
            className="h-7 rounded-lg px-2 text-destructive"
          >
            ×
          </Button>
        </div>
      </td>
    </tr>
  );
}

function AddLinkRow({
  categoryId,
  options,
  nextOrder,
  onCreated,
}: {
  categoryId: string;
  options: AttributeDefinition[];
  nextOrder: number;
  onCreated: () => void;
}) {
  const [attrId, setAttrId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!attrId) return;
    setBusy(true);
    const { error } = await supabase.from("category_attributes").insert({
      category_id: categoryId,
      attribute_id: attrId,
      display_order: nextOrder,
      is_required: false,
      is_filterable: false,
      is_promoted: false,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Added");
      setAttrId("");
      onCreated();
    }
  };

  return (
    <div className="mt-3 flex items-end gap-2 border-t border-dashed border-border pt-3">
      <div className="flex-1">
        <Label className="text-[11px]">Add field</Label>
        <Select value={attrId} onValueChange={setAttrId}>
          <SelectTrigger className="h-8 rounded-xl">
            <SelectValue placeholder="Pick attribute" />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.labelEn} · {o.dataType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" disabled={!attrId || busy} onClick={add} className="rounded-xl">
        <Plus className="mr-1 h-3.5 w-3.5" />
        Link
      </Button>
    </div>
  );
}

/* ----------------------------- SYNONYMS ------------------------------- */

function SynonymsPanel({ onChanged }: { onChanged: () => void }) {
  const { taxonomy } = useTaxonomy();
  const [pillarSlug, setPillarSlug] = useState<string>(taxonomy.pillars[0]?.slug ?? "");
  const [alias, setAlias] = useState("");
  const [canonical, setCanonical] = useState("");
  const [busy, setBusy] = useState(false);

  const cats = taxonomy.categoriesFor(pillarSlug);
  const syns = taxonomy.synonyms.filter((s) => s.pillarSlug === pillarSlug);

  const add = async () => {
    if (!alias || !canonical) return;
    setBusy(true);
    const { error } = await supabase.from("market_category_synonyms").insert({
      pillar_slug: pillarSlug,
      alias_slug: slugify(alias),
      canonical_slug: canonical,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Synonym added");
      setAlias("");
      setCanonical("");
      onChanged();
    }
  };

  const remove = async (s: { pillarSlug: string; alias: string }) => {
    const { error } = await supabase
      .from("market_category_synonyms")
      .delete()
      .eq("pillar_slug", s.pillarSlug)
      .eq("alias_slug", s.alias);
    if (error) toast.error(error.message);
    else {
      toast.success("Removed");
      onChanged();
    }
  };

  return (
    <Panel title="Category synonyms">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <Label className="text-[11px]">Pillar</Label>
          <Select value={pillarSlug} onValueChange={setPillarSlug}>
            <SelectTrigger className="h-8 w-48 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taxonomy.pillars.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px]">Alias</Label>
          <Input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="e.g. aponkye"
            className="h-8 w-40 rounded-xl"
          />
        </div>
        <div>
          <Label className="text-[11px]">Canonical</Label>
          <Select value={canonical} onValueChange={setCanonical}>
            <SelectTrigger className="h-8 w-48 rounded-xl">
              <SelectValue placeholder="Pick category" />
            </SelectTrigger>
            <SelectContent>
              {cats.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.label} ({c.slug})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={add} disabled={busy} className="rounded-xl">
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-1.5">Alias</th>
              <th className="px-2 py-1.5">→ Canonical</th>
              <th className="px-2 py-1.5 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {syns.map((s) => (
              <tr key={`${s.pillarSlug}-${s.alias}`} className="border-t border-border">
                <td className="px-2 py-1.5 font-mono text-xs">{s.alias}</td>
                <td className="px-2 py-1.5 font-mono text-xs text-muted-foreground">{s.canonical}</td>
                <td className="px-2 py-1.5 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(s)}
                    className="h-7 rounded-lg px-2 text-destructive"
                  >
                    ×
                  </Button>
                </td>
              </tr>
            ))}
            {syns.length === 0 && (
              <tr>
                <td colSpan={3} className="px-2 py-3 text-xs text-muted-foreground">
                  No synonyms for this pillar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ----------------------------- CATALOGS ------------------------------- */

type CatalogTable = "breeds" | "vaccines" | "feed_brands";

function CatalogsPanel({ onChanged }: { onChanged: () => void }) {
  const [table, setTable] = useState<CatalogTable>("breeds");
  return (
    <Panel
      title="Catalogs"
      action={
        <Select value={table} onValueChange={(v) => setTable(v as CatalogTable)}>
          <SelectTrigger className="h-8 w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breeds">Breeds</SelectItem>
            <SelectItem value="vaccines">Vaccines</SelectItem>
            <SelectItem value="feed_brands">Feed brands</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {table === "breeds" && <BreedsCatalog onChanged={onChanged} />}
      {table === "vaccines" && <VaccinesCatalog onChanged={onChanged} />}
      {table === "feed_brands" && <FeedBrandsCatalog onChanged={onChanged} />}
    </Panel>
  );
}

function CatalogStatusPill({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "pending"
        ? "bg-amber-500/10 text-amber-700"
        : "bg-muted text-muted-foreground";
  return <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{status}</span>;
}

function BreedsCatalog({ onChanged }: { onChanged: () => void }) {
  const { taxonomy } = useTaxonomy();
  const [filter, setFilter] = useState("");
  const list = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const arr = [...taxonomy.breeds].sort((a, b) => a.labelEn.localeCompare(b.labelEn));
    if (!q) return arr;
    return arr.filter((b) => b.labelEn.toLowerCase().includes(q) || b.slug.includes(q));
  }, [taxonomy.breeds, filter]);

  const setStatus = async (id: string, status: "active" | "pending" | "archived") => {
    const { error } = await supabase.from("breeds").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      onChanged();
    }
  };

  return (
    <>
      <Input
        placeholder="Search breeds…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="h-8 w-64 rounded-xl"
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-1.5">Label</th>
              <th className="px-2 py-1.5">Slug</th>
              <th className="px-2 py-1.5">Species</th>
              <th className="px-2 py-1.5">Origin</th>
              <th className="px-2 py-1.5 w-32">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => {
              const cat = taxonomy.categories.find((c) => c.id === b.categoryId);
              return (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-2 py-1.5">{b.labelEn}</td>
                  <td className="px-2 py-1.5 font-mono text-[11px] text-muted-foreground">{b.slug}</td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground">{cat?.label ?? "—"}</td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground">{b.origin ?? "—"}</td>
                  <td className="px-2 py-1.5">
                    <Select
                      defaultValue="active"
                      onValueChange={(v) => setStatus(b.id, v as "active" | "pending" | "archived")}
                    >
                      <SelectTrigger className="h-7 rounded-lg text-xs">
                        <SelectValue placeholder="active" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VaccinesCatalog({ onChanged }: { onChanged: () => void }) {
  const { taxonomy } = useTaxonomy();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-1.5">Label</th>
            <th className="px-2 py-1.5">Disease</th>
            <th className="px-2 py-1.5">Species</th>
            <th className="px-2 py-1.5 w-20">Withdrawal</th>
          </tr>
        </thead>
        <tbody>
          {taxonomy.vaccines.map((v) => (
            <tr key={v.id} className="border-t border-border">
              <td className="px-2 py-1.5">{v.labelEn}</td>
              <td className="px-2 py-1.5 text-xs text-muted-foreground">{v.disease ?? "—"}</td>
              <td className="px-2 py-1.5 text-xs text-muted-foreground">
                {v.targetSpecies.join(", ") || "—"}
              </td>
              <td className="px-2 py-1.5 text-xs">{v.withdrawalDays ?? "—"}</td>
            </tr>
          ))}
          {taxonomy.vaccines.length === 0 && (
            <tr>
              <td colSpan={4} className="px-2 py-3 text-xs text-muted-foreground">
                No vaccines yet — seed via SQL or admin create flow.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Vaccine and feed-brand creation belongs in a dedicated tool — read-only here for now.
      </p>
      {/* keep onChanged referenced so future inline edits are easy to wire */}
      <span className="hidden">{onChanged.length}</span>
    </div>
  );
}

function FeedBrandsCatalog({ onChanged }: { onChanged: () => void }) {
  const { taxonomy } = useTaxonomy();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-1.5">Brand</th>
            <th className="px-2 py-1.5">Manufacturer</th>
          </tr>
        </thead>
        <tbody>
          {taxonomy.feedBrands.map((f) => (
            <tr key={f.id} className="border-t border-border">
              <td className="px-2 py-1.5">{f.labelEn}</td>
              <td className="px-2 py-1.5 text-xs text-muted-foreground">{f.manufacturer ?? "—"}</td>
            </tr>
          ))}
          {taxonomy.feedBrands.length === 0 && (
            <tr>
              <td colSpan={2} className="px-2 py-3 text-xs text-muted-foreground">
                No feed brands yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <span className="hidden">{onChanged.length}</span>
    </div>
  );
}