interface Spec {
  label: string;
  value: string | number | null | undefined;
}

export function SpecsPanel({ specs }: { specs: Spec[] }) {
  const visible = specs.filter((s) => s.value != null && s.value !== "");
  if (!visible.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-surface p-4 text-sm sm:grid-cols-3">
      {visible.map((s) => (
        <div key={s.label}>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</dt>
          <dd className="mt-0.5 font-semibold capitalize text-foreground">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
