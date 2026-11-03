import Link from "next/link";
import { IconeWhatsApp, Manchas } from "@/components/icones";
import { LojaShell, ProdutosIndisponiveis } from "@/components/loja-shell";
import { ProdutoCard } from "@/components/produto-card";
import { buscarProdutos } from "@/lib/api";
import { montarVitrine } from "@/lib/catalogo";
import { ENDERECO_COMPLETO, LOJA, MAPA_URL } from "@/lib/loja";
import { WHATSAPP_CONTATO_URL } from "@/lib/pedido";

const FITA = ["Entrega grátis acima de R$ 80", "Pedido pelo WhatsApp", "Para cães e gatos", "Praça 14 de Janeiro, Manaus"];

const PASSOS = [
  { titulo: "Escolha", texto: "Veja o catálogo e coloque no carrinho o que seu pet precisa." },
  { titulo: "Envie", texto: "Preencha seus dados e mande tudo de uma vez para o nosso WhatsApp." },
  { titulo: "A loja confirma", texto: "A gente confere a disponibilidade e finaliza o atendimento na conversa." },
];

const DIFERENCIAIS = [
  { titulo: "Entrega grátis acima de R$ 80", texto: "Abaixo desse valor, a taxa é combinada na conversa." },
  { titulo: "Lembrete de recompra", texto: "A gente avisa quando a ração ou o produto do seu pet deve estar acabando." },
  { titulo: "Atendimento pelo WhatsApp", texto: "Você fala direto com a loja para tirar dúvidas e fechar o pedido." },
];

const DADOS_ESTRUTURADOS = {
  "@context": "https://schema.org",
  "@type": "PetStore",
  name: LOJA.nome,
  url: LOJA.url,
  image: `${LOJA.url}/brand/logo-beezpet.png`,
  telephone: "+5592984703686",
  sameAs: [LOJA.instagramUrl],
  address: {
    "@type": "PostalAddress",
    streetAddress: LOJA.endereco,
    addressLocality: LOJA.cidade,
    addressRegion: LOJA.uf,
    postalCode: LOJA.cep,
    addressCountry: "BR",
  },
};

function Fita() {
  const itens = [...FITA, ...FITA, ...FITA, ...FITA];
  return (
    <div className="relative z-10 -my-3 overflow-x-clip">
      <div className="fita -mx-4 -rotate-1 overflow-hidden border-y-2 border-vinho py-2.5 text-vinho">
      <div className="fita-corre flex w-max" aria-hidden="true">
        {itens.map((texto, i) => (
          <span key={i} className="flex items-center whitespace-nowrap px-5 text-xs font-bold uppercase tracking-[0.12em]">
            {texto}
            <span className="ml-10 h-2 w-3 rounded-full bg-vinho" />
          </span>
        ))}
      </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const produtos = await buscarProdutos();
  const vitrine = produtos ? montarVitrine(produtos) : [];

  return (
    <LojaShell produtos={produtos}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DADOS_ESTRUTURADOS) }} />

      <section className="grao sobre-vinho relative overflow-hidden bg-vinho text-manteiga">
        <Manchas className="pointer-events-none absolute -left-16 -top-10 w-72 text-vinho-claro/40 sm:w-96" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-16 lg:pt-14">
          <div>
            <p className="etiqueta-fita entrar">Pet shop em Manaus</p>
            <h1 className="titulo entrar mt-5 text-[3.4rem] font-bold leading-[0.95] [animation-delay:80ms] sm:text-7xl lg:text-[5.4rem]">
              Tudo pro seu pet, <em className="font-medium text-rosa">sem sair de casa.</em>
            </h1>
            <p className="entrar mt-6 max-w-lg text-base leading-relaxed text-rosa-claro [animation-delay:160ms] sm:text-lg">
              Escolha no catálogo, envie o pedido pelo WhatsApp e a gente cuida do resto com você.
            </p>
            <div className="entrar mt-8 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
              <Link
                href="/catalogo"
                className="botao min-h-14 bg-manteiga px-8 text-lg text-vinho shadow-[4px_4px_0_var(--color-rosa)] hover:bg-white"
              >
                Ver catálogo
              </Link>
              <a
                href={WHATSAPP_CONTATO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="botao min-h-14 px-6 text-manteiga ring-2 ring-manteiga hover:bg-vinho-claro"
              >
                <IconeWhatsApp className="h-5 w-5" />
                Chamar no WhatsApp
              </a>
            </div>
          </div>
          {/* A arte tem o mesmo fundo #641d3f da seção (specs/identidade-visual/spec-v1.md). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mascote-caixas.webp"
            alt="Mascote da beezpet, um cachorro amarelo com manchas vinho, sentado ao lado de caixas de entrega"
            width={900}
            height={602}
            fetchPriority="high"
            className="caixa-cai w-full max-w-2xl justify-self-center"
          />
        </div>
      </section>

      <Fita />

      <section id="como-funciona" className="bg-papel pb-16 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="titulo text-4xl font-bold text-vinho sm:text-5xl">Como funciona</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex items-start gap-4 md:block">
                <span className="titulo block text-7xl font-bold italic leading-none text-rosa [-webkit-text-stroke:2px_var(--color-vinho)] md:text-8xl">
                  {i + 1}
                </span>
                <div className="md:mt-3">
                  <h3 className="titulo text-2xl font-bold text-vinho">{passo.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-tinta-suave sm:text-base">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="produtos" className="border-t-2 border-vinho/15 bg-creme py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="etiqueta-fita">Direto da loja</p>
              <h2 className="titulo mt-3 text-4xl font-bold text-vinho sm:text-6xl">Produtos da loja</h2>
            </div>
            <Link href="/catalogo" className="botao min-h-12 bg-vinho px-6 text-manteiga hover:bg-vinho-claro">
              Ver catálogo completo
            </Link>
          </div>

          {!produtos ? (
            <div className="mt-10">
              <ProdutosIndisponiveis />
            </div>
          ) : (
            vitrine.map((grupo) => (
              <div key={grupo.categoria} className="mt-12">
                <div className="flex items-baseline justify-between gap-3 border-b-2 border-vinho pb-2">
                  <h3 className="titulo text-2xl font-bold text-vinho sm:text-3xl">{grupo.categoria}</h3>
                  <Link
                    href={`/catalogo?categoria=${encodeURIComponent(grupo.categoria)}`}
                    aria-label={`Ver todos os produtos de ${grupo.categoria}`}
                    className="shrink-0 text-sm font-bold text-vinho underline underline-offset-4 hover:text-vinho-claro"
                  >
                    Ver todos
                  </Link>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                  {grupo.produtos.map((p) => (
                    <ProdutoCard key={p.id} produto={p} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-rosa py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="titulo text-4xl font-bold text-vinho sm:text-5xl">Por que a beezpet</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {DIFERENCIAIS.map((item, i) => (
              <div key={item.titulo} className={`adesivo rounded-2xl bg-creme p-6 ${i === 1 ? "md:-rotate-1" : ""}`}>
                <h3 className="titulo text-2xl font-bold leading-tight text-vinho">{item.titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="loja" className="grao sobre-vinho relative overflow-hidden bg-vinho py-16 text-manteiga">
        <Manchas className="pointer-events-none absolute -bottom-20 -right-16 w-80 text-vinho-claro/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="titulo text-4xl font-bold sm:text-6xl">Passa aqui na loja</h2>
          <p className="mt-4 max-w-xl text-lg text-rosa-claro">{ENDERECO_COMPLETO}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={MAPA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="botao min-h-13 bg-manteiga px-7 py-3 text-vinho hover:bg-white"
            >
              Ver no mapa
            </a>
            <a
              href={LOJA.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="botao min-h-13 px-7 py-3 text-manteiga ring-2 ring-manteiga hover:bg-vinho-claro"
            >
              Instagram @{LOJA.instagram}
            </a>
          </div>
        </div>
      </section>
    </LojaShell>
  );
}
