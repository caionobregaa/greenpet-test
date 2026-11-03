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
      <div className="sobre-vinho bg-vinho px-4 py-10 text-center text-manteiga sm:py-14">
        <h1 className="titulo text-5xl font-bold sm:text-6xl">Catálogo</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-rosa-claro sm:text-base">
          Escolha os produtos, coloque no carrinho e envie tudo para o nosso WhatsApp.
        </p>
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
