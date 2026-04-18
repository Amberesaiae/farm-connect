import * as React from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  className?: string;
};

export function TopBar({ title, right, onBack, className }: Props) {
  const router = useRouter();
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 pb-3 pt-5",
        className,
      )}
    >
      <button
        type="button"
        onClick={onBack ?? (() => router.history.back())}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-foreground transition-colors hover:bg-muted"
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 truncate text-center text-base font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <div className="flex h-10 min-w-10 items-center justify-end">
        {right ?? <div className="h-10 w-10" />}
      </div>
    </div>
  );
}
