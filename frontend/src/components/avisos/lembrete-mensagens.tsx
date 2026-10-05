"use client";

import { toast } from "sonner";
import { MessageCircle, CheckCheck } from "lucide-react";
import { useMarcarMensagem, useDesmarcarMensagem } from "@/lib/hooks/use-recompra";
import { UrgencyPill } from "@/components/shared/urgency-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDiasRestantes } from "@/lib/utils/format";
import { whatsappUrl, mensagemRecompra } from "@/lib/utils/whatsapp";
import { cicloDoAlerta, previsaoRecompra, type RecompraAlerta } from "@/lib/types/recompra";
import { cn } from "@/lib/utils";

function chave(a: RecompraAlerta) {
  return `${a.produtoId}-${a.clienteId}-${a.animalId ?? ""}`;
}

function Linha({ a, onToggle, disabled }: { a: RecompraAlerta; onToggle: (a: RecompraAlerta, enviada: boolean) => void; disabled: boolean }) {
  const enviada = !!a.mensagemEnviadaEm;
  return (
    <li
      data-testid="lembrete-linha"
      className={cn("px-4 py-3 flex flex-wrap items-center gap-3", enviada && "bg-muted/30")}
    >
      <div className={cn("flex-1 min-w-[12rem]", enviada && "opacity-60")}>
        <p className="font-medium text-sm">
          {a.clienteNome}
          {a.animalNome ? <span className="text-muted-foreground font-normal"> · {a.animalNome}</span> : null}
        </p>
        <p className="text-xs text-muted-foreground">{a.produtoNome}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <UrgencyPill urgencia={a.urgencia} />
          <span className="text-xs text-muted-foreground">
            {formatDiasRestantes(a.diasRestantes)} · previsão {formatDate(previsaoRecompra(a))}
          </span>
        </div>
        {enviada && (
          <p className="text-[11px] text-green-700 mt-1 flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" />
            Enviada em {formatDate(a.mensagemEnviadaEm)}{a.mensagemEnviadaPor ? ` por ${a.mensagemEnviadaPor}` : ""}
          </p>
        )}
      </div>
      <a
        href={whatsappUrl(a.clienteTelefone, mensagemRecompra(a))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir WhatsApp de ${a.clienteNome}`}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-green-600/30 text-green-700 text-xs font-semibold hover:bg-green-50 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </a>
      <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
        <input
          type="checkbox"
          checked={enviada}
          disabled={disabled}
          onChange={(e) => onToggle(a, e.target.checked)}
          className="h-4 w-4 rounded border-input accent-green-600"
        />
        Mensagem enviada
      </label>
    </li>
  );
}

/**
 * Lembrete de envio de mensagem para os alertas de recompra (specs/recompra/spec-v2.md).
 * Marcar "mensagem enviada" não remove o cliente de atrasados/sumidos — só a recompra remove.
 */
export function LembreteMensagens({ alertas, isLoading }: { alertas: RecompraAlerta[]; isLoading: boolean }) {
  const marcar = useMarcarMensagem();
  const desmarcar = useDesmarcarMensagem();

  const aEnviar = alertas.filter((a) => !a.mensagemEnviadaEm);
  const enviadas = alertas.filter((a) => a.mensagemEnviadaEm);
  const ocupado = marcar.isPending || desmarcar.isPending;

  async function alternar(a: RecompraAlerta, enviada: boolean) {
    const ciclo = cicloDoAlerta(a);
    try {
      if (enviada) {
        await marcar.mutateAsync(ciclo);
        toast.success(`Mensagem para ${a.clienteNome} marcada como enviada`, {
          action: { label: "Desfazer", onClick: () => desmarcar.mutate(ciclo) },
        });
      } else {
        await desmarcar.mutateAsync(ciclo);
      }
    } catch {
      toast.error("Erro ao atualizar a mensagem.");
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (alertas.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Nenhum cliente para lembrar. Tudo no prazo!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          A enviar ({aEnviar.length})
        </p>
        {aEnviar.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-xl border border-border p-4">
            Todas as mensagens foram enviadas. 🎉
          </p>
        ) : (
          <ul className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border overflow-hidden" aria-label="A enviar">
            {aEnviar.map((a) => <Linha key={chave(a)} a={a} onToggle={alternar} disabled={ocupado} />)}
          </ul>
        )}
      </div>
      {enviadas.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Mensagem enviada ({enviadas.length})
          </p>
          <ul className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border overflow-hidden" aria-label="Mensagem enviada">
            {enviadas.map((a) => <Linha key={chave(a)} a={a} onToggle={alternar} disabled={ocupado} />)}
          </ul>
        </div>
      )}
    </div>
  );
}
