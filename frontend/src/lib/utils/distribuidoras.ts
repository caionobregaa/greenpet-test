const STORAGE_KEY = "greenpet:distribuidoras";

export const DISTRIBUIDORAS_PADRAO = [
  "DUNORTE",
  "PRIME",
  "Basso Pancotte",
  "Central Pec",
  "Market",
  "Zoo Center",
];

export function carregarDistribuidorasCustomizadas(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
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
