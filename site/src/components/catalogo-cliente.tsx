"use client";

import { useMemo, useState } from "react";
import { agruparPorCategoria, emPromocao, filtrarProdutos, type ProdutoCatalogo } from "@/lib/catalogo";
import { ProdutoCard } from "./produto-card";

const ESPECIES = ["Cão", "Gato"];

function Filtro({ ativo, children, onClick }: { ativo: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`shrink-0 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        ativo ? "border-vinho bg-vinho text-manteiga" : "border-vinho/30 bg-creme text-vinho hover:border-vinho"
      }`}
    >
      {children}
    </button>
  );
}

export function CatalogoCliente({
  produtos,
  categoriaInicial,
  promocaoInicial,
}: {
  produtos: ProdutoCatalogo[];
  categoriaInicial?: string;
  promocaoInicial?: boolean;
}) {
  const categorias = useMemo(() => agruparPorCategoria(produtos).map((g) => g.categoria), [produtos]);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState(
    categoriaInicial && categorias.includes(categoriaInicial) ? categoriaInicial : "",
  );
  const [especie, setEspecie] = useState("");
  const [promocao, setPromocao] = useState(!!promocaoInicial);
  const temPromocao = useMemo(() => produtos.some(emPromocao), [produtos]);

  const grupos = useMemo(
    () =>
      agruparPorCategoria(filtrarProdutos(produtos, { busca, categoria, especie, promocao: promocao && temPromocao }))
        // Com categoria escolhida, só a seção dela: o produto não abre a seção das outras categorias que tem.
        .filter((g) => !categoria || g.categoria === categoria),
    [produtos, busca, categoria, especie, promocao, temPromocao],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="sticky top-16 z-20 -mx-4 space-y-3 border-b-2 border-vinho/15 bg-papel/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto pelo nome"
          aria-label="Buscar produto pelo nome"
          className="w-full rounded-full border-2 border-vinho bg-creme px-5 py-3 text-base outline-none placeholder:text-tinta-suave/70 focus:shadow-[3px_3px_0_var(--color-vinho)]"
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {temPromocao && (
            <Filtro ativo={promocao} onClick={() => setPromocao(!promocao)}>Promoções</Filtro>
          )}
          <Filtro ativo={!categoria} onClick={() => setCategoria("")}>Todas</Filtro>
          {categorias.map((c) => (
            <Filtro key={c} ativo={categoria === c} onClick={() => setCategoria(c)}>{c}</Filtro>
          ))}
          <span className="mx-1 w-0.5 shrink-0 self-stretch bg-vinho/20" aria-hidden="true" />
          {ESPECIES.map((e) => (
            <Filtro key={e} ativo={especie === e} onClick={() => setEspecie(especie === e ? "" : e)}>{e}</Filtro>
          ))}
        </div>
      </div>

      {grupos.length === 0 ? (
        <div className="py-20 text-center">
          <p className="titulo text-2xl font-bold text-vinho">Nenhum produto encontrado</p>
          <p className="mt-2 text-sm text-tinta-suave">Tente outra palavra ou limpe os filtros.</p>
        </div>
      ) : (
        grupos.map((grupo) => (
          <section key={grupo.categoria} aria-labelledby={`cat-${grupo.categoria}`} className="pt-10">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 id={`cat-${grupo.categoria}`} className="titulo text-3xl font-bold text-vinho sm:text-4xl">
                {grupo.categoria}
              </h2>
              <span className="text-sm text-tinta-suave">
                {grupo.produtos.length} {grupo.produtos.length === 1 ? "produto" : "produtos"}
              </span>
            </div>
            {grupo.categoria === "Medicamento" && (
              <p className="mt-2 text-sm text-tinta-suave">A loja confirma na conversa se o item exige receita.</p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {grupo.produtos.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
