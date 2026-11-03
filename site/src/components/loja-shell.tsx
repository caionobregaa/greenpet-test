"use client";

import Link from "next/link";
import type { ProdutoCatalogo } from "@/lib/catalogo";
import { formatBRL } from "@/lib/format";
import { FRASE_PRINCIPAL, LOJA } from "@/lib/loja";
import { WHATSAPP_CONTATO_URL } from "@/lib/pedido";
import { CarrinhoGaveta } from "./carrinho-gaveta";
import { CarrinhoProvider, useCarrinho } from "./carrinho-provider";
import { IconeCaixa, IconeWhatsApp } from "./icones";

function Cabecalho() {
  const { quantidadeTotal, abrir } = useCarrinho();
  return (
    <header className="sobre-vinho sticky top-0 z-40 bg-vinho text-manteiga shadow-[0_2px_0_var(--color-vinho-escuro)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" aria-label="beezpet, página inicial" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wordmark-amarelo.png" alt="beezpet" className="h-9 w-auto sm:h-11" />
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-2">
          <Link href="/a-marca" className="rounded-full px-2.5 py-2 text-sm font-semibold hover:bg-vinho-claro sm:px-3">
            A marca
          </Link>
          <Link href="/catalogo" className="rounded-full px-2.5 py-2 text-sm font-semibold hover:bg-vinho-claro sm:px-3">
            Catálogo
          </Link>
          <a
            href={WHATSAPP_CONTATO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chamar no WhatsApp"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-vinho-claro sm:flex"
          >
            <IconeWhatsApp className="h-4 w-4" />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={abrir}
            aria-label={`Abrir carrinho, ${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`}
            className="relative rounded-full bg-manteiga p-2.5 text-vinho hover:bg-rosa"
          >
            <IconeCaixa className="h-5 w-5" />
            {quantidadeTotal > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rosa px-1 text-[0.68rem] font-bold text-vinho ring-2 ring-vinho">
                {quantidadeTotal}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

/** Barra fixa: o spacer abaixo reserva o espaço dela, para não cobrir o conteúdo. */
function BarraCarrinho() {
  const { quantidadeTotal, total, abrir, aberto } = useCarrinho();
  if (quantidadeTotal === 0) return null;
  return (
    <>
      <div className="h-20" aria-hidden="true" />
      {!aberto && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-vinho bg-manteiga px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <p className="min-w-0 text-sm text-vinho">
              <span className="font-bold">
                {quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"}
              </span>{" "}
              · <span className="titulo text-lg font-bold">{formatBRL(total)}</span>
            </p>
            <button type="button" onClick={abrir} className="botao min-h-11 shrink-0 bg-vinho px-5 text-sm text-manteiga hover:bg-vinho-claro">
              Ver carrinho
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function AvisoCarrinho() {
  const { aviso } = useCarrinho();
  if (!aviso) return null;
  return (
    <p role="status" className="bg-manteiga-claro px-4 py-2 text-center text-sm font-medium text-vinho">
      {aviso}
    </p>
  );
}

function Rodape() {
  return (
    <footer className="sobre-vinho bg-vinho-escuro text-rosa-claro">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wordmark-amarelo.png" alt="beezpet" loading="lazy" className="h-12 w-auto" />
          <p className="mt-3 text-sm">{FRASE_PRINCIPAL}.</p>
          <p className="mt-3 text-sm">
            <Link href="/a-marca" className="font-semibold text-manteiga underline-offset-4 hover:underline">
              Conheça a marca
            </Link>
          </p>
        </div>
        <div className="space-y-1.5 text-sm">
          <p className="font-bold text-manteiga">Contato</p>
          <p>
            <a href={WHATSAPP_CONTATO_URL} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              WhatsApp {LOJA.whatsapp}
            </a>
          </p>
          <p>Atendimento {LOJA.horario}</p>
          <p>
            <a href={LOJA.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              Instagram @{LOJA.instagram}
            </a>
          </p>
        </div>
        <div className="space-y-1.5 text-sm">
          <p className="font-bold text-manteiga">Dados da empresa</p>
          <p className="text-xs opacity-80">{LOJA.razaoSocial}</p>
          <p className="text-xs opacity-80">CNPJ {LOJA.cnpj}</p>
        </div>
      </div>
    </footer>
  );
}

/** Aviso quando a API não responde: o cliente ainda consegue falar com a loja. */
export function ProdutosIndisponiveis() {
  return (
    <div role="alert" className="adesivo mx-auto max-w-lg rounded-2xl bg-creme p-8 text-center">
      <p className="titulo text-2xl font-bold text-vinho">Não conseguimos carregar os produtos agora</p>
      <p className="mt-2 text-sm text-tinta-suave">Tente de novo em instantes ou fale direto com a loja.</p>
      <a
        href={WHATSAPP_CONTATO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="botao mt-5 min-h-12 bg-whatsapp-escuro px-6 text-white"
      >
        <IconeWhatsApp className="h-5 w-5" />
        Chamar no WhatsApp
      </a>
    </div>
  );
}

export function LojaShell({ produtos, children }: { produtos: ProdutoCatalogo[] | null; children: React.ReactNode }) {
  return (
    <CarrinhoProvider produtos={produtos}>
      <Cabecalho />
      <AvisoCarrinho />
      <main>{children}</main>
      <Rodape />
      <BarraCarrinho />
      <CarrinhoGaveta />
    </CarrinhoProvider>
  );
}
