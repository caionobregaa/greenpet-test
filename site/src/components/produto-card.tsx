"use client";

import { useState } from "react";
import { urlDaFoto, type ProdutoCatalogo } from "@/lib/catalogo";
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
    <div className={`bg-white ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto}
        alt={produto.nome}
        loading="lazy"
        decoding="async"
        onError={() => setFalhou(true)}
        className="h-full w-full object-contain"
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
    <article className="adesivo flex h-full flex-col overflow-hidden rounded-2xl bg-creme">
      <FotoProduto produto={produto} className="aspect-square w-full border-b-2 border-vinho" />
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <h3 className="line-clamp-3 min-h-[3.75rem] text-[0.8rem] font-semibold leading-5 sm:text-sm sm:leading-5">{produto.nome}</h3>
        <p className="titulo mt-auto text-xl font-bold text-vinho sm:text-2xl">{formatBRL(produto.valorVenda)}</p>
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
