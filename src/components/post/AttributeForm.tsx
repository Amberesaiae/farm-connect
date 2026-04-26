/**
 * Generic per-category attribute form. Renders inputs derived from
 * `category_attributes` + `attribute_definitions`, so adding a new attribute
 * to a category in the DB instantly shows up in the post wizard with no code
 * changes here.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaxonomy, type Taxonomy } from "@/lib/taxonomy-context";
import type { ResolvedAttribute } from "@/lib/taxonomy";

export type AttributesValue = Record<string, unknown>;

interface Props {
  categoryId: string | null;
  value: AttributesValue;
  onChange: (next: AttributesValue) => void;
}

function humanise(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function unitLabel(taxonomy: Taxonomy, unitSlug: string | null) {
  if (!unitSlug) return null;
  return taxonomy.unit(unitSlug)?.labelEn ?? unitSlug;
}

function referenceOptions(
  taxonomy: Taxonomy,
  attr: ResolvedAttribute,
  context: { categoryId: string | null },
): { value: string; label: string }[] {
  const ref = attr.definition.referenceTable;
  if (ref === "breeds") {
    return taxonomy
      .breedsForCategory(context.categoryId)
      .map((b) => ({ value: b.slug, label: b.labelEn }));
  }
  if (ref === "vaccines") {
    return taxonomy.vaccines.map((v) => ({ value: v.slug, label: v.labelEn }));
  }
  if (ref === "feed_brands") {
    return taxonomy.feedBrands.map((f) => ({ value: f.slug, label: f.labelEn }));
  }
  return [];
}

export function AttributeForm({ categoryId, value, onChange }: Props) {
  const { taxonomy } = useTaxonomy();
  const attrs = taxonomy.attributesFor(categoryId);

  if (attrs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        Pick a subcategory above to fill in the right details.
      </p>
    );
  }

  const set = (key: string, v: unknown) => {
    const next = { ...value };
    if (v === "" || v === undefined || v === null) delete next[key];
    else next[key] = v;
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {attrs.map((attr) => {
        const def = attr.definition;
        const id = `attr-${def.key}`;
        const label = (
          <Label htmlFor={id} className="flex items-center gap-1">
            <span>{def.labelEn || humanise(def.key)}</span>
            {attr.isRequired && <span className="text-destructive">*</span>}
            {def.unitSlug && (
              <span className="text-[10px] font-normal text-muted-foreground">
                ({unitLabel(taxonomy, def.unitSlug)})
              </span>
            )}
          </Label>
        );
        const help = def.helpText ? (
          <p className="mt-1 text-[11px] text-muted-foreground">{def.helpText}</p>
        ) : null;
        const cur = value[def.key];

        let control: React.ReactNode = null;
        switch (def.dataType) {
          case "text":
            control = (
              <Input
                id={id}
                value={typeof cur === "string" ? cur : ""}
                onChange={(e) => set(def.key, e.target.value)}
                className="mt-1.5 rounded-xl"
                maxLength={120}
              />
            );
            break;
          case "integer":
          case "decimal":
            control = (
              <Input
                id={id}
                type="number"
                step={def.dataType === "decimal" ? "0.01" : "1"}
                value={cur === undefined || cur === null ? "" : String(cur)}
                onChange={(e) => set(def.key, e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            );
            break;
          case "date":
            control = (
              <Input
                id={id}
                type="date"
                value={typeof cur === "string" ? cur : ""}
                onChange={(e) => set(def.key, e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            );
            break;
          case "boolean":
            control = (
              <div className="mt-2 flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={cur === true}
                  onCheckedChange={(v) => set(def.key, v === true)}
                />
                <span className="text-xs text-muted-foreground">Yes</span>
              </div>
            );
            break;
          case "enum": {
            const opts = def.enumValues;
            control = (
              <Select
                value={typeof cur === "string" ? cur : undefined}
                onValueChange={(v) => set(def.key, v)}
              >
                <SelectTrigger id={id} className="mt-1.5 w-full rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {opts.map((o) => (
                    <SelectItem key={o} value={o}>
                      {humanise(o)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
            break;
          }
          case "reference": {
            const opts = referenceOptions(taxonomy, attr, { categoryId });
            control = (
              <Select
                value={typeof cur === "string" ? cur : undefined}
                onValueChange={(v) => set(def.key, v)}
              >
                <SelectTrigger id={id} className="mt-1.5 w-full rounded-xl">
                  <SelectValue placeholder={opts.length ? "Select" : "No options yet"} />
                </SelectTrigger>
                <SelectContent>
                  {opts.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
            break;
          }
        }

        const span = def.dataType === "text" || def.dataType === "reference" ? "sm:col-span-2" : "";
        return (
          <div key={def.key} className={span}>
            {label}
            {control}
            {help}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Returns an error string when a required attribute is missing, else null.
 * Server-side trigger does the authoritative check; this is just for instant
 * UX feedback in the wizard.
 */
export function validateAttributes(
  attrs: ResolvedAttribute[],
  values: AttributesValue,
): string | null {
  for (const a of attrs) {
    if (!a.isRequired) continue;
    const v = values[a.definition.key];
    if (v === undefined || v === null || v === "") {
      return `${a.definition.labelEn || a.definition.key} is required`;
    }
  }
  return null;
}