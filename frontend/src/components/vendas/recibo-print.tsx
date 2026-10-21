import type { Ref } from "react";
import type { Venda } from "@/lib/types/venda";
import type { ClienteDetail } from "@/lib/types/cliente";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { rotuloPagamentoCliente } from "@/lib/utils/formas-pagamento";
import { CupomTermico, CupomDivisor, CupomLinha } from "@/components/shared/cupom-termico";

// Regra oficial de precificação (ago/2026): a partir desse valor (já com
// desconto de recompra, se houver — sem contar a taxa de entrega), a
// entrega é grátis.
const FRETE_GRATIS_PISO = 80;

interface ReciboPrintProps {
  venda: Venda;
  clienteDetail?: ClienteDetail;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Monta "Rua X, 123 - Bairro - Cidade" a partir do cadastro do cliente,
 * pulando qualquer parte vazia. Retorna null se não há nada preenchido. */
function formatEndereco(cliente?: ClienteDetail): string | null {
  if (!cliente) return null;
  const partes = [cliente.endereco, cliente.bairro, cliente.cidade]
    .map((p) => p?.trim())
    .filter((p): p is string => !!p);
  return partes.length > 0 ? partes.join(" - ") : null;
}

export function ReciboPrint({ venda, clienteDetail, className, ref }: ReciboPrintProps) {
  const subtotalBruto = venda.itens.reduce((s, i) => s + i.qtd * i.valorUnitario, 0);
  const descontoItens = venda.itens.reduce((s, i) => s + (i.desconto ?? 0), 0);
  const descontoVenda = venda.desconto ?? 0;
  const descontoTotal = descontoItens + descontoVenda;
  const endereco = formatEndereco(clienteDetail);
  const clienteElegivelRecompra = descontoVenda > 0;
  const quantidadeComprasAnteriores = clienteDetail
    ? Math.max(0, clienteDetail.vendas.length - 1)
    : undefined;
  const freteGratis = subtotalBruto - descontoTotal >= FRETE_GRATIS_PISO;
  const numeroVenda = venda.numero
    ? `V${String(venda.numero).padStart(4, "0")}`
    : venda.id.slice(-6).toUpperCase();

  return (
    <CupomTermico ref={ref} titulo="RECIBO" className={className}>
      <p>Cliente: {venda.cliente?.nome ?? "—"}</p>
      {endereco && <p className="break-words">Endereço: {endereco}</p>}
      {venda.animal?.nome && <p>Pet: {venda.animal.nome}</p>}
      <p>Data: {formatDate(venda.data)}</p>
      <p>Venda: {numeroVenda}</p>

      <CupomDivisor />

      <div className="space-y-1">
        {venda.itens.map((item) => (
          <CupomLinha key={item.id} label={`${item.qtd}x ${item.nome}`} valor={formatBRL(item.total)} />
        ))}
      </div>

      <CupomDivisor />

      <CupomLinha label="Subtotal" valor={formatBRL(subtotalBruto)} />
      {descontoTotal > 0 && (
        <CupomLinha label="Desconto total" valor={`−${formatBRL(descontoTotal)}`} />
      )}
      {clienteElegivelRecompra && (
        <p className="text-[10px] truncate">
          Inclui recompra (5%)
          {quantidadeComprasAnteriores !== undefined
            ? ` — ${quantidadeComprasAnteriores}ª+ compra`
            : ""}
        </p>
      )}
      {venda.taxaEntrega > 0 && (
        <CupomLinha label="Entrega" valor={formatBRL(venda.taxaEntrega)} />
      )}

      <CupomDivisor />

      <CupomLinha label="TOTAL" valor={formatBRL(venda.total)} className="text-sm font-bold" />
      <CupomLinha label="Pagamento:" valor={rotuloPagamentoCliente(venda.formaPag, venda.taxaCartao)} />

      {freteGratis && (
        <p className="text-center mt-1.5 font-bold">*** FRETE GRÁTIS ***</p>
      )}
    </CupomTermico>
  );
}
