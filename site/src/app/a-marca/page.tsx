import type { Metadata } from "next";
import Link from "next/link";
import { Manchas } from "@/components/icones";
import { LojaShell } from "@/components/loja-shell";
import { buscarProdutos } from "@/lib/api";

export const metadata: Metadata = {
  title: "Conheça a marca",
  description:
    "Beez é o nome do mascote e o amigo que entende de pet. Conheça a história e a identidade da Beez Pet.",
  alternates: { canonical: "/a-marca" },
};

// Texto da marca enviado pelo usuário (specs/site/spec-v3.md), sem alterar o conteúdo.
const PARAGRAFOS = [
  "A marca Beez Pet nasce como um nome simples, afetivo e fácil de lembrar e pronunciar. “Beez” é o nome do mascote e traduz naturalmente a relação de proximidade entre tutores e seus pets: é o amigo que entende de pet, a quem se recorre quando surge uma dúvida.",
  "Isso permite que a marca vá além da venda de produtos e acompanhe sua futura expansão para diferentes experiências de cuidado e bem-estar animal.",
  "A conexão com Manaus e a região amazônica deixa de acontecer de forma literal no nome e passa a fazer parte da identidade visual. Ela aparece na paleta de cores e, principalmente, no mascote: um personagem autoral e fantasioso, que não representa uma espécie específica, mas traz referências sutis à fauna brasileira, como a estampa que remete à onça. Essa escolha permite trabalhar a regionalidade de maneira criativa e contemporânea, sem limitar a marca geograficamente ou transformar o elemento amazônico em um estereótipo.",
  "O resultado é uma identidade jovem, moderna, divertida e próxima, capaz de conversar com um público de maior poder aquisitivo sem assumir uma estética excessivamente séria ou tradicional. A Beez Pet mantém suas raízes, mas as transforma em personalidade, criando um universo próprio, reconhecível e preparado para crescer.",
];

export default async function MarcaPage() {
  // Os produtos mantêm o carrinho conferido também nesta página.
  const produtos = await buscarProdutos();
  return (
    <LojaShell produtos={produtos}>
      <section className="grao sobre-vinho relative overflow-hidden bg-vinho text-manteiga">
        <Manchas className="pointer-events-none absolute -right-16 -top-10 w-72 text-vinho-claro/40 sm:w-96" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:pb-14">
          <div>
            <p className="etiqueta-fita entrar">A marca</p>
            <h1 className="titulo entrar mt-5 text-5xl font-bold leading-[0.95] [animation-delay:80ms] sm:text-7xl">
              Conheça a <em className="font-medium text-rosa">Beez.</em>
            </h1>
            <p className="titulo entrar mt-6 max-w-lg text-2xl leading-snug text-rosa-claro [animation-delay:160ms] sm:text-3xl">
              “É o amigo que entende de pet, a quem se recorre quando surge uma dúvida.”
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mascote-sentado.webp"
            alt="Beez, o mascote da Beez Pet, sentado e sorrindo"
            width={1048}
            height={1100}
            fetchPriority="high"
            className="caixa-cai w-full max-w-sm justify-self-center drop-shadow-[0_18px_0_rgb(63_16_39/0.35)]"
          />
        </div>
      </section>

      <article className="bg-papel px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-lg leading-relaxed text-tinta">
          {PARAGRAFOS.map((texto, i) => (
            <p key={i} className={i === 0 ? "titulo text-2xl leading-snug text-vinho sm:text-3xl" : undefined}>
              {texto}
            </p>
          ))}
        </div>
      </article>

      <section className="bg-rosa px-4 py-14 text-center sm:px-6">
        <p className="titulo text-3xl font-bold text-vinho sm:text-4xl">Veja o que a Beez selecionou</p>
        <Link href="/catalogo" className="botao mt-6 min-h-14 bg-vinho px-8 text-lg text-manteiga hover:bg-vinho-claro">
          Ver catálogo
        </Link>
      </section>
    </LojaShell>
  );
}
