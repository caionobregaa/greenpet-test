import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReciboPrint } from "@/components/vendas/recibo-print";
import type { Venda } from "@/lib/types/venda";
import type { ClienteDetail } from "@/lib/types/cliente";

function buildVenda(overrides: Partial<Venda> = {}): Venda {
  return {
    id: "venda-1",
    numero: 88,
    data: "2026-08-31",
    clienteId: "cliente-1",
    cliente: { nome: "Madalena" },
    animalId: "animal-1",
    animal: { nome: "Fofinha" },
    formaPag: "Pix",
    taxaCartao: 0,
    taxaEntrega: 0,
    desconto: 5.41,
    total: 102.69,
    obs: null,
    createdAt: "2026-08-31T12:00:00.000Z",
    itens: [
      {
        id: "item-1",
        produtoId: "produto-1",
        nome: "FN Life Adulto Mini/Pequeno 2,5kg",
        qtd: 1,
        valorUnitario: 108.1,
        desconto: 0,
        total: 108.1,
      },
    ],
    ...overrides,
  };
}

describe("ReciboPrint", () => {
  it("mostra cliente, pet, número da venda e itens", () => {
    render(<ReciboPrint venda={buildVenda()} />);
    expect(screen.getByText(/Cliente: Madalena/)).toBeInTheDocument();
    expect(screen.getByText(/Pet: Fofinha/)).toBeInTheDocument();
    expect(screen.getByText(/Venda: V0088/)).toBeInTheDocument();
    expect(screen.getByText(/FN Life Adulto Mini\/Pequeno 2,5kg/)).toBeInTheDocument();
  });

  it("mostra o desconto de recompra quando venda.desconto > 0, com a contagem de compras anteriores", () => {
    const clienteDetail = {
      vendas: Array.from({ length: 8 }, (_, i) => ({ id: `v${i}` })),
    } as unknown as ClienteDetail;

    render(<ReciboPrint venda={buildVenda()} clienteDetail={clienteDetail} />);

    expect(screen.getByText(/Desconto recompra \(5%\)/)).toBeInTheDocument();
    expect(screen.getByText(/7ª\+ compra/)).toBeInTheDocument();
  });

  it("não mostra desconto de recompra quando venda.desconto é 0", () => {
    render(<ReciboPrint venda={buildVenda({ desconto: 0, total: 108.1 })} />);
    expect(screen.queryByText(/Desconto recompra/)).not.toBeInTheDocument();
  });

  it("mostra 'FRETE GRÁTIS' quando subtotal - desconto >= R$80", () => {
    render(<ReciboPrint venda={buildVenda()} />);
    expect(screen.getByText(/FRETE GRÁTIS/)).toBeInTheDocument();
  });

  it("não mostra 'FRETE GRÁTIS' quando o total fica abaixo do piso", () => {
    const venda = buildVenda({
      desconto: 0,
      total: 50,
      itens: [
        { id: "item-1", produtoId: "p1", nome: "Petisco", qtd: 1, valorUnitario: 50, desconto: 0, total: 50 },
      ],
    });
    render(<ReciboPrint venda={venda} />);
    expect(screen.queryByText(/FRETE GRÁTIS/)).not.toBeInTheDocument();
  });
});
