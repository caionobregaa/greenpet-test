import { cn } from "@/lib/utils/cn";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}

export function KpiCard({ label, value, sub, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-4 shadow-sm",
        className
      )}
    >
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-bold text-primary leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
