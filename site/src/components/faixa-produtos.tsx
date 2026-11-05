"use client";

import { useRef } from "react";
import type { ProdutoCatalogo } from "@/lib/catalogo";
import { ProdutoCard } from "./produto-card";

/** Faixa que desliza para o lado, com setas no computador (specs/site/spec-v5.md). */
export function FaixaProdutos({ categoria, produtos }: { categoria: string; produtos: ProdutoCatalogo[] }) {
  const trilho = useRef<HTMLUListElement>(null);

  function rolar(direcao: 1 | -1) {
    const el = trilho.current;
    if (el) el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative mt-5">
      <ul
        ref={trilho}
        role="list"
        aria-label={`Produtos de ${categoria}`}
        className="faixa -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3 sm:mx-0 sm:gap-5 sm:px-0 sm:scroll-px-0"
      >
        {produtos.map((p) => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-56 lg:w-60">
            <ProdutoCard produto={p} />
          </li>
        ))}
      </ul>
      {produtos.length > 2 && (
        <>
          <button
            type="button"
            onClick={() => rolar(-1)}
            aria-label={`Voltar produtos de ${categoria}`}
            className="absolute -left-3 top-1/3 hidden h-11 w-11 items-center justify-center rounded-full bg-vinho text-xl font-bold text-manteiga shadow-[3px_3px_0_var(--color-rosa)] hover:bg-vinho-claro md:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => rolar(1)}
            aria-label={`Avançar produtos de ${categoria}`}
            className="absolute -right-3 top-1/3 hidden h-11 w-11 items-center justify-center rounded-full bg-vinho text-xl font-bold text-manteiga shadow-[3px_3px_0_var(--color-rosa)] hover:bg-vinho-claro md:flex"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
