"use client";

import { useState } from "react";
import { descontoPercentual, emPromocao, urlDaFoto, type ProdutoCatalogo } from "@/lib/catalogo";
import { formatBRL } from "@/lib/format";
import { useCarrinho } from "./carrinho-provider";

export function FotoProduto({ produto, className }: { produto: ProdutoCatalogo; className?: string }) {
  const [falhou, setFalhou] = useState(false);
  const foto = urlDaFoto(produto);
  if (!foto || falhou) {
    return (
      <div className={`flex items-center justify-center bg-rosa-claro ${className ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mascote.png" alt="" loading="lazy" className="h-2/3 w-2/3 rounded-full object-contain opacity-90" />
      </div>
    );
  }
  return (
    // A foto fica presa na caixa: uma imagem muito alta não pode esticar o quadrado do cartão.
    <div className={`relative overflow-hidden bg-white ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto}
        alt={produto.nome}
        loading="lazy"
        decoding="async"
        onError={() => setFalhou(true)}
        className="absolute inset-0 h-full w-full object-contain p-2"
      />
    </div>
  );
}

export function SeletorQuantidade({ produto, compacto }: { produto: ProdutoCatalogo; compacto?: boolean }) {
  const { itens, definirQuantidade } = useCarrinho();
  const quantidade = itens[produto.id] ?? 0;
  const tamanho = compacto ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="flex items-center justify-between gap-1 rounded-full bg-vinho p-1 text-manteiga">
      <button
        type="button"
        aria-label={`Diminuir ${produto.nome}`}
        onClick={() => definirQuantidade(produto.id, quantidade - 1)}
        className={`${tamanho} rounded-full text-lg font-bold hover:bg-vinho-claro`}
      >
        −
      </button>
      <span className="min-w-6 text-center text-sm font-bold" aria-live="polite">
        {quantidade}
      </span>
      <button
        type="button"
        aria-label={`Aumentar ${produto.nome}`}
        onClick={() => definirQuantidade(produto.id, quantidade + 1)}
        className={`${tamanho} rounded-full text-lg font-bold hover:bg-vinho-claro`}
      >
        +
      </button>
    </div>
  );
}

export function ProdutoCard({ produto }: { produto: ProdutoCatalogo }) {
  const { itens, definirQuantidade } = useCarrinho();
  return (
    <article className="adesivo relative flex h-full flex-col overflow-hidden rounded-2xl bg-creme">
      {emPromocao(produto) && (
        <span className="etiqueta-fita absolute left-2 top-2 z-10" aria-label={`${descontoPercentual(produto)}% de desconto`}>
          -{descontoPercentual(produto)}%
        </span>
      )}
      <FotoProduto produto={produto} className="aspect-square w-full border-b-2 border-vinho" />
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <h3 className="line-clamp-3 min-h-[3.75rem] text-[0.8rem] font-semibold leading-5 sm:text-sm sm:leading-5">{produto.nome}</h3>
        <div className="mt-auto">
          {emPromocao(produto) && (
            <p className="text-xs text-tinta-suave">
              <span className="sr-only">De </span>
              <s>{formatBRL(produto.valorOriginal!)}</s>
              <span className="sr-only"> por</span>
            </p>
          )}
          <p className="titulo text-xl font-bold text-vinho sm:text-2xl">{formatBRL(produto.valorVenda)}</p>
        </div>
        {itens[produto.id] ? (
          <SeletorQuantidade produto={produto} />
        ) : (
          <button
            type="button"
            aria-label={`Adicionar ${produto.nome}`}
            onClick={() => definirQuantidade(produto.id, 1)}
            className="botao min-h-12 w-full bg-manteiga px-3 text-sm text-vinho ring-2 ring-vinho hover:bg-rosa"
          >
            Adicionar
          </button>
        )}
      </div>
    </article>
  );
}
