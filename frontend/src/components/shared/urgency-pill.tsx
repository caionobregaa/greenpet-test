import { cn } from "@/lib/utils/cn";
import type { Urgencia } from "@/lib/types/recompra";

const URGENCY_MAP: Record<Urgencia, { label: string; className: string; dot: string }> = {
  vencido: {
    label: "Vencido",
    className: "bg-red-50 text-red-600 border-red-400",
    dot: "bg-red-600",
  },
  urgente: {
    label: "Urgente",
    className: "bg-amber-50 text-amber-800 border-amber-400",
    dot: "bg-amber-600",
  },
  proximo: {
    label: "Próximo",
    className: "bg-blush-50 text-blush-800 border-blush-200",
    dot: "bg-blush-400",
  },
  ok: {
    label: "OK",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-600",
  },
};

interface UrgencyPillProps {
  urgencia: Urgencia;
  className?: string;
}

export function UrgencyPill({ urgencia, className }: UrgencyPillProps) {
  const config = URGENCY_MAP[urgencia];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
