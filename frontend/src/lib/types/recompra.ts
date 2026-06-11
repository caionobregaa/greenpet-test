export type Urgencia = "vencido" | "urgente" | "proximo" | "ok";

export interface RecompraAlerta {
  clienteId: string;
  clienteNome: string;
  animalId?: string;
  animalNome?: string;
  produtoId: string;
  produtoNome: string;
  ultimaCompra: string;
  diasRecompra: number;
  previsaoRecompra: string;
  diasRestantes: number;
  urgencia: Urgencia;
}
