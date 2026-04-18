import { Link } from "@tanstack/react-router";

type Props = {
  title: string;
  viewAllTo?: "/freshly-stocked" | "/market-moves" | "/shop" | "/orders" | "/favorites";
};

export function SectionHeader({ title, viewAllTo }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      {viewAllTo ? (
        <Link
          to={viewAllTo}
          className="text-xs font-semibold text-primary transition-colors hover:underline"
        >
          View all
        </Link>
      ) : null}
    </div>
  );
}
