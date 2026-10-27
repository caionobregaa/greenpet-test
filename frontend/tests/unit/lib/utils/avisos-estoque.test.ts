import { describe, it, expect, vi } from "vitest";
import { toast } from "sonner";
import { avisarEstoqueInsuficiente, descreverAvisosEstoque } from "@/lib/utils/avisos-estoque";

// specs/estoque/spec-v2.md — aviso depois de salvar a venda

vi.mock("sonner", () => ({ toast: { warning: vi.fn() } }));

describe("avisos de estoque insuficiente", () => {
  it("descreve cada item: quanto foi vendido e quanto havia", () => {
    expect(descreverAvisosEstoque([
      { produtoId: "p1", nome: "Ração A", qtd: 3, qtdBaixada: 1 },
      { produtoId: "p2", nome: "Areia", qtd: 2, qtdBaixada: 0 },
    ])).toBe("Ração A: vendido 3, só havia 1 em estoque · Areia: vendido 2, sem estoque");
  });

  it("mostra o aviso só quando há itens com estoque insuficiente", () => {
    avisarEstoqueInsuficiente(undefined);
    avisarEstoqueInsuficiente([]);
    expect(toast.warning).not.toHaveBeenCalled();

    avisarEstoqueInsuficiente([{ produtoId: "p1", nome: "Ração A", qtd: 3, qtdBaixada: 1 }]);
    expect(toast.warning).toHaveBeenCalledWith(
      "Venda registrada com estoque insuficiente",
      expect.objectContaining({ description: expect.stringContaining("Ração A: vendido 3, só havia 1 em estoque") }),
    );
  });
});
