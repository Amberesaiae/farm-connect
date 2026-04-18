import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  step: number;
  steps: string[];
}

export function Stepper({ step, steps }: StepperProps) {
  return (
    <div>
      <ol className="flex items-center gap-2">
        {steps.map((label, i) => {
          const idx = i + 1;
          const isDone = idx < step;
          const isCurrent = idx === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary",
                  !isDone && !isCurrent && "border-border bg-background text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : idx}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    idx < step ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs font-medium text-muted-foreground">
        Step {step} of {steps.length} · {steps[step - 1]}
      </p>
    </div>
  );
}
