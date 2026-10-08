import { cn } from "@/lib/utils/cn";
import type { CurvaClasse } from "@/lib/types/curva-venda";

const CURVA_MAP: Record<CurvaClasse, { label: string; className: string; dot: string }> = {
  A: {
    label: "A",
    className: "bg-brand-50 text-brand-700 border-brand-200",
    dot: "bg-brand-700",
  },
  B: {
    label: "B",
    className: "bg-amber-50 text-amber-800 border-amber-400",
    dot: "bg-amber-600",
  },
  C: {
    label: "C",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/60",
  },
};

interface CurvaPillProps {
  curva: CurvaClasse;
  className?: string;
}

export function CurvaPill({ curva, className }: CurvaPillProps) {
  const config = CURVA_MAP[curva];

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
