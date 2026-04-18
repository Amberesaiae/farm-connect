import { cn } from "@/lib/utils";

export function WizardProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i < step ? "bg-primary" : "bg-border",
          )}
        />
      ))}
      <span className="ml-2 text-xs font-medium text-muted-foreground">
        Step {step} of {total}
      </span>
    </div>
  );
}
