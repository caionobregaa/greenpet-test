import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProdutoForm } from "@/components/produtos/produto-form";
import type { Produto } from "@/lib/types/produto";

// specs/produtos/spec-v8.md
function produto(campos: Partial<Produto> = {}): Produto {
  return {
    id: "p1", nome: "Petisco X", sku: "PET-0001", categoria: "Petisco", especie: null, subCategoria: null,
    faseDaVida: null, porte: null, sabor: null, marca: null, fornecedor: null, codigoBarras: null,
    semCodigoBarras: true, pesoEmbalagem: null, unidadeEmbalagem: null, valorCusto: 5, valorVenda: 10,
    margemCartao: 0, margemImposto: 0, margemOperacao: 0, margemLucro: 0, diasRecompra: null,
    estoqueMinimo: null, descricao: null, imagemUrl: null, ocultarCatalogo: false, estoque: 0, deletedAt: null,
    createdAt: "2026-11-02", updatedAt: "2026-11-02", ...campos,
  };
}

async function salvar(p: Produto, antes?: (user: ReturnType<typeof userEvent.setup>) => Promise<void>) {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProdutoForm produto={p} onSubmit={onSubmit} onCancel={vi.fn()} />);
  await antes?.(user);
  await user.click(screen.getByRole("button", { name: "Salvar" }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  return onSubmit.mock.calls[0][0];
}

describe("ProdutoForm — peso e estoque mínimo opcionais", () => {
  it("salva com os dois campos vazios", async () => {
    const dados = await salvar(produto());
    expect(dados.pesoEmbalagem).toBeNull();
    expect(dados.estoqueMinimo).toBeNull();
  });

  it("limpar valores já salvos envia null", async () => {
    const dados = await salvar(produto({ pesoEmbalagem: 15, unidadeEmbalagem: "kg", estoqueMinimo: 3 }), async (user) => {
      await user.clear(screen.getByPlaceholderText("Ex: 15"));
      await user.clear(screen.getByLabelText(/Estoque Mínimo/));
    });
    expect(dados.pesoEmbalagem).toBeNull();
    expect(dados.estoqueMinimo).toBeNull();
  });

  it("valores preenchidos continuam como números", async () => {
    const dados = await salvar(produto({ pesoEmbalagem: 15, unidadeEmbalagem: "kg", estoqueMinimo: 3 }));
    expect(dados.pesoEmbalagem).toBe(15);
    expect(dados.estoqueMinimo).toBe(3);
  });
});
