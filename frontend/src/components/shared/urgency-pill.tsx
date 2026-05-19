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
    className: "bg-[#e0f2f1] text-[#004d40] border-[#80cbc4]",
    dot: "bg-teal-600",
  },
  ok: {
    label: "OK",
    className: "bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]",
    dot: "bg-brand-600",
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
