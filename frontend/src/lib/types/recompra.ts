export type Urgencia = "vencido" | "urgente" | "proximo" | "ok";

export interface RecompraAlerta {
  id?: string;
  isManual?: boolean;
  clienteId: string;
  clienteNome: string;
  animalId?: string;
  animalNome?: string;
  produtoId: string;
  produtoNome: string;
  ultimaCompra: string;
  diasRecompra: number;
  diasRestantes: number;
  urgencia: Urgencia;
  clienteTelefone: string;
  /** Mensagem de lembrete enviada neste ciclo de recompra (null = a enviar). */
  mensagemEnviadaEm: string | null;
  mensagemEnviadaPor: string | null;
  motivosSumido: MotivosSumidoRegistro | null;
}

export interface MotivosSumidoRegistro {
  motivos: string[];
  outroTexto: string | null;
  registradoEm: string;
}

export interface ClienteSumidoAlerta extends RecompraAlerta {
  diasAtraso: number;
}

/** Ciclo de recompra: o alerta + a venda que o originou (specs/recompra/spec-v2.md). */
export interface CicloRecompra {
  clienteId: string;
  produtoId: string;
  animalId: string;
  ultimaCompra: string;
}

export function cicloDoAlerta(a: RecompraAlerta): CicloRecompra {
  return { clienteId: a.clienteId, produtoId: a.produtoId, animalId: a.animalId ?? "", ultimaCompra: a.ultimaCompra };
}

/** Data prevista da recompra (hoje + diasRestantes), em YYYY-MM-DD local. */
export function previsaoRecompra(a: { diasRestantes: number }, hoje: Date = new Date()): string {
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + a.diasRestantes);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const MOTIVOS_SUMIDO = [
  "Preço",
  "Comprou em outro lugar",
  "Trocou de produto/ração",
  "Animal faleceu/foi doado",
  "Mudou de cidade",
  "Insatisfeito com produto/atendimento",
  "Ainda tem produto em casa",
  "Não respondeu",
  "Outro",
] as const;
