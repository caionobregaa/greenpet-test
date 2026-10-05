"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MessageCircle, ClipboardCheck, UserX } from "lucide-react";
import { useClientesSumidos, useRegistrarMotivosSumido } from "@/lib/hooks/use-recompra";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPhone } from "@/lib/utils/format";
import { whatsappUrl, mensagemRecompra } from "@/lib/utils/whatsapp";
import { cicloDoAlerta, type ClienteSumidoAlerta } from "@/lib/types/recompra";
import { MotivosSumidoDialog, type MotivosSumidoPayload } from "./motivos-sumido-dialog";

/** Categoria "Sumidos" da aba Clientes (specs/recompra/spec-v2.md). */
export function ClientesSumidosTab() {
  const { data: sumidos = [], isLoading } = useClientesSumidos();
  const registrar = useRegistrarMotivosSumido();
  const [aberto, setAberto] = useState<ClienteSumidoAlerta | null>(null);

  async function salvar(payload: MotivosSumidoPayload) {
    if (!aberto) return;
    try {
      await registrar.mutateAsync({ ...cicloDoAlerta(aberto), ...payload });
      toast.success("Motivos registrados!");
      setAberto(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao registrar motivos", { description: msg });
    }
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Clientes com recompra atrasada há mais de 30 dias. Saem desta lista só quando compram o produto de novo.
        Os motivos registrados aparecem no BI.
      </p>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                {["Cliente", "Produto · Animal", "Sumido há", "Última compra", "Motivos", ""].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                  </tr>
                ))
              ) : sumidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <UserX className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Nenhum cliente sumido. 🎉</p>
                  </td>
                </tr>
              ) : (
                sumidos.map((s) => (
                  <tr key={`${s.clienteId}-${s.produtoId}-${s.animalId ?? ""}`} data-testid="sumido-linha" className="border-t border-border align-top hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/clientes/${s.clienteId}`} className="font-medium hover:underline">{s.clienteNome}</Link>
                      <p className="text-xs text-muted-foreground">{formatPhone(s.clienteTelefone)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {s.produtoNome}
                      {s.animalNome ? <p className="text-xs text-muted-foreground">{s.animalNome}</p> : null}
                    </td>
                    <td className="px-4 py-3 font-semibold text-amber-700 whitespace-nowrap">{s.diasAtraso} dias</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(s.ultimaCompra)}</td>
                    <td className="px-4 py-3">
                      {s.motivosSumido ? (
                        <div className="flex flex-wrap gap-1">
                          {s.motivosSumido.motivos.map((m) => (
                            <span key={m} className="text-[11px] font-medium bg-accent rounded-full px-2 py-0.5" title={m === "Outro" ? s.motivosSumido?.outroTexto ?? "" : undefined}>
                              {m === "Outro" && s.motivosSumido?.outroTexto ? `Outro: ${s.motivosSumido.outroTexto}` : m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Não registrado</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <a
                          href={whatsappUrl(s.clienteTelefone, mensagemRecompra(s))}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir WhatsApp de ${s.clienteNome}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-700 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap" onClick={() => setAberto(s)}>
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          {s.motivosSumido ? "Editar motivos" : "Registrar motivos"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MotivosSumidoDialog sumido={aberto} loading={registrar.isPending} onClose={() => setAberto(null)} onConfirm={salvar} />
    </div>
  );
}
