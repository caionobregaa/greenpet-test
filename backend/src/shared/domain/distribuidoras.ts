// Lista oficial de distribuidoras e união das grafias repetidas (specs/produtos/spec-v5.md).
// A mesma regra está em frontend/src/lib/utils/distribuidoras.ts e na migração
// 20261030120000_unificar_distribuidoras: ao mudar aqui, mude lá também.

const ALIASES: Record<string, string> = {
  prime: 'PRIME',
  zoocenter: 'ZOOCENTER',
  market: 'MARKET',
  petz: 'PETZ',
  amazon: 'AMAZON',
  basso: 'BASSO PANCOTTE',
  bassopancotte: 'BASSO PANCOTTE',
  bassopacotte: 'BASSO PANCOTTE',
  bassoepancotte: 'BASSO PANCOTTE',
  agrominas: 'AGROMINAS',
  latidus: 'LATIDUS',
  centralpec: 'CENTRAL PEC',
}

function chave(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** Nome oficial da distribuidora; nome fora das variações conhecidas volta como veio. */
export function normalizarDistribuidora(nome: string): string {
  const k = chave(nome)
  if (k.includes('dunort')) return 'DUNORTE'
  return ALIASES[k] ?? nome
}
