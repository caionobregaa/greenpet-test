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
        "bg-card rounded-lg p-5 shadow-sm shadow-black/5 relative overflow-hidden border border-border/50",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/70 via-primary/40 to-transparent" />
      <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">
        {label}
      </p>
      <p className="text-[28px] font-bold text-foreground leading-none tabular-nums tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-muted-foreground/60 mt-1.5">{sub}</p>
      )}
    </div>
  );
}
