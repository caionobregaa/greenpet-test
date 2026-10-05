"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOTIVOS_SUMIDO, type ClienteSumidoAlerta } from "@/lib/types/recompra";

export interface MotivosSumidoPayload {
  motivos: string[];
  outroTexto: string | null;
}

/**
 * Registro dos motivos de um cliente sumido, com checagem dupla (specs/recompra/spec-v2.md):
 * passo 1 marca os motivos; passo 2 mostra o resumo e só então grava.
 */
export function MotivosSumidoDialog({
  sumido,
  loading,
  onClose,
  onConfirm,
}: {
  sumido: ClienteSumidoAlerta | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (payload: MotivosSumidoPayload) => void;
}) {
  return (
    <Dialog open={!!sumido} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        {/* key: reinicia o formulário a cada cliente aberto */}
        {sumido && <Formulario key={`${sumido.clienteId}-${sumido.produtoId}-${sumido.ultimaCompra}`} sumido={sumido} loading={loading} onClose={onClose} onConfirm={onConfirm} />}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({
  sumido,
  loading,
  onClose,
  onConfirm,
}: {
  sumido: ClienteSumidoAlerta;
  loading: boolean;
  onClose: () => void;
  onConfirm: (payload: MotivosSumidoPayload) => void;
}) {
  const [selecionados, setSelecionados] = useState<string[]>(sumido.motivosSumido?.motivos ?? []);
  const [outroTexto, setOutroTexto] = useState(sumido.motivosSumido?.outroTexto ?? "");
  const [passo, setPasso] = useState<1 | 2>(1);

  const temOutro = selecionados.includes("Outro");
  const podeContinuar = selecionados.length > 0 && (!temOutro || outroTexto.trim().length > 0);

  function alternar(motivo: string) {
    setSelecionados((atual) =>
      atual.includes(motivo) ? atual.filter((m) => m !== motivo) : [...atual, motivo],
    );
  }

  // Mantém a ordem da lista padrão no resumo e no envio.
  const ordenados = MOTIVOS_SUMIDO.filter((m) => selecionados.includes(m));
  const rotulo = `${sumido.clienteNome} · ${sumido.produtoNome}${sumido.animalNome ? ` (${sumido.animalNome})` : ""}`;

  if (passo === 2) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Confirmar motivos?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Registrar estes motivos para <span className="font-medium text-foreground">{rotulo}</span>?</p>
        <ul className="rounded-md border border-border bg-muted/30 px-4 py-3 space-y-1 text-sm" aria-label="Motivos selecionados">
          {ordenados.map((m) => (
            <li key={m}>• {m === "Outro" ? `Outro: ${outroTexto.trim()}` : m}</li>
          ))}
        </ul>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setPasso(1)} disabled={loading}>Voltar</Button>
          <Button
            onClick={() => onConfirm({ motivos: ordenados, outroTexto: temOutro ? outroTexto.trim() : null })}
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Confirmar"}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Por que parou de comprar?</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{rotulo} — sumido há {sumido.diasAtraso} dias. Marque um ou mais motivos.</p>
      <fieldset className="space-y-1.5">
        <legend className="sr-only">Motivos</legend>
        {MOTIVOS_SUMIDO.map((motivo) => (
          <label key={motivo} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50">
            <input
              type="checkbox"
              checked={selecionados.includes(motivo)}
              onChange={() => alternar(motivo)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            {motivo}
          </label>
        ))}
      </fieldset>
      {temOutro && (
        <Input
          aria-label="Descreva o outro motivo"
          placeholder="Descreva o motivo..."
          value={outroTexto}
          onChange={(e) => setOutroTexto(e.target.value)}
          autoFocus
        />
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => setPasso(2)} disabled={!podeContinuar}>Continuar</Button>
      </div>
    </>
  );
}
