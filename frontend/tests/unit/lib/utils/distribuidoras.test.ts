import { describe, it, expect, beforeEach } from "vitest";
import {
  DISTRIBUIDORAS_PADRAO,
  carregarDistribuidorasCustomizadas,
  normalizarDistribuidora,
  todasAsDistribuidoras,
} from "@/lib/utils/distribuidoras";

// specs/produtos/spec-v5.md — lista oficial de distribuidoras

describe("distribuidoras", () => {
  beforeEach(() => localStorage.clear());

  it("lista as 10 oficiais", () => {
    expect(DISTRIBUIDORAS_PADRAO).toEqual([
      "PRIME", "ZOOCENTER", "MARKET", "PETZ", "DUNORTE", "AMAZON", "BASSO PANCOTTE", "AGROMINAS", "LATIDUS", "CENTRAL PEC",
    ]);
  });

  it.each([
    ["zoo center", "ZOOCENTER"], ["Zoo Center", "ZOOCENTER"], ["Market/Prime", "MARKET"], ["Dunorte Ltda", "DUNORTE"],
    ["BASSO PACOTTE", "BASSO PANCOTTE"], ["Basso & Pancotte", "BASSO PANCOTTE"], ["Central Pec", "CENTRAL PEC"],
  ])("%s → %s", (entrada, oficial) => {
    expect(normalizarDistribuidora(entrada)).toBe(oficial);
  });

  it.each(["Amazon Prime", "Zoo Centr", "Outra"])("não altera nome fora das variações: %s", (nome) => {
    expect(normalizarDistribuidora(nome)).toBe(nome);
  });

  it("variações salvas no navegador não geram opção repetida", () => {
    localStorage.setItem("beezpet:distribuidoras", JSON.stringify(["Amazon", "Market/Prime", "petz", "Zoo center", "Latidus", "Nova Dist", "nova dist"]));
    expect(carregarDistribuidorasCustomizadas()).toEqual(["Nova Dist"]);
    expect(todasAsDistribuidoras()).toEqual([...DISTRIBUIDORAS_PADRAO, "Nova Dist"]);
  });

  it("nome salvo inválido no navegador não quebra", () => {
    localStorage.setItem("beezpet:distribuidoras", "{quebrado");
    expect(carregarDistribuidorasCustomizadas()).toEqual([]);
  });
});
