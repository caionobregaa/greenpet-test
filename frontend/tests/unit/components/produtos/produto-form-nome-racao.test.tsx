import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProdutoForm } from "@/components/produtos/produto-form";
import { extrairNomeBaseRacao } from "@/lib/utils/produtos";
import type { Produto } from "@/lib/types/produto";

// specs/produtos/spec-v10.md
function racao(campos: Partial<Produto>): Produto {
  return {
    id: "r1", nome: "", sku: "RUM-0001", categoria: "Ração Úmida", especie: "Gato", subCategoria: null,
    faseDaVida: "Adulto", porte: null, sabor: "Frango", marca: null, fornecedor: null, codigoBarras: null,
    semCodigoBarras: true, pesoEmbalagem: 85, unidadeEmbalagem: "g", valorCusto: 3, valorVenda: 5,
    margemCartao: 0, margemImposto: 0, margemOperacao: 0, margemLucro: 0, diasRecompra: null,
    estoqueMinimo: 1, descricao: null, imagemUrl: null, ocultarCatalogo: false, estoque: 0, deletedAt: null,
    createdAt: "2026-11-09", updatedAt: "2026-11-09", ...campos,
  };
}

describe("extrairNomeBaseRacao", () => {
  it.each([
    ["Matisse Gato Adulto SABOR Frango 85g", "Matisse"],
    ["ND Tropical Selection Cão Adulto PORTE Pequeno SABOR Salmão, Cereais e Frutas Tropicais 2.5kg", "ND Tropical Selection"],
    ["Golden Gourmet Cão e Gato Filhote SABOR Carne 85g", "Golden Gourmet"],
    ["Fórmula Natural Fresh Meat Cão Adulto PORTE Médio SABOR Frango 12kg", "Fórmula Natural Fresh Meat"],
    ["Ração Simples 10 kg", "Ração Simples"],
    ["Royal Canin Urinary", "Royal Canin Urinary"],
  ])("%s → %s", (nome, base) => {
    expect(extrairNomeBaseRacao(nome)).toBe(base);
  });
});

async function salvar(user: ReturnType<typeof userEvent.setup>, onSubmit: ReturnType<typeof vi.fn>) {
  await user.click(screen.getByRole("button", { name: "Salvar" }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  return onSubmit.mock.calls[0][0];
}

describe("Edição de ração: nome acompanha a composição", () => {
  it("abre com a parte fixa do nome no campo Nome da Ração", () => {
    render(<ProdutoForm produto={racao({ nome: "Matisse Gato Adulto SABOR Frango 85g" })} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText("Nome da Ração")).toHaveValue("Matisse");
  });

  it("mudar o sabor atualiza o nome ao salvar", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProdutoForm produto={racao({ nome: "Matisse Gato Adulto SABOR Frango 85g" })} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.clear(screen.getByLabelText("Sabor"));
    await user.type(screen.getByLabelText("Sabor"), "Salmão");
    const dados = await salvar(user, onSubmit);
    expect(dados.nome).toBe("Matisse Gato Adulto SABOR Salmão 85g");
    expect(dados.sabor).toBe("Salmão");
  });

  it("abrir e salvar sem mexer na composição mantém o nome, mesmo fora do padrão", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const nomeLivre = "Ração Úmida Royal Canin Lata Veterinary Diet Urinary - 410 g";
    render(<ProdutoForm produto={racao({ nome: nomeLivre, sabor: null })} onSubmit={onSubmit} onCancel={vi.fn()} />);
    const dados = await salvar(user, onSubmit);
    expect(dados.nome).toBe(nomeLivre);
  });

  it("nome desatualizado mostra o nome montado e o botão aplica", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProdutoForm produto={racao({ nome: "Matisse Gato Adulto SABOR Frango 85g", sabor: "Salmão" })} onSubmit={onSubmit} onCancel={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Nome montado: Matisse Gato Adulto SABOR Salmão 85g");
    await user.click(screen.getByRole("button", { name: "Usar nome montado" }));
    expect(screen.queryByText(/Nome montado:/)).not.toBeInTheDocument();
    const dados = await salvar(user, onSubmit);
    expect(dados.nome).toBe("Matisse Gato Adulto SABOR Salmão 85g");
  });

  it("produto novo continua montando o nome conforme digita", async () => {
    const user = userEvent.setup();
    render(<ProdutoForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByLabelText("Nome da Ração")).not.toBeInTheDocument();
  });
});
