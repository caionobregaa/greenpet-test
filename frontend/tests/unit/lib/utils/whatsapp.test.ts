import { describe, it, expect } from "vitest";
import { whatsappUrl, mensagemRecompra } from "@/lib/utils/whatsapp";
import { previsaoRecompra } from "@/lib/types/recompra";

describe("whatsappUrl", () => {
  it("usa só os dígitos e acrescenta o 55", () => {
    expect(whatsappUrl("(92) 99123-4567", "Oi")).toBe("https://wa.me/5592991234567?text=Oi");
  });

  it("não duplica o 55 quando o número já tem DDI", () => {
    expect(whatsappUrl("+55 92 99123-4567", "Oi")).toBe("https://wa.me/5592991234567?text=Oi");
  });

  it("sem telefone abre só com o texto", () => {
    expect(whatsappUrl("", "Olá!")).toBe("https://wa.me/?text=Ol%C3%A1!");
    expect(whatsappUrl(null, "x")).toBe("https://wa.me/?text=x");
  });
});

describe("mensagemRecompra", () => {
  it("usa o primeiro nome, o produto e o animal", () => {
    const msg = mensagemRecompra({ clienteNome: "Maria Silva", produtoNome: "Ração X 10kg", animalNome: "Thor" });
    expect(msg).toContain("Olá, Maria!");
    expect(msg).toContain("Ração X 10kg do(a) Thor");
  });

  it("sem animal não cita o pet", () => {
    expect(mensagemRecompra({ clienteNome: "João", produtoNome: "Bravecto" })).toContain("O(a) Bravecto deve estar acabando");
  });
});

describe("previsaoRecompra", () => {
  it("é hoje + diasRestantes", () => {
    const hoje = new Date(2026, 9, 5);
    expect(previsaoRecompra({ diasRestantes: 3 }, hoje)).toBe("2026-10-08");
    expect(previsaoRecompra({ diasRestantes: -40 }, hoje)).toBe("2026-08-26");
  });
});
