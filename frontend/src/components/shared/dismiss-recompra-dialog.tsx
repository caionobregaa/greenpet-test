"use client";

import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RecompraAlerta } from "@/lib/types/recompra";

interface DismissRecompraDialogProps {
  alerta: RecompraAlerta | null;
  reason: "ok" | "cancelado" | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DismissRecompraDialog({
  alerta,
  reason,
  loading,
  onClose,
  onConfirm,
}: DismissRecompraDialogProps) {
  const isOk = (reason ?? "ok") === "ok";

  return (
    <AlertDialog open={!!alerta} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isOk
              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-destructive" />
            }
            {isOk ? "Confirmar como Resolvido?" : "Confirmar Cancelamento?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 pt-1">
            <span className="block">
              {isOk
                ? "Você está marcando que já cuidou desta recompra. O alerta vai sumir da lista."
                : "Você está cancelando este alerta. Ele será removido da lista."
              }
            </span>
            {alerta && (
              <span className="block mt-2 rounded-md bg-muted/40 border border-border px-3 py-2 text-sm text-foreground">
                <span className="font-semibold">{alerta.produtoNome}</span>
                <br />
                <span className="text-muted-foreground">
                  {alerta.clienteNome} · {alerta.animalNome}
                </span>
              </span>
            )}
            <span className="block text-xs text-muted-foreground mt-1">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              O alerta reaparecerá automaticamente se uma nova compra for registrada.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={loading}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={loading}
            className={isOk
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-destructive text-white hover:bg-destructive/90"
            }
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processando...</>
              : isOk ? "Sim, marcar como OK" : "Sim, cancelar alerta"
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
