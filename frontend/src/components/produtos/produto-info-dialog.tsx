"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBRL } from "@/lib/utils/format";
import type { Produto } from "@/lib/types/produto";

interface ProdutoInfoDialogProps {
  produto: Produto | null;
  onOpenChange: (open: boolean) => void;
}

export function ProdutoInfoDialog({ produto, onOpenChange }: ProdutoInfoDialogProps) {
  if (!produto) return null;

  const margem = produto.valorVenda > 0
    ? ((produto.valorVenda - produto.valorCusto) / produto.valorVenda) * 100
    : 0;

  return (
    <Dialog open={!!produto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{produto.nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {produto.imagemUrl ? (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={produto.imagemUrl}
                alt={produto.nome}
                className="w-52 h-52 rounded-xl object-cover border border-border shadow-sm"
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-52 h-52 rounded-xl bg-muted border border-border flex items-center justify-center text-5xl">
                📦
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <InfoRow label="Categoria" value={produto.categoria} />
            {produto.especie && <InfoRow label="Espécie" value={produto.especie} />}
            {produto.subCategoria && <InfoRow label="Subcategoria" value={produto.subCategoria} />}
            {produto.marca && <InfoRow label="Marca" value={produto.marca} />}
            {produto.fornecedor && <InfoRow label="Fornecedor" value={produto.fornecedor} />}
            {produto.pesoEmbalagem != null && (
              <InfoRow label="Peso" value={`${produto.pesoEmbalagem} kg`} />
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preços e Margens</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoRow label="Custo" value={formatBRL(produto.valorCusto)} mono />
              <InfoRow label="Venda" value={formatBRL(produto.valorVenda)} mono />
            </div>
            <div className="bg-accent rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-accent-foreground uppercase tracking-wide">Margem bruta</span>
              <span className={`text-lg font-bold font-mono ${margem >= 30 ? "text-primary" : margem >= 15 ? "text-amber-600" : "text-destructive"}`}>
                {margem.toFixed(1)}%
              </span>
            </div>
            {(produto.margemCartao != null || produto.margemImposto != null || produto.margemOperacao != null || produto.margemLucro != null) && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {produto.margemCartao != null && <InfoRow label="Margem Cartão" value={`${produto.margemCartao}%`} mono />}
                {produto.margemImposto != null && <InfoRow label="Margem Imposto" value={`${produto.margemImposto}%`} mono />}
                {produto.margemOperacao != null && <InfoRow label="Margem Operação" value={`${produto.margemOperacao}%`} mono />}
                {produto.margemLucro != null && <InfoRow label="Margem Lucro" value={`${produto.margemLucro}%`} mono />}
              </div>
            )}
          </div>

          {produto.descricao && (
            <div className="border-t border-border pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Descrição</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{produto.descricao}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
