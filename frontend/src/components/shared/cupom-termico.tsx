import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils/cn";

// Cupom térmico 80 mm (largura útil 72 mm), só preto — specs/vendas/spec-v3.md.
// Usado pelo recibo de venda e pelo orçamento impresso.

interface CupomTermicoProps {
  /** Tipo do documento, em destaque abaixo do nome da loja (ex. "RECIBO"). */
  titulo: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export function CupomTermico({ titulo, className, ref, children }: CupomTermicoProps) {
  return (
    <div ref={ref} className={cn("font-mono text-black bg-white w-[72mm] px-1 py-2 text-[11px] leading-snug", className)}>
      <div className="text-center mb-1.5">
        <p className="text-sm font-bold tracking-wide">BEEZ PET</p>
        <p className="text-xs font-bold tracking-widest">{titulo}</p>
      </div>

      <CupomDivisor />

      {children}

      <div className="border-t border-dashed border-black my-2" />

      <p className="text-center text-[10px]">Obrigado pela preferência!</p>
    </div>
  );
}

export function CupomDivisor() {
  return <div className="border-t border-dashed border-black my-1" />;
}

/** Linha "rótulo .... valor", com o valor alinhado à direita. */
export function CupomLinha({ label, valor, className }: { label: ReactNode; valor: ReactNode; className?: string }) {
  return (
    <div className={cn("flex justify-between gap-2", className)}>
      <span className="flex-1 min-w-0 break-words">{label}</span>
      <span className="shrink-0 text-right">{valor}</span>
    </div>
  );
}
