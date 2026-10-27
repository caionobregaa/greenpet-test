import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PagamentosVenda } from "@/components/vendas/pagamentos-venda";
import type { Venda } from "@/lib/types/venda";
import { todayLocalISO } from "@/lib/utils/format";

// specs/vendas/spec-v6.md — quadro Pagamento da venda

const registrar = vi.fn();
const remover = vi.fn();
vi.mock("@/lib/hooks/use-vendas", () => ({
  useRegistrarPagamento: () => ({ mutateAsync: registrar, isPending: false }),
  useRemoverPagamento: () => ({ mutateAsync: remover, isPending: false }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function buildVenda(overrides: Partial<Venda> = {}): Venda {
  return {
    id: "venda-1", numero: 7, data: "2026-10-01", clienteId: "c1", cliente: { nome: "Ana" },
    animalId: null, animal: null, formaPag: "Pix", taxaCartao: 0, taxaEntrega: 0, desconto: 0,
    total: 200, obs: null, createdAt: "2026-10-01T12:00:00.000Z",
    itens: [{ id: "i1", produtoId: null, nome: "Ração", qtd: 1, valorUnitario: 200, desconto: 0, total: 200 }],
    valorRecebido: 200, valorPago: 200, valorEmAberto: 0, pagamentos: [],
    ...overrides,
  };
}

describe("PagamentosVenda", () => {
  beforeEach(() => {
    registrar.mockReset().mockResolvedValue({});
    remover.mockReset().mockResolvedValue({});
  });

  it("venda paga por inteiro aparece quitada, sem botão de recebimento", () => {
    render(<PagamentosVenda venda={buildVenda()} />);
    expect(screen.getByText(/quitado/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Registrar recebimento/ })).not.toBeInTheDocument();
  });

  it("venda com valor em aberto mostra total, recebido, em aberto e o histórico", () => {
    const venda = buildVenda({
      valorRecebido: 50, valorPago: 120, valorEmAberto: 80,
      pagamentos: [{ id: "p1", valor: 70, data: "2026-10-10", formaPag: "Dinheiro", obs: "parte 1" }],
    });
    render(<PagamentosVenda venda={venda} />);
    expect(screen.getByText(/valor em aberto/)).toBeInTheDocument();
    expect(screen.getByTestId("valor-em-aberto")).toHaveTextContent(/R\$\s?80,00/);
    expect(screen.getByText(/na venda \(Pix\)/).nextSibling).toHaveTextContent(/R\$\s?50,00/);
    expect(screen.getByText(/parte 1/)).toBeInTheDocument();
  });

  it("registrar recebimento envia valor (padrão = em aberto), data de hoje e forma", async () => {
    const user = userEvent.setup();
    render(<PagamentosVenda venda={buildVenda({ valorRecebido: 50, valorPago: 50, valorEmAberto: 150 })} />);

    await user.click(screen.getByRole("button", { name: /Registrar recebimento/ }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText(/Valor recebido/)).toHaveValue(150);

    await user.clear(within(dialog).getByLabelText(/Valor recebido/));
    await user.type(within(dialog).getByLabelText(/Valor recebido/), "100");
    await user.type(within(dialog).getByLabelText(/Observação/), "na entrega");
    await user.click(within(dialog).getByRole("button", { name: "Registrar" }));

    expect(registrar).toHaveBeenCalledWith({
      id: "venda-1",
      input: { valor: 100, data: todayLocalISO(), formaPag: "Pix", obs: "na entrega" },
    });
  });

  it("não deixa registrar mais do que está em aberto", async () => {
    const user = userEvent.setup();
    render(<PagamentosVenda venda={buildVenda({ valorRecebido: 50, valorPago: 50, valorEmAberto: 150 })} />);
    await user.click(screen.getByRole("button", { name: /Registrar recebimento/ }));
    const dialog = await screen.findByRole("dialog");
    await user.clear(within(dialog).getByLabelText(/Valor recebido/));
    await user.type(within(dialog).getByLabelText(/Valor recebido/), "151");
    await user.click(within(dialog).getByRole("button", { name: "Registrar" }));
    expect(registrar).not.toHaveBeenCalled();
  });

  it("excluir recebimento pede confirmação e chama a remoção", async () => {
    const user = userEvent.setup();
    const venda = buildVenda({
      valorRecebido: 0, valorPago: 70, valorEmAberto: 130,
      pagamentos: [{ id: "p1", valor: 70, data: "2026-10-10", formaPag: "Pix" }],
    });
    render(<PagamentosVenda venda={venda} />);
    await user.click(screen.getByTitle("Excluir recebimento"));
    await user.click(await screen.findByRole("button", { name: "Excluir" }));
    expect(remover).toHaveBeenCalledWith({ id: "venda-1", pagamentoId: "p1" });
  });
});
