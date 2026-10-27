import { Suspense } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrcamentoDetailPage from "@/app/(app)/orcamentos/[id]/page";

// specs/vendas/spec-v6.md — Fechar Venda a partir do orçamento com valor em aberto

const orcamento = {
  id: "orc-1", numero: 12, data: "2026-10-21", validade: "2026-10-28",
  clienteId: "c1", cliente: { nome: "Madalena" }, animalId: null, animal: null,
  status: "fechado", total: 200, obs: null, vendaId: null, formasPag: [],
  createdAt: "", updatedAt: "",
  itens: [{ id: "i1", produtoId: null, nome: "Ração", qtd: 1, valorUnitario: 200, desconto: 0, total: 200 }],
};

const converter = vi.fn().mockResolvedValue({ vendaId: "venda-1" });
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock("@/lib/hooks/use-orcamentos", () => {
  const mutation = { mutateAsync: vi.fn(), isPending: false };
  return {
    useOrcamento: () => ({ data: orcamento, isLoading: false }),
    useDeleteOrcamento: () => mutation,
    useUpdateOrcamentoStatus: () => mutation,
    useConverterOrcamento: () => ({ mutateAsync: converter, isPending: false }),
  };
});
vi.mock("@/lib/utils/orcamento-pdf", () => ({ gerarOrcamentoPDF: vi.fn(), compartilharOrcamentoPDF: vi.fn() }));

describe("Orçamento → Fechar Venda com valor em aberto", () => {
  it("envia o valor recebido agora; a diferença fica em aberto", async () => {
    const user = userEvent.setup();
    const params = Object.assign(Promise.resolve({ id: "orc-1" }), { status: "fulfilled", value: { id: "orc-1" } });
    render(
      <Suspense fallback={null}>
        <OrcamentoDetailPage params={params} />
      </Suspense>,
    );

    await user.click(await screen.findByRole("button", { name: /Converter para Venda/ }));
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "PIX" }));

    await user.click(screen.getByLabelText(/Cliente não pagou tudo/));
    const campo = screen.getByLabelText(/Valor recebido agora/);
    await user.clear(campo);
    await user.type(campo, "80");
    expect(screen.getByText(/Fica em aberto/)).toHaveTextContent(/R\$\s?120,00/);

    await user.click(screen.getByRole("button", { name: /Confirmar Venda/ }));
    expect(converter).toHaveBeenCalledWith({
      id: "orc-1",
      input: expect.objectContaining({ formaPag: "Pix", valorRecebido: 80 }),
    });
  });
});
