import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { ItensTable } from "@/components/vendas/itens-table";

vi.mock("@/lib/api/produtos", () => ({
  apiProdutos: {
    list: vi.fn().mockResolvedValue({
      data: [{ id: "p1", nome: "Petisco Bifinho", valorVenda: 15, valorCusto: 6, categoria: "Petisco", pesoEmbalagem: null }],
    }),
  },
}));
vi.mock("@/lib/api/animais", () => ({ apiAnimais: { list: vi.fn().mockResolvedValue({ data: [] }) } }));

type Itens = { itens: Array<Record<string, unknown>> } & Record<string, unknown>;

function Harness({ valorUnitario = 0 }: { valorUnitario?: number }) {
  const { control, setValue } = useForm<Itens>({
    defaultValues: {
      itens: [{ produtoId: null, nome: "Petisco", qtd: 1, valorUnitario, desconto: 0, brinde: false }],
    },
  });
  return (
    <ItensTable
      control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
      setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
    />
  );
}

const campoValor = () => screen.getAllByRole("spinbutton")[1] as HTMLInputElement;
const campoDesconto = () => screen.getAllByRole("spinbutton")[2] as HTMLInputElement;
const botaoBrinde = () => screen.getByTitle(/brinde/i);

async function escolherProduto(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText(/Buscar produto/), "Bif");
  await user.click(await screen.findByText("Petisco Bifinho"));
}

describe("ItensTable — brinde (specs/vendas/spec-v5.md)", () => {
  it("marcar brinde zera e trava Valor Unit. e Desconto, e o subtotal mostra Brinde", async () => {
    const user = userEvent.setup();
    render(<Harness valorUnitario={15} />);

    await user.type(campoDesconto(), "5");
    await user.click(botaoBrinde());

    expect(campoValor().value).toBe("0");
    expect(campoDesconto().value).toBe("0");
    expect(campoValor()).toHaveAttribute("readonly");
    expect(campoDesconto()).toHaveAttribute("readonly");
    expect(screen.getByText("Brinde")).toBeInTheDocument();
  });

  it("escolher produto em item brinde não muda o valor; desmarcar devolve o preço do produto", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(botaoBrinde());
    await escolherProduto(user);
    expect(campoValor().value).toBe("0");

    await user.click(botaoBrinde());
    expect(campoValor().value).toBe("15");
    expect(campoValor()).not.toHaveAttribute("readonly");
  });

  it("desmarcar brinde devolve o preço que o item tinha antes", async () => {
    const user = userEvent.setup();
    render(<Harness valorUnitario={42} />);

    await user.click(botaoBrinde());
    await user.click(botaoBrinde());
    expect(campoValor().value).toBe("42");
  });
});
