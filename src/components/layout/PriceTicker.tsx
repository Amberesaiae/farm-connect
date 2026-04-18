import { TrendingDown, TrendingUp } from "lucide-react";

interface Tick {
  crop: string;
  label: string;
  price: string;
  unit: string;
  dir: "up" | "down" | "flat";
  delta: string;
}

// Indicative weekly market signals — pulled manually for now;
// safe to replace with a server feed later.
const TICKS: Tick[] = [
  { crop: "Cattle", label: "Sanga", price: "GH₵ 9,200", unit: "/head", dir: "up", delta: "+3.2%" },
  { crop: "Goats", label: "West African Dwarf", price: "GH₵ 850", unit: "/head", dir: "up", delta: "+1.4%" },
  { crop: "Sheep", label: "Djallonké", price: "GH₵ 1,150", unit: "/head", dir: "down", delta: "−0.8%" },
  { crop: "Poultry", label: "Broiler", price: "GH₵ 75", unit: "/kg", dir: "up", delta: "+2.1%" },
  { crop: "Pigs", label: "Crossbreed", price: "GH₵ 28", unit: "/kg", dir: "flat", delta: "0.0%" },
  { crop: "Eggs", label: "Crate of 30", price: "GH₵ 42", unit: "/crate", dir: "down", delta: "−1.2%" },
];

function Item({ t }: { t: Tick }) {
  const Icon = t.dir === "up" ? TrendingUp : t.dir === "down" ? TrendingDown : null;
  const dirClass = t.dir === "up" ? "text-emerald-400" : t.dir === "down" ? "text-red-400" : "text-white/50";
  return (
    <span className="inline-flex items-center gap-2 border-r border-white/10 px-6 font-mono text-[10.5px] tracking-wider">
      <span className="text-white/45 text-[10px]">{t.crop.toUpperCase()}</span>
      <span className="text-white/80">{t.label}</span>
      <span className="text-white">{t.price}</span>
      <span className="text-white/45">{t.unit}</span>
      <span className={`inline-flex items-center gap-0.5 ${dirClass}`}>
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {t.delta}
      </span>
    </span>
  );
}

export function PriceTicker() {
  // Duplicate the list so the linear translateX(-50%) creates a seamless loop.
  const doubled = [...TICKS, ...TICKS];
  return (
    <div className="overflow-hidden bg-foreground py-1.5 text-white">
      <div className="ticker-track flex w-max whitespace-nowrap">
        {doubled.map((t, i) => (
          <Item key={`${t.crop}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}
