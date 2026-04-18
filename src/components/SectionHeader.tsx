import { Link } from "@tanstack/react-router";

type Props = {
  title: string;
  viewAllTo?: string;
};

export function SectionHeader({ title, viewAllTo }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      {viewAllTo ? (
        <Link to={viewAllTo} className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      ) : null}
    </div>
  );
}
