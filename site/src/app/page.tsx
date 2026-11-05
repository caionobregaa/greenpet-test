import Link from "next/link";
import { IconeWhatsApp, Manchas } from "@/components/icones";
import { LojaShell, ProdutosIndisponiveis } from "@/components/loja-shell";
import { ProdutoCard } from "@/components/produto-card";
import { FaixaProdutos } from "@/components/faixa-produtos";
import { buscarProdutos } from "@/lib/api";
import { emPromocao, montarVitrine } from "@/lib/catalogo";
import { LOJA } from "@/lib/loja";
import { WHATSAPP_CONTATO_URL } from "@/lib/pedido";

const FITA = ["Produtos selecionados", "Farejado e aprovado", "Entrega em toda Manaus", "Entrega grátis acima de R$ 80", "Pedido pelo WhatsApp"];

const PASSOS = [
  { titulo: "Escolha", texto: "Veja o catálogo e coloque no carrinho o que seu pet precisa." },
  { titulo: "Envie", texto: "Preencha seus dados e mande tudo de uma vez para o nosso WhatsApp." },
  { titulo: "A loja confirma", texto: "A gente confere a disponibilidade e finaliza o atendimento na conversa." },
];

const DIFERENCIAIS = [
  {
    titulo: "Produtos selecionados",
    texto: "Não vendemos qualquer ração. Cada uma precisa passar pelo nosso padrão mínimo de qualidade.",
  },
  { titulo: "Entrega grátis acima de R$ 80", texto: "Entregamos em toda Manaus. Abaixo desse valor, a taxa é combinada na conversa." },
  { titulo: "Lembrete de recompra", texto: "A gente avisa quando a ração ou o produto do seu pet deve estar acabando." },
  { titulo: "Atendimento pelo WhatsApp", texto: "Você fala direto com a loja para tirar dúvidas e fechar o pedido." },
];

const DADOS_ESTRUTURADOS = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: LOJA.nome,
  url: LOJA.url,
  image: `${LOJA.url}/brand/logo-beezpet.png`,
  telephone: "+5592984703686",
  sameAs: [LOJA.instagramUrl],
  areaServed: { "@type": "City", name: "Manaus" },
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
  // Campanhas ativas (specs/promocoes/spec-v1.md): maior desconto primeiro.
  const promocoes = (produtos ?? [])
    .filter(emPromocao)
    .sort((a, b) => b.valorOriginal! - b.valorVenda - (a.valorOriginal! - a.valorVenda))
    .slice(0, 8);

  return (
    <LojaShell produtos={produtos}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DADOS_ESTRUTURADOS) }} />

      <section className="grao sobre-vinho relative overflow-hidden bg-vinho text-manteiga">
        <Manchas className="pointer-events-none absolute -left-16 -top-10 w-72 text-vinho-claro/40 sm:w-96" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-16 lg:pt-14">
          <div>
            <p className="etiqueta-fita entrar">Pet shop online</p>
            {/* Frase principal do negócio: FRASE_PRINCIPAL em src/lib/loja.ts */}
            <h1 className="titulo entrar mt-5 text-balance text-[2.6rem] font-bold leading-[1] [animation-delay:80ms] sm:text-6xl lg:text-[4.1rem]">
              Produtos que fazem sentido <em className="font-medium text-rosa">de verdade</em> para a rotina do seu pet.
            </h1>
            <p className="entrar mt-6 max-w-lg text-base leading-relaxed text-rosa-claro [animation-delay:160ms] sm:text-lg">
              Escolha no catálogo e feche o pedido direto pelo nosso WhatsApp.
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
            <p className="entrar mt-5 flex items-center gap-2 text-sm font-semibold text-manteiga [animation-delay:300ms]">
              <span className="h-2 w-2 rounded-full bg-rosa" aria-hidden="true" />
              {LOJA.areaEntrega}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mascote-entrega.webp"
            alt="Beez, o mascote da beezpet, correndo com caixas de entrega nas costas e boné rosa"
            width={1100}
            height={850}
            fetchPriority="high"
            className="caixa-cai w-full max-w-xl justify-self-center drop-shadow-[0_18px_0_rgb(63_16_39/0.35)]"
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

      {promocoes.length > 0 && (
        <section id="promocoes" className="bg-manteiga-claro py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="etiqueta-fita">Por tempo limitado</p>
                <h2 className="titulo mt-3 text-4xl font-bold text-vinho sm:text-6xl">Promoções</h2>
              </div>
              <Link href="/catalogo?promocoes" className="botao min-h-12 bg-vinho px-6 text-manteiga hover:bg-vinho-claro">
                Ver todas as promoções
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {promocoes.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="produtos" className="border-t-2 border-vinho/15 bg-creme py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="etiqueta-fita">Selecionados</p>
              <h2 className="titulo mt-3 text-4xl font-bold text-vinho sm:text-6xl">Nossa seleção</h2>
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
                <FaixaProdutos categoria={grupo.categoria} produtos={grupo.produtos} />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-rosa py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="titulo text-4xl font-bold text-vinho sm:text-5xl">Por que a beezpet</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {DIFERENCIAIS.map((item, i) => (
              <div key={item.titulo} className={`adesivo rounded-2xl bg-creme p-6 ${i === 0 ? "bg-manteiga-claro lg:-rotate-1" : ""}`}>
                <h3 className="titulo text-2xl font-bold leading-tight text-vinho">{item.titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grao sobre-vinho relative overflow-hidden bg-vinho text-manteiga">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-[auto_1fr] md:gap-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mascote-brincando.webp" alt="" loading="lazy" width={1100} height={956} className="mx-auto w-56 md:w-72" />
          <div>
            <p className="etiqueta-fita">A marca</p>
            <p className="titulo mt-4 text-3xl font-bold leading-tight sm:text-5xl">
              Beez é o amigo que <em className="font-medium text-rosa">entende de pet.</em>
            </p>
            <Link
              href="/a-marca"
              className="botao mt-6 min-h-12 bg-manteiga px-7 text-vinho shadow-[4px_4px_0_var(--color-rosa)] hover:bg-white"
            >
              Conheça a marca
            </Link>
          </div>
        </div>
      </section>
    </LojaShell>
  );
}
