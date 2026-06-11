"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useVenda, useDeleteVenda } from "@/lib/hooks/use-vendas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate, formatBRL } from "@/lib/utils/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default function VendaDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: venda, isLoading } = useVenda(id);
  const deleteVenda = useDeleteVenda();

  async function handleDelete() {
    try {
      await deleteVenda.mutateAsync(id);
      toast.success("Venda excluída!");
      router.push("/vendas");
    } catch {
      toast.error("Erro ao excluir venda.");
    }
  }

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!venda) return <p className="text-muted-foreground">Venda não encontrada.</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Venda #{id.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(venda.data)}</p>
        </div>
        <Link href={`/vendas/${id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Editar
        </Link>
        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Excluir
        </Button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ["Cliente", venda.cliente?.nome ?? "—"],
          ["Animal", venda.animal?.nome ?? "—"],
          ["Forma de Pag.", venda.formaPag],
          ["Data", formatDate(venda.data)],
        ].map(([label, value]) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Itens */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold">Itens da Venda</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Produto / Serviço</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Qtd</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Valor Unit.</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
            </tr>
          </thead>
          <tbody>
            {venda.itens.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3">{item.nome}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">{item.qtd}</td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatBRL(item.valorUnitario)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{formatBRL(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-accent/30">
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-sm">Total Bruto</td>
              <td className="px-4 py-3 text-right font-bold text-primary font-mono text-lg">{formatBRL(venda.total)}</td>
            </tr>
            {venda.taxaCartao > 0 && (
              <>
                <tr className="border-t border-border/60">
                  <td colSpan={3} className="px-4 py-2 text-right text-xs text-destructive">
                    Taxa {venda.formaPag} ({venda.taxaCartao}%)
                  </td>
                  <td className="px-4 py-2 text-right text-xs text-destructive font-mono">
                    − {formatBRL(venda.total * venda.taxaCartao / 100)}
                  </td>
                </tr>
                <tr className="border-t border-border bg-primary/5">
                  <td colSpan={3} className="px-4 py-2.5 text-right font-semibold text-sm">Líquido estimado</td>
                  <td className="px-4 py-2.5 text-right font-bold text-primary font-mono">{formatBRL(venda.total * (1 - venda.taxaCartao / 100))}</td>
                </tr>
              </>
            )}
          </tfoot>
        </table>
      </div>

      {venda.obs && (
        <div className="mt-4 bg-card rounded-xl border border-border p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
          <p className="text-sm">{venda.obs}</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir venda?"
        description="Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        loading={deleteVenda.isPending}
      />
    </div>
  );
}
