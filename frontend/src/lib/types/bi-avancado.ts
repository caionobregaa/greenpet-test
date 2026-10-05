export interface ClienteLtv {
  clienteId: string;
  nome: string;
  totalGasto: number;
  totalVendas: number;
}

export interface TaxaRecompra {
  percentual: number;
  clientesComRecompra: number;
  totalClientes: number;
}

export interface CicloRecompraCategoria {
  categoria: string;
  cicloMedioDias: number | null;
  amostras: number;
}

export interface MargemCategoria {
  categoria: string;
  margemMediaCatalogo: number | null;
  margemRealizada: number | null;
}

export interface MotivoSumidoContagem {
  motivo: string;
  quantidade: number;
  percentual: number;
}

export interface BiAvancado {
  motivosClientesSumidos: { totalRegistros: number; motivos: MotivoSumidoContagem[] };
  rankingLtv: { clientes: ClienteLtv[]; total: number };
  taxaRecompra: TaxaRecompra;
  cicloRecompraPorCategoria: CicloRecompraCategoria[];
  margemPorCategoria: MargemCategoria[];
}

export interface DistribuidoraMensal {
  fornecedor: string;
  total: number;
  porMes: Record<string, number>;
}

export interface ComprasDistribuidoraMensal {
  meses: string[];
  distribuidoras: DistribuidoraMensal[];
  totaisPorMes: Record<string, number>;
}
