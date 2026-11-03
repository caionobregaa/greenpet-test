import type { LinhaCarrinho } from "./carrinho";
import { calcularTotal } from "./carrinho";
import { formatBRL } from "./format";
import { LOJA } from "./loja";

export const OPCOES_PET = ["Cão", "Gato", "Ambos"];
// Mesmas opções do recibo (frontend/src/lib/utils/formas-pagamento.ts), sem taxa e sem boleto.
export const OPCOES_PAGAMENTO = ["PIX", "Dinheiro", "Débito", "Crédito 1x", "Crédito 2x", "Crédito 3x"];

export interface DadosCliente {
  nome: string;
  telefone: string;
  pet: string;
  endereco: string;
  pagamento: string;
}

export type ErrosCliente = Partial<Record<keyof DadosCliente, string>>;

export const DADOS_VAZIOS: DadosCliente = { nome: "", telefone: "", pet: "", endereco: "", pagamento: "" };

/** Máscara de telefone enquanto o cliente digita: (92) 99999-0000. */
export function mascararTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  const corte = d.length === 11 ? 7 : 6;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
}

export function validarCliente(dados: DadosCliente): ErrosCliente {
  const erros: ErrosCliente = {};
  const digitos = dados.telefone.replace(/\D/g, "").length;
  if (!dados.nome.trim()) erros.nome = "Informe seu nome";
  if (digitos !== 10 && digitos !== 11) erros.telefone = "Informe o telefone com DDD";
  if (!OPCOES_PET.includes(dados.pet)) erros.pet = "Escolha uma opção";
  if (!dados.endereco.trim()) erros.endereco = "Informe o endereço";
  if (!OPCOES_PAGAMENTO.includes(dados.pagamento)) erros.pagamento = "Escolha a forma de pagamento";
  return erros;
}

/** Modelo em specs/catalogo/rules.md. */
export function montarMensagem(linhas: LinhaCarrinho[], dados: DadosCliente): string {
  const itens = linhas.map((l) => `${l.quantidade}x ${l.produto.nome} — ${formatBRL(l.subtotal)}`);
  return [
    "Olá! Vim pelo site da BEEZ PET",
    "",
    "*Pedido*",
    ...itens,
    `*Total estimado:* ${formatBRL(calcularTotal(linhas))}`,
    "",
    "*Meus dados*",
    `Nome: ${dados.nome.trim()}`,
    `Telefone: ${dados.telefone}`,
    `Pet: ${dados.pet}`,
    `Endereço: ${dados.endereco.trim()}`,
    `Pagamento: ${dados.pagamento}`,
    "",
    "Pode confirmar a disponibilidade?",
  ].join("\n");
}

/** Link do WhatsApp oficial; o número local recebe o DDI do Brasil. */
export function whatsappUrl(texto: string): string {
  return `https://wa.me/55${LOJA.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
}

export const WHATSAPP_CONTATO_URL = whatsappUrl("Olá! Vim pelo site da BEEZ PET");

/** Mensagem da barra do carrinho sobre a entrega. */
export function avisoEntrega(total: number): string {
  if (total >= LOJA.freteGratisPiso) return "Entrega grátis neste pedido";
  return `Faltam ${formatBRL(LOJA.freteGratisPiso - total)} para a entrega grátis. Abaixo disso, a taxa é combinada na conversa.`;
}
