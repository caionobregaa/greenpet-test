import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { ItensTable } from "@/components/vendas/itens-table";
import { apiProdutos } from "@/lib/api/produtos";

// specs/estoque/spec-v2.md — avisos de estoque na linha do item

vi.mock("@/lib/api/produtos", () => ({ apiProdutos: { list: vi.fn() } }));
vi.mock("@/lib/api/animais", () => ({ apiAnimais: { list: vi.fn().mockResolvedValue({ data: [] }) } }));

function produto(estoque: number) {
  return { id: "p1", nome: "Ração Golden 15kg", valorVenda: 200, valorCusto: 150, categoria: "Ração", pesoEmbalagem: 15, estoque };
}

type Itens = { itens: Array<Record<string, unknown>> } & Record<string, unknown>;

function Harness({ avisosEstoque = true, nome = "" }: { avisosEstoque?: boolean; nome?: string }) {
  const { control, setValue } = useForm<Itens>({
    defaultValues: { itens: [{ produtoId: null, nome, qtd: 1, valorUnitario: 0, desconto: 0, brinde: false }] },
  });
  return (
    <ItensTable
      control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
      setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
      avisosEstoque={avisosEstoque}
    />
  );
}

async function escolherProduto(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText(/Buscar produto/), "Gold");
  await user.click(await screen.findByText("Ração Golden 15kg"));
}

const campoQtd = () => screen.getAllByRole("spinbutton")[0] as HTMLInputElement;

describe("ItensTable — avisos de estoque", () => {
  it("avisa 'Só há N em estoque' quando a quantidade passa do estoque", async () => {
    vi.mocked(apiProdutos.list).mockResolvedValue({ data: [produto(1)] } as never);
    const user = userEvent.setup();
    render(<Harness />);
    await escolherProduto(user);
    expect(screen.queryByTestId("aviso-estoque")).not.toBeInTheDocument();

    await user.clear(campoQtd());
    await user.type(campoQtd(), "2");
    expect(screen.getByTestId("aviso-estoque")).toHaveTextContent("Só há 1 em estoque — a venda tira o que existe");
  });

  it("produto sem estoque avisa que a venda não tira nada", async () => {
    vi.mocked(apiProdutos.list).mockResolvedValue({ data: [produto(0)] } as never);
    const user = userEvent.setup();
    render(<Harness />);
    await escolherProduto(user);
    expect(screen.getByTestId("aviso-estoque")).toHaveTextContent(/Sem estoque/);
  });

  it("item sem produto cadastrado avisa que não sai do estoque", () => {
    render(<Harness nome="Banho e tosa" />);
    expect(screen.getByText(/Item sem produto cadastrado — não sai do estoque/)).toBeInTheDocument();
  });

  it("sem a opção avisosEstoque (ex.: compras), não mostra avisos", async () => {
    vi.mocked(apiProdutos.list).mockResolvedValue({ data: [produto(0)] } as never);
    const user = userEvent.setup();
    render(<Harness avisosEstoque={false} nome="Banho" />);
    expect(screen.queryByText(/não sai do estoque/)).not.toBeInTheDocument();
    await escolherProduto(user);
    expect(screen.queryByTestId("aviso-estoque")).not.toBeInTheDocument();
  });
});
