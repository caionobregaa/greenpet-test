import type { Venda } from "@/lib/types/venda";
import type { ClienteDetail } from "@/lib/types/cliente";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

// Regra oficial de precificação (ago/2026): a partir desse valor (já com
// desconto de recompra, se houver — sem contar a taxa de entrega), a
// entrega é grátis.
const FRETE_GRATIS_PISO = 80;

interface ReciboPrintProps {
  venda: Venda;
  clienteDetail?: ClienteDetail;
  className?: string;
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

export function ReciboPrint({ venda, clienteDetail, className }: ReciboPrintProps) {
  const subtotal = venda.itens.reduce((s, i) => s + i.total, 0);
  const endereco = formatEndereco(clienteDetail);
  const descontoRecompra = venda.desconto ?? 0;
  const clienteElegivelRecompra = descontoRecompra > 0;
  const quantidadeComprasAnteriores = clienteDetail
    ? Math.max(0, clienteDetail.vendas.length - 1)
    : undefined;
  const freteGratis = subtotal - descontoRecompra >= FRETE_GRATIS_PISO;
  const numeroVenda = venda.numero
    ? `V${String(venda.numero).padStart(4, "0")}`
    : venda.id.slice(-6).toUpperCase();

  return (
    <div className={cn("font-mono text-black bg-white w-[80mm] p-2 text-[11px] leading-snug", className)}>
      <div className="text-center mb-1.5">
        <p className="text-sm font-bold tracking-wide">GreenPET</p>
        <p className="text-[10px]">Recibo de Venda</p>
      </div>

      <div className="border-t border-dashed border-black my-1" />

      <p>Cliente: {venda.cliente?.nome ?? "—"}</p>
      {endereco && <p className="break-words">Endereço: {endereco}</p>}
      {venda.animal?.nome && <p>Pet: {venda.animal.nome}</p>}
      <p>Data: {formatDate(venda.data)}</p>
      <p>Venda: {numeroVenda}</p>

      <div className="border-t border-dashed border-black my-1" />

      <div className="space-y-1">
        {venda.itens.map((item) => (
          <div key={item.id} className="flex justify-between gap-2">
            <span className="flex-1 min-w-0 break-words">{item.qtd}x {item.nome}</span>
            <span className="shrink-0 text-right">{formatBRL(item.total)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-1" />

      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatBRL(subtotal)}</span>
      </div>
      {clienteElegivelRecompra && (
        <div className="flex justify-between gap-2">
          <span className="truncate">
            Desconto recompra (5%)
            {quantidadeComprasAnteriores !== undefined
              ? ` — ${quantidadeComprasAnteriores}ª+ compra`
              : ""}
          </span>
          <span className="shrink-0">−{formatBRL(descontoRecompra)}</span>
        </div>
      )}
      {venda.taxaEntrega > 0 && (
        <div className="flex justify-between">
          <span>Entrega</span>
          <span>{formatBRL(venda.taxaEntrega)}</span>
        </div>
      )}

      <div className="border-t border-dashed border-black my-1" />

      <div className="flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span>{formatBRL(venda.total)}</span>
      </div>

      {freteGratis && (
        <p className="text-center mt-1.5 font-bold">*** FRETE GRÁTIS ***</p>
      )}

      <div className="border-t border-dashed border-black my-2" />

      <p className="text-center text-[10px]">Obrigado pela preferência!</p>
    </div>
  );
}
