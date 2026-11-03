import type { Metadata } from "next";
import { CatalogoCliente } from "@/components/catalogo-cliente";
import { LojaShell, ProdutosIndisponiveis } from "@/components/loja-shell";
import { buscarProdutos } from "@/lib/api";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Veja os produtos da beezpet para cães e gatos, monte o carrinho e envie o pedido pelo WhatsApp.",
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const [produtos, { categoria }] = await Promise.all([buscarProdutos(), searchParams]);
  return (
    <LojaShell produtos={produtos}>
      <div className="sobre-vinho bg-vinho px-4 py-8 text-manteiga sm:py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center sm:flex-row sm:gap-8 sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mascote-osso.webp" alt="" width={1100} height={722} fetchPriority="high" className="w-44 shrink-0 sm:w-60" />
          <div>
            <h1 className="titulo text-5xl font-bold sm:text-6xl">Catálogo</h1>
            <p className="mt-3 max-w-md text-sm text-rosa-claro sm:text-base">
              Escolha os produtos, coloque no carrinho e envie tudo para o nosso WhatsApp. Entrega em toda Manaus.
            </p>
          </div>
        </div>
      </div>
      {produtos ? (
        <CatalogoCliente produtos={produtos} categoriaInicial={categoria} />
      ) : (
        <div className="px-4 py-16">
          <ProdutosIndisponiveis />
        </div>
      )}
    </LojaShell>
  );
}
