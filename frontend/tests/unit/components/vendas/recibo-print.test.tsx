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

  it("mostra o desconto total e a nota de recompra quando venda.desconto > 0, com a contagem de compras anteriores", () => {
    const clienteDetail = {
      vendas: Array.from({ length: 8 }, (_, i) => ({ id: `v${i}` })),
    } as unknown as ClienteDetail;

    render(<ReciboPrint venda={buildVenda()} clienteDetail={clienteDetail} />);

    expect(screen.getByText(/Desconto total/)).toBeInTheDocument();
    expect(screen.getByText(/−R\$\s?5,41/)).toBeInTheDocument();
    expect(screen.getByText(/Inclui recompra \(5%\)/)).toBeInTheDocument();
    expect(screen.getByText(/7ª\+ compra/)).toBeInTheDocument();
  });

  it("não mostra desconto nem nota de recompra quando não há desconto nenhum (nem item, nem venda)", () => {
    render(<ReciboPrint venda={buildVenda({ desconto: 0, total: 108.1 })} />);
    expect(screen.queryByText(/Desconto total/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Inclui recompra/)).not.toBeInTheDocument();
  });

  it("mostra o desconto total quando só o item tem desconto (sem desconto de venda/recompra)", () => {
    const venda = buildVenda({
      desconto: 0,
      total: 90,
      itens: [
        { id: "item-1", produtoId: "p1", nome: "Ração X", qtd: 1, valorUnitario: 100, desconto: 10, total: 90 },
      ],
    });
    render(<ReciboPrint venda={venda} />);
    expect(screen.getByText(/Desconto total/)).toBeInTheDocument();
    expect(screen.getByText(/−R\$\s?10,00/)).toBeInTheDocument();
    expect(screen.queryByText(/Inclui recompra/)).not.toBeInTheDocument();
  });

  it("Subtotal mostra o valor bruto (sem desconto de item embutido)", () => {
    const venda = buildVenda({
      desconto: 0,
      total: 85,
      itens: [
        { id: "item-1", produtoId: "p1", nome: "Ração X", qtd: 2, valorUnitario: 50, desconto: 15, total: 85 },
      ],
    });
    render(<ReciboPrint venda={venda} />);
    expect(screen.getByText(/Subtotal/).parentElement).toHaveTextContent("R$ 100,00");
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

  it("exibe a descrição completa do produto, mesmo quando o nome é longo (quebra de linha, sem cortar)", () => {
    const nomeLongo = "Ração Fórmula Natural Vet Life Hipoalergênica Cão Adulto Porte Mini 10,1kg";
    const venda = buildVenda({
      itens: [
        { id: "item-1", produtoId: "p1", nome: nomeLongo, qtd: 2, valorUnitario: 300, desconto: 0, total: 600 },
      ],
    });
    render(<ReciboPrint venda={venda} />);

    const descricao = screen.getByText(new RegExp(nomeLongo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    expect(descricao).toBeInTheDocument();
    // Não pode usar truncate (corta com "...") — precisa quebrar linha normalmente.
    expect(descricao.className).not.toMatch(/\btruncate\b/);
    expect(descricao.className).toMatch(/break-words/);
  });

  it("mostra o endereço completo do cliente quando os dados vêm do cadastro", () => {
    const clienteDetail = {
      endereco: "Rua das Flores, 123",
      bairro: "Centro",
      cidade: "Manaus",
      vendas: [],
    } as unknown as ClienteDetail;

    render(<ReciboPrint venda={buildVenda()} clienteDetail={clienteDetail} />);

    expect(screen.getByText("Endereço: Rua das Flores, 123 - Centro - Manaus")).toBeInTheDocument();
  });

  it("monta o endereço só com as partes preenchidas, ignorando campos vazios", () => {
    const clienteDetail = {
      endereco: null,
      bairro: "Centro",
      cidade: "Manaus",
      vendas: [],
    } as unknown as ClienteDetail;

    render(<ReciboPrint venda={buildVenda()} clienteDetail={clienteDetail} />);

    expect(screen.getByText("Endereço: Centro - Manaus")).toBeInTheDocument();
  });

  it("não mostra a linha de endereço quando clienteDetail não foi carregado", () => {
    render(<ReciboPrint venda={buildVenda()} />);
    expect(screen.queryByText(/Endereço:/)).not.toBeInTheDocument();
  });

  it("não mostra a linha de endereço quando o cadastro do cliente está sem endereço/bairro/cidade", () => {
    const clienteDetail = {
      endereco: null,
      bairro: null,
      cidade: null,
      vendas: [],
    } as unknown as ClienteDetail;
    render(<ReciboPrint venda={buildVenda()} clienteDetail={clienteDetail} />);
    expect(screen.queryByText(/Endereço:/)).not.toBeInTheDocument();
  });
});
