import { Suspense } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrcamentoDetailPage from "@/app/(app)/orcamentos/[id]/page";
import { imprimirCupom } from "@/lib/utils/imprimir-cupom";

const orcamento = {
  id: "orc-1", numero: 12, data: "2026-10-21", validade: "2026-10-28",
  clienteId: "c1", cliente: { nome: "Madalena" }, animalId: null, animal: null,
  status: "aberto", total: 100, obs: null, vendaId: null, formasPag: [],
  createdAt: "", updatedAt: "",
  itens: [{ id: "i1", produtoId: null, nome: "Areia 4kg", qtd: 1, valorUnitario: 100, desconto: 0, total: 100 }],
};

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock("@/lib/hooks/use-orcamentos", () => {
  const mutation = { mutateAsync: vi.fn(), isPending: false };
  return {
    useOrcamento: () => ({ data: orcamento, isLoading: false }),
    useDeleteOrcamento: () => mutation,
    useUpdateOrcamentoStatus: () => mutation,
    useConverterOrcamento: () => mutation,
  };
});
vi.mock("@/lib/utils/orcamento-pdf", () => ({ gerarOrcamentoPDF: vi.fn(), compartilharOrcamentoPDF: vi.fn() }));
vi.mock("@/lib/utils/imprimir-cupom", () => ({ imprimirCupom: vi.fn() }));

describe("Tela do orçamento — imprimir (specs/orcamentos/spec-v4.md)", () => {
  it("o botão Imprimir Orçamento imprime o cupom ORÇAMENTO, e o resto da tela fica fora da impressão", async () => {
    // Promise já resolvida no formato que o `use()` do React lê sem suspender.
    const params = Object.assign(Promise.resolve({ id: "orc-1" }), { status: "fulfilled", value: { id: "orc-1" } });
    render(
      <Suspense fallback={null}>
        <OrcamentoDetailPage params={params} />
      </Suspense>,
    );
    const botao = await screen.findByRole("button", { name: /Imprimir Orçamento/ });
    await userEvent.click(botao);

    const cupom = vi.mocked(imprimirCupom).mock.calls[0][0];
    expect(cupom).toHaveTextContent("ORÇAMENTO");
    expect(cupom).toHaveTextContent("VALOR EM ABERTO");
    expect(cupom.className).toMatch(/print:block/);
    expect(botao.closest('[class~="print:hidden"]')).not.toBeNull();
  });
});
