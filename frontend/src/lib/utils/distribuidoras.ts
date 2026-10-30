const STORAGE_KEY = "beezpet:distribuidoras";

// Lista oficial e união das grafias repetidas (specs/produtos/spec-v5.md). A mesma regra
// está em backend/src/shared/domain/distribuidoras.ts: ao mudar aqui, mude lá também.
export const DISTRIBUIDORAS_PADRAO = [
  "PRIME",
  "ZOOCENTER",
  "MARKET",
  "PETZ",
  "DUNORTE",
  "AMAZON",
  "BASSO PANCOTTE",
  "AGROMINAS",
  "LATIDUS",
  "CENTRAL PEC",
];

const ALIASES: Record<string, string> = {
  prime: "PRIME",
  zoocenter: "ZOOCENTER",
  market: "MARKET",
  petz: "PETZ",
  amazon: "AMAZON",
  basso: "BASSO PANCOTTE",
  bassopancotte: "BASSO PANCOTTE",
  bassopacotte: "BASSO PANCOTTE",
  bassoepancotte: "BASSO PANCOTTE",
  agrominas: "AGROMINAS",
  latidus: "LATIDUS",
  centralpec: "CENTRAL PEC",
};

function chave(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Nome oficial da distribuidora; nome fora das variações conhecidas volta como veio. */
export function normalizarDistribuidora(nome: string): string {
  const k = chave(nome);
  if (k.includes("dunort")) return "DUNORTE";
  return ALIASES[k] ?? nome;
}

/** Distribuidoras adicionadas neste navegador, sem repetir as oficiais nem entre si. */
export function carregarDistribuidorasCustomizadas(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const vistas = new Set(DISTRIBUIDORAS_PADRAO.map(chave));
    const customizadas: string[] = [];
    for (const nome of JSON.parse(saved) as string[]) {
      const oficial = normalizarDistribuidora(nome);
      if (vistas.has(chave(oficial))) continue;
      vistas.add(chave(oficial));
      customizadas.push(oficial);
    }
    return customizadas;
  } catch {
    return [];
  }
}

export function salvarDistribuidorasCustomizadas(customizadas: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customizadas));
  } catch {}
}

export function todasAsDistribuidoras(extraItem?: string | null): string[] {
  const customizadas = carregarDistribuidorasCustomizadas();
  const todas = [...new Set([...DISTRIBUIDORAS_PADRAO, ...customizadas])];
  if (extraItem && !todas.includes(extraItem)) {
    todas.push(extraItem);
  }
  return todas;
}
