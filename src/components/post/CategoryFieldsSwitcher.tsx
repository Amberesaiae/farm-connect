import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type TopCategory } from "@/lib/categories";
import { useTaxonomy } from "@/lib/taxonomy-context";
import { SEX_OPTIONS } from "@/lib/constants";

export interface CategoryFieldsValue {
  // livestock
  breed?: string;
  age_months?: string | number;
  sex?: "" | "male" | "female" | "mixed";
  weight_kg?: string | number;
  // shared
  subcategory_slug?: string;
  // agrofeed/agromed
  brand?: string;
  pack_size?: string;
  expires_on?: string; // YYYY-MM-DD
  active_ingredient?: string;
  dosage?: string;
  // equipment
  condition?: "" | "new" | "used";
  model?: string;
}

interface Props {
  topCategory: TopCategory;
  value: CategoryFieldsValue;
  onChange: (patch: Partial<CategoryFieldsValue>) => void;
}

/**
 * Renders the right field set for each top_category. Keeps validation
 * (required `expires_on` for veterinary, required `condition` for equipment)
 * visually obvious through `*` markers — the server enforces the rule.
 */
export function CategoryFieldsSwitcher({ topCategory, value, onChange }: Props) {
  const { taxonomy } = useTaxonomy();
  const subs = taxonomy.categoriesFor(topCategory);
  const pillar = taxonomy.getPillar(topCategory);
  const requireExpiry = pillar?.requiresExpiry ?? false;
  const requireCondition = pillar?.requiresCondition ?? false;

  return (
    <div className="space-y-4">
      <div>
        <Label>Subcategory</Label>
        <Select
          value={value.subcategory_slug || undefined}
          onValueChange={(v) => onChange({ subcategory_slug: v })}
        >
          <SelectTrigger className="mt-1.5 w-full rounded-xl">
            <SelectValue placeholder="Pick a subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subs.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {topCategory === "livestock" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={value.breed ?? ""}
                onChange={(e) => onChange({ breed: e.target.value })}
                className="mt-1.5 rounded-xl"
                maxLength={60}
              />
            </div>
            <div>
              <Label htmlFor="age">Age (months)</Label>
              <Input
                id="age"
                type="number"
                value={value.age_months ?? ""}
                onChange={(e) => onChange({ age_months: e.target.value })}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Sex</Label>
              <Select
                value={value.sex || "unset"}
                onValueChange={(v) =>
                  onChange({ sex: v === "unset" ? "" : (v as "male" | "female" | "mixed") })
                }
              >
                <SelectTrigger className="mt-1.5 w-full rounded-xl">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">—</SelectItem>
                  {SEX_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="wkg">Weight (kg)</Label>
              <Input
                id="wkg"
                type="number"
                step="0.1"
                value={value.weight_kg ?? ""}
                onChange={(e) => onChange({ weight_kg: e.target.value })}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>
        </>
      )}

      {topCategory === "agrofeed_supplements" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={value.brand ?? ""}
                onChange={(e) => onChange({ brand: e.target.value })}
                className="mt-1.5 rounded-xl"
                maxLength={60}
              />
            </div>
            <div>
              <Label htmlFor="ps">Pack size</Label>
              <Input
                id="ps"
                value={value.pack_size ?? ""}
                onChange={(e) => onChange({ pack_size: e.target.value })}
                placeholder="e.g. 50 kg bag"
                className="mt-1.5 rounded-xl"
                maxLength={40}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="exp">Expiry date (optional)</Label>
            <Input
              id="exp"
              type="date"
              value={value.expires_on ?? ""}
              onChange={(e) => onChange({ expires_on: e.target.value })}
              className="mt-1.5 rounded-xl"
            />
          </div>
        </>
      )}

      {topCategory === "agromed_veterinary" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ai">Active ingredient</Label>
              <Input
                id="ai"
                value={value.active_ingredient ?? ""}
                onChange={(e) => onChange({ active_ingredient: e.target.value })}
                className="mt-1.5 rounded-xl"
                maxLength={80}
              />
            </div>
            <div>
              <Label htmlFor="dose">Dosage</Label>
              <Input
                id="dose"
                value={value.dosage ?? ""}
                onChange={(e) => onChange({ dosage: e.target.value })}
                placeholder="e.g. 1 ml / 10 birds"
                className="mt-1.5 rounded-xl"
                maxLength={80}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="vexp">Expiry date *</Label>
            <Input
              id="vexp"
              type="date"
              value={value.expires_on ?? ""}
              onChange={(e) => onChange({ expires_on: e.target.value })}
              className="mt-1.5 rounded-xl"
              required
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Required for veterinary medicines. Listings without expiry can't go live.
            </p>
          </div>
        </>
      )}

      {topCategory === "agro_equipment_tools" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="brand2">Brand</Label>
              <Input
                id="brand2"
                value={value.brand ?? ""}
                onChange={(e) => onChange({ brand: e.target.value })}
                className="mt-1.5 rounded-xl"
                maxLength={60}
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={value.model ?? ""}
                onChange={(e) => onChange({ model: e.target.value })}
                className="mt-1.5 rounded-xl"
                maxLength={60}
              />
            </div>
          </div>
          <div>
            <Label>Condition *</Label>
            <Select
              value={value.condition || undefined}
              onValueChange={(v) => onChange({ condition: v as "new" | "used" })}
            >
              <SelectTrigger className="mt-1.5 w-full rounded-xl">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New / unused</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Required for equipment listings.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
