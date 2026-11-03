import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProdutoForm } from "@/components/produtos/produto-form";
import type { Produto } from "@/lib/types/produto";

// specs/produtos/spec-v7.md
const CAIXA = "Ocultar produto no catálogo oficial";

function produto(ocultarCatalogo: boolean): Produto {
  return {
    id: "p1", nome: "Petisco X", sku: "PET-0001", categoria: "Petisco", especie: null, subCategoria: null,
    faseDaVida: null, porte: null, sabor: null, marca: null, fornecedor: null, codigoBarras: null,
    semCodigoBarras: true, pesoEmbalagem: 1, unidadeEmbalagem: "kg", valorCusto: 5, valorVenda: 10,
    margemCartao: 0, margemImposto: 0, margemOperacao: 0, margemLucro: 0, diasRecompra: null,
    estoqueMinimo: 1, descricao: null, imagemUrl: null, ocultarCatalogo, estoque: 0, deletedAt: null,
    createdAt: "2026-11-02", updatedAt: "2026-11-02",
  };
}

describe("ProdutoForm — ocultar no catálogo", () => {
  it("produto novo vem com a caixa desmarcada", () => {
    render(<ProdutoForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(CAIXA)).not.toBeChecked();
  });

  it("reabrir um produto oculto mostra a caixa marcada", () => {
    render(<ProdutoForm produto={produto(true)} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(CAIXA)).toBeChecked();
  });

  it("marcar a caixa envia ocultarCatalogo ao salvar", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProdutoForm produto={produto(false)} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.click(screen.getByLabelText(CAIXA));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].ocultarCatalogo).toBe(true);
  });
});
