import { describe, it, expect } from "vitest";
import { mesAtual, deslocarMes, rotuloMes, rotuloMesCurto } from "@/lib/utils/mes";

describe("utils de mês", () => {
  it("mesAtual usa a data local no formato YYYY-MM", () => {
    expect(mesAtual(new Date(2026, 8, 29))).toBe("2026-09");
    expect(mesAtual(new Date(2026, 0, 1))).toBe("2026-01");
  });

  it("deslocarMes vira o ano nos dois sentidos", () => {
    expect(deslocarMes("2026-09", -1)).toBe("2026-08");
    expect(deslocarMes("2026-12", 1)).toBe("2027-01");
    expect(deslocarMes("2026-01", -1)).toBe("2025-12");
  });

  it("rotuloMes mostra o nome do mês por extenso, com inicial maiúscula", () => {
    expect(rotuloMes("2026-09")).toBe("Setembro de 2026");
  });

  it("rotuloMesCurto mostra mês abreviado e ano com 2 dígitos", () => {
    expect(rotuloMesCurto("2026-09")).toBe("set/26");
  });
});
