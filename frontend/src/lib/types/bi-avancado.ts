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

export interface BiAvancado {
  rankingLtv: { clientes: ClienteLtv[]; total: number };
  taxaRecompra: TaxaRecompra;
  cicloRecompraPorCategoria: CicloRecompraCategoria[];
  margemPorCategoria: MargemCategoria[];
}
