"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, AlertTriangle, PackageX, Copy, History, Loader2 } from "lucide-react";
import { useDiagnosticoEstoque, useCorrecaoRetroativa } from "@/lib/hooks/use-estoque";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils/format";
import type { ResultadoCorrecao } from "@/lib/types/estoque";

// Diagnóstico do estoque e correção retroativa das vendas antigas (specs/estoque/spec-v2.md).

const numeroVenda = (n: number) => `V${String(n).padStart(5, "0")}`;

function Secao({ icon, titulo, qtd, descricao, children }: {
  icon: React.ReactNode; titulo: string; qtd: number; descricao: string; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-base font-semibold">{titulo}</h2>
        {qtd > 0 && <span className="bg-amber-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5">{qtd}</span>}
      </div>
      <p className="text-xs text-muted-foreground mb-3">{descricao}</p>
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">{children}</div>
    </section>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="p-6 text-center">
      <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-green-500/60" />
      <p className="text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}

function TabelaCorrecao({ resultado }: { resultado: ResultadoCorrecao }) {
  return (
    <div className="max-h-80 overflow-y-auto divide-y divide-border text-sm">
      {resultado.itens.map((i, idx) => (
        <div key={`${i.vendaId}-${i.produtoId}-${idx}`} className="px-4 py-2 flex items-center gap-3">
          <Link href={`/vendas/${i.vendaId}`} className="font-mono text-xs text-primary underline underline-offset-2 shrink-0">
            {numeroVenda(i.vendaNumero)}
          </Link>
          <span className="text-xs text-muted-foreground shrink-0">{formatDate(i.vendaData)}</span>
          <span className="flex-1 min-w-0 break-words">{i.produtoNome}</span>
          <span className="shrink-0 text-right font-mono">
            −{i.qtdBaixada}
            {i.qtdBaixada < i.qtd && <span className="text-xs text-muted-foreground"> de {i.qtd}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DiagnosticoEstoquePage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useDiagnosticoEstoque();
  const correcao = useCorrecaoRetroativa();
  const [simulacao, setSimulacao] = useState<ResultadoCorrecao | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  async function simular() {
    try {
      setSimulacao(await correcao.mutateAsync(false));
    } catch {
      toast.error("Erro ao simular a correção.");
    }
  }

  async function aplicar() {
    try {
      const r = await correcao.mutateAsync(true);
      setConfirmar(false);
      setSimulacao(null);
      toast.success(`Correção aplicada: ${r.totalUnidades} unidade(s) tiradas do estoque em ${r.totalItens} item(ns).`);
      refetch();
    } catch {
      toast.error("Erro ao aplicar a correção.");
    }
  }

  if (isLoading || !data) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>;
  }

  const pendentes = data.pendentesCorrecao;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push("/estoque")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Diagnóstico do estoque</h1>
          <p className="text-sm text-muted-foreground">Onde a venda não tirou do estoque, e a correção das vendas antigas</p>
        </div>
      </div>

      <Secao
        icon={<History className="w-5 h-5 text-amber-600" />}
        titulo="Vendas antigas sem baixa no estoque"
        qtd={pendentes.itens}
        descricao="Vendas registradas antes de 25/06/2026, quando a baixa automática entrou, nunca tiraram do estoque. A correção tira essas quantidades dos lotes que já existiam na data da venda (lotes lançados depois não são mexidos)."
      >
        {pendentes.itens === 0 ? (
          <Vazio texto="Nenhuma venda antiga pendente." />
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-sm">
              <strong>{pendentes.itens}</strong> item(ns) pendente(s), <strong>{pendentes.unidades}</strong> unidade(s) vendidas.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={simular} disabled={correcao.isPending}>
                {correcao.isPending && !confirmar ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simular correção
              </Button>
              {simulacao && (
                <Button onClick={() => setConfirmar(true)} disabled={correcao.isPending || simulacao.totalItens === 0}>
                  Aplicar correção
                </Button>
              )}
            </div>
            {simulacao && (
              <div className="rounded-lg border border-border">
                <p className="px-4 py-2 text-sm border-b border-border bg-muted/40">
                  Simulação (nada foi alterado): vai tirar <strong>{simulacao.totalUnidades}</strong> unidade(s) do estoque
                  em {simulacao.totalItens} item(ns).
                  {simulacao.itens.some((i) => i.qtdBaixada < i.qtd) && " Onde não havia estoque na data da venda, tira só o que existia."}
                </p>
                <TabelaCorrecao resultado={simulacao} />
              </div>
            )}
          </div>
        )}
      </Secao>

      <Secao
        icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
        titulo="Vendidos com estoque insuficiente"
        qtd={data.baixasIncompletas.length}
        descricao="A venda foi registrada, mas não havia estoque para tudo: o sistema tirou só o que existia. Confira se falta lançar compra ou lote desses produtos."
      >
        {data.baixasIncompletas.length === 0 ? (
          <Vazio texto="Nenhuma venda com estoque insuficiente." />
        ) : (
          <div className="divide-y divide-border text-sm">
            {data.baixasIncompletas.map((i, idx) => (
              <div key={`${i.vendaId}-${idx}`} className="px-4 py-2.5 flex items-center gap-3">
                <Link href={`/vendas/${i.vendaId}`} className="font-mono text-xs text-primary underline underline-offset-2 shrink-0">{numeroVenda(i.vendaNumero)}</Link>
                <span className="text-xs text-muted-foreground shrink-0">{formatDate(i.vendaData)}</span>
                <span className="flex-1 min-w-0 break-words">{i.produtoNome}</span>
                <span className="shrink-0 text-xs">vendido {i.qtd}, tirado {i.qtdBaixada}</span>
              </div>
            ))}
          </div>
        )}
      </Secao>

      <Secao
        icon={<PackageX className="w-5 h-5 text-muted-foreground" />}
        titulo="Itens sem produto cadastrado"
        qtd={data.itensSemProduto.length}
        descricao="Itens digitados à mão ou '(SEM REGISTRO)' não saem do estoque. Se for um produto do estoque (e não um serviço), cadastre o produto e escolha-o na busca nas próximas vendas. Últimos 200."
      >
        {data.itensSemProduto.length === 0 ? (
          <Vazio texto="Todos os itens vendidos estão ligados a um produto." />
        ) : (
          <div className="max-h-96 overflow-y-auto divide-y divide-border text-sm">
            {data.itensSemProduto.map((i, idx) => (
              <div key={`${i.vendaId}-${idx}`} className="px-4 py-2.5 flex items-center gap-3">
                <Link href={`/vendas/${i.vendaId}`} className="font-mono text-xs text-primary underline underline-offset-2 shrink-0">{numeroVenda(i.vendaNumero)}</Link>
                <span className="text-xs text-muted-foreground shrink-0">{formatDate(i.vendaData)}</span>
                <span className="flex-1 min-w-0 break-words">{i.nome}</span>
                <span className="shrink-0 text-xs">{i.qtd}x</span>
              </div>
            ))}
          </div>
        )}
      </Secao>

      <Secao
        icon={<Copy className="w-5 h-5 text-muted-foreground" />}
        titulo="Produtos com nome repetido"
        qtd={data.produtosDuplicados.length}
        descricao="Cadastros com o mesmo nome (diferença só de maiúscula ou espaço). Se o lote está num cadastro e a venda usa o outro, a baixa não acontece no lote certo."
      >
        {data.produtosDuplicados.length === 0 ? (
          <Vazio texto="Nenhum produto com nome repetido." />
        ) : (
          <div className="divide-y divide-border text-sm">
            {data.produtosDuplicados.map((g) => (
              <div key={g.nome} className="px-4 py-2.5 space-y-1">
                {g.produtos.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="flex-1 min-w-0 break-words">{p.nome}</span>
                    <span className="font-mono text-xs text-muted-foreground shrink-0">{p.sku}</span>
                    <span className="shrink-0 text-xs">estoque {p.estoque}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Secao>

      <ConfirmDialog
        open={confirmar}
        onOpenChange={setConfirmar}
        title="Aplicar a correção do estoque?"
        description={simulacao ? `Vai tirar ${simulacao.totalUnidades} unidade(s) do estoque, conforme a simulação. As vendas corrigidas ficam marcadas e não são descontadas de novo.` : undefined}
        confirmLabel="Aplicar correção"
        onConfirm={aplicar}
        loading={correcao.isPending}
      />
    </div>
  );
}
