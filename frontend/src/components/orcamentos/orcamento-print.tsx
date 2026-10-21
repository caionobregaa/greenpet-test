import type { Ref } from "react";
import type { Orcamento } from "@/lib/types/orcamento";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { resumoValoresOrcamento, valorBrutoItem } from "@/lib/utils/orcamento-valores";
import { CupomTermico, CupomDivisor, CupomLinha } from "@/components/shared/cupom-termico";

interface OrcamentoPrintProps {
  orcamento: Orcamento;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Orçamento impresso na térmica (specs/orcamentos/spec-v4.md): ainda não pago. */
export function OrcamentoPrint({ orcamento, className, ref }: OrcamentoPrintProps) {
  const { subtotal, desconto, total } = resumoValoresOrcamento(orcamento);
  const numero = orcamento.numero
    ? `#${String(orcamento.numero).padStart(3, "0")}`
    : orcamento.id.slice(-6).toUpperCase();

  return (
    <CupomTermico ref={ref} titulo="ORÇAMENTO" className={className}>
      <p>Cliente: {orcamento.cliente?.nome ?? "—"}</p>
      {orcamento.animal?.nome && <p>Pet: {orcamento.animal.nome}</p>}
      <p>Data: {formatDate(orcamento.data)}</p>
      <p>Validade: {formatDate(orcamento.validade)}</p>
      <p>Orçamento: {numero}</p>

      <CupomDivisor />

      <div className="space-y-1">
        {orcamento.itens.map((item) => (
          <CupomLinha key={item.id} label={`${item.qtd}x ${item.nome}`} valor={formatBRL(valorBrutoItem(item))} />
        ))}
      </div>

      <CupomDivisor />

      <CupomLinha label="Subtotal" valor={formatBRL(subtotal)} />
      {desconto > 0 && <CupomLinha label="Desconto" valor={`−${formatBRL(desconto)}`} />}

      <CupomDivisor />

      <CupomLinha label="TOTAL" valor={formatBRL(total)} className="text-sm font-bold" />
      <CupomLinha label="Pagamento:" valor="VALOR EM ABERTO" className="font-bold" />
    </CupomTermico>
  );
}
