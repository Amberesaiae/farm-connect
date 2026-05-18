export function AnnouncementBar() {
  return (
    <div
      className="flex items-center justify-center overflow-hidden bg-primary py-2 text-center text-[12.5px] font-medium text-primary-foreground"
      style={{
        paddingLeft: "calc(1rem + env(safe-area-inset-left))",
        paddingRight: "calc(1rem + env(safe-area-inset-right))",
      }}
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className="pulse-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
        />
        <span className="truncate">
          Verified livestock sellers across all 16 regions of Ghana
        </span>
      </span>
    </div>
  );
}
