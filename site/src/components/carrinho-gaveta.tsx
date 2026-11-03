"use client";

import { useEffect, useRef, useState } from "react";
import { formatBRL } from "@/lib/format";
import {
  avisoEntrega,
  DADOS_VAZIOS,
  mascararTelefone,
  montarMensagem,
  OPCOES_PAGAMENTO,
  OPCOES_PET,
  validarCliente,
  whatsappUrl,
  type DadosCliente,
  type ErrosCliente,
} from "@/lib/pedido";
import { LOJA } from "@/lib/loja";
import { useCarrinho } from "./carrinho-provider";
import { FotoProduto, SeletorQuantidade } from "./produto-card";
import { IconeFechar, IconeWhatsApp } from "./icones";

const CAMPO =
  "mt-1 w-full rounded-xl border-2 border-vinho/30 bg-creme px-3 py-2.5 text-base outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-vinho aria-[invalid=true]:border-erro";

function Erro({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} className="mt-1 text-xs font-semibold text-erro">
      {texto}
    </p>
  );
}

function GrupoOpcoes({
  legenda,
  nome,
  opcoes,
  valor,
  erro,
  aoEscolher,
}: {
  legenda: string;
  nome: string;
  opcoes: string[];
  valor: string;
  erro?: string;
  aoEscolher: (opcao: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legenda}</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {opcoes.map((opcao) => (
          <label
            key={opcao}
            className={`cursor-pointer rounded-full border-2 px-3.5 py-2 text-sm font-semibold transition-colors has-focus-visible:outline-3 has-focus-visible:outline-vinho ${
              valor === opcao ? "border-vinho bg-vinho text-manteiga" : "border-vinho/30 bg-creme hover:border-vinho"
            }`}
          >
            <input
              type="radio"
              name={nome}
              value={opcao}
              checked={valor === opcao}
              onChange={() => aoEscolher(opcao)}
              className="sr-only"
            />
            {opcao}
          </label>
        ))}
      </div>
      <Erro id={`erro-${nome}`} texto={erro} />
    </fieldset>
  );
}

export function CarrinhoGaveta() {
  const { aberto, fechar, linhas, total, definirQuantidade, limpar } = useCarrinho();
  const [dados, setDados] = useState<DadosCliente>(DADOS_VAZIOS);
  const [erros, setErros] = useState<ErrosCliente>({});
  const [enviado, setEnviado] = useState(false);
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    setEnviado(false);
    fecharRef.current?.focus();
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, fechar]);

  if (!aberto) return null;

  function atualizar(campo: keyof DadosCliente, valor: string) {
    setDados((atuais) => ({ ...atuais, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const encontrados = validarCliente(dados);
    setErros(encontrados);
    if (linhas.length === 0 || Object.keys(encontrados).length > 0) return;
    window.open(whatsappUrl(montarMensagem(linhas, dados)), "_blank", "noopener,noreferrer");
    setEnviado(true);
  }

  function concluir() {
    limpar();
    setDados(DADOS_VAZIOS);
    fechar();
  }

  const temMedicamento = linhas.some((l) => l.produto.categoria === "Medicamento");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
      <button type="button" aria-label="Fechar carrinho" tabIndex={-1} onClick={fechar} className="aparece absolute inset-0 bg-vinho-escuro/60" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-carrinho"
        className="gaveta relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-papel sm:max-h-none sm:max-w-md sm:rounded-none sm:border-l-4 sm:border-vinho"
      >
        <header className="flex items-center justify-between bg-vinho px-5 py-4 text-manteiga sobre-vinho">
          <h2 id="titulo-carrinho" className="titulo text-2xl font-bold">
            Seu pedido
          </h2>
          <button ref={fecharRef} type="button" aria-label="Fechar" onClick={fechar} className="rounded-full p-2 hover:bg-vinho-claro">
            <IconeFechar className="h-5 w-5" />
          </button>
        </header>

        {enviado ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="titulo text-3xl font-bold text-vinho">Pedido pronto no WhatsApp</p>
            <p className="text-sm text-tinta-suave">
              Confira a mensagem e toque em enviar por lá. A loja continua o atendimento com você na conversa.
            </p>
            <button type="button" onClick={concluir} className="botao min-h-12 bg-vinho px-6 text-manteiga">
              Concluir e limpar carrinho
            </button>
            <button type="button" onClick={() => setEnviado(false)} className="text-sm font-semibold text-vinho underline">
              Voltar ao pedido
            </button>
          </div>
        ) : linhas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
            <p className="titulo text-2xl font-bold text-vinho">Seu carrinho está vazio</p>
            <p className="text-sm text-tinta-suave">Adicione produtos para montar o pedido.</p>
          </div>
        ) : (
          <form noValidate onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
              <ul className="space-y-3">
                {linhas.map((linha) => (
                  <li key={linha.produto.id} className="flex gap-3 rounded-2xl bg-creme p-2.5 ring-1 ring-vinho/15">
                    <FotoProduto produto={linha.produto} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold leading-4">{linha.produto.nome}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="w-28">
                          <SeletorQuantidade produto={linha.produto} compacto />
                        </div>
                        <p className="text-sm font-bold text-vinho">{formatBRL(linha.subtotal)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => definirQuantidade(linha.produto.id, 0)}
                        aria-label={`Remover ${linha.produto.nome}`}
                        className="mt-1 text-xs font-semibold text-tinta-suave underline"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {temMedicamento && (
                <p className="rounded-xl bg-manteiga-claro p-3 text-xs font-medium">
                  A loja confirma na conversa se algum medicamento exige receita.
                </p>
              )}

              <div className="space-y-4">
                <h3 className="titulo text-xl font-bold text-vinho">Seus dados</h3>
                <div>
                  <label htmlFor="nome" className="text-sm font-semibold">Nome do cliente</label>
                  <input
                    id="nome"
                    autoComplete="name"
                    value={dados.nome}
                    onChange={(e) => atualizar("nome", e.target.value)}
                    aria-invalid={!!erros.nome}
                    aria-describedby="erro-nome"
                    className={CAMPO}
                  />
                  <Erro id="erro-nome" texto={erros.nome} />
                </div>
                <div>
                  <label htmlFor="telefone" className="text-sm font-semibold">Telefone</label>
                  <input
                    id="telefone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(92) 99999-0000"
                    value={dados.telefone}
                    onChange={(e) => atualizar("telefone", mascararTelefone(e.target.value))}
                    aria-invalid={!!erros.telefone}
                    aria-describedby="erro-telefone"
                    className={CAMPO}
                  />
                  <Erro id="erro-telefone" texto={erros.telefone} />
                </div>
                <GrupoOpcoes
                  legenda="Cão ou gato"
                  nome="pet"
                  opcoes={OPCOES_PET}
                  valor={dados.pet}
                  erro={erros.pet}
                  aoEscolher={(v) => atualizar("pet", v)}
                />
                <div>
                  <label htmlFor="endereco" className="text-sm font-semibold">Endereço</label>
                  <textarea
                    id="endereco"
                    rows={2}
                    autoComplete="street-address"
                    placeholder="Rua, número, bairro e referência"
                    value={dados.endereco}
                    onChange={(e) => atualizar("endereco", e.target.value)}
                    aria-invalid={!!erros.endereco}
                    aria-describedby="erro-endereco"
                    className={CAMPO}
                  />
                  <Erro id="erro-endereco" texto={erros.endereco} />
                </div>
                <GrupoOpcoes
                  legenda="Forma de pagamento"
                  nome="pagamento"
                  opcoes={OPCOES_PAGAMENTO}
                  valor={dados.pagamento}
                  erro={erros.pagamento}
                  aoEscolher={(v) => atualizar("pagamento", v)}
                />
              </div>
            </div>

            <footer className="space-y-2 border-t-2 border-vinho bg-creme p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold">Total estimado</span>
                <span className="titulo text-2xl font-bold text-vinho">{formatBRL(total)}</span>
              </div>
              <p className={`text-xs ${total >= LOJA.freteGratisPiso ? "font-bold text-whatsapp-escuro" : "text-tinta-suave"}`}>
                {avisoEntrega(total)}
              </p>
              <button type="submit" className="botao min-h-13 w-full bg-whatsapp-escuro px-4 py-3 text-white hover:bg-[#0f7a41]">
                <IconeWhatsApp className="h-5 w-5" />
                Enviar pedido pelo WhatsApp
              </button>
            </footer>
          </form>
        )}
      </aside>
    </div>
  );
}
