import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LembreteMensagens } from "@/components/avisos/lembrete-mensagens";
import { useMarcarMensagem } from "@/lib/hooks/use-recompra";
import type { RecompraAlerta } from "@/lib/types/recompra";

const marcar = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/hooks/use-recompra", () => ({
  useMarcarMensagem: vi.fn(() => ({ mutateAsync: marcar, isPending: false })),
  useDesmarcarMensagem: vi.fn(() => ({ mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false })),
}));

function alerta(clienteNome: string, enviada: boolean): RecompraAlerta {
  return {
    clienteId: clienteNome, clienteNome, clienteTelefone: "92991234567", animalId: "", animalNome: "Thor",
    produtoId: "p1", produtoNome: "Ração X", ultimaCompra: "2026-08-01T00:00:00.000Z", diasRecompra: 30,
    diasRestantes: -5, urgencia: "vencido",
    mensagemEnviadaEm: enviada ? "2026-10-04T12:00:00.000Z" : null, mensagemEnviadaPor: enviada ? "caio@beezpet.com" : null,
    motivosSumido: null,
  };
}

describe("LembreteMensagens", () => {
  it("separa 'A enviar' e 'Mensagem enviada'", () => {
    render(<LembreteMensagens alertas={[alerta("Ana", false), alerta("Bia", true)]} isLoading={false} />);

    expect(within(screen.getByRole("list", { name: "A enviar" })).getByText("Ana")).toBeInTheDocument();
    const enviadas = screen.getByRole("list", { name: "Mensagem enviada" });
    expect(within(enviadas).getByText("Bia")).toBeInTheDocument();
    expect(within(enviadas).getByText(/por caio@beezpet.com/)).toBeInTheDocument();
  });

  it("botão do WhatsApp abre o número do cliente com a mensagem pronta", () => {
    render(<LembreteMensagens alertas={[alerta("Ana Souza", false)]} isLoading={false} />);
    const link = screen.getByRole("link", { name: "Abrir WhatsApp de Ana Souza" });
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5592991234567\?text=Ol%C3%A1%2C%20Ana!/);
  });

  it("marcar 'Mensagem enviada' envia o ciclo do alerta", async () => {
    render(<LembreteMensagens alertas={[alerta("Ana", false)]} isLoading={false} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "Mensagem enviada" }));

    expect(vi.mocked(useMarcarMensagem)).toHaveBeenCalled();
    expect(marcar).toHaveBeenCalledWith({ clienteId: "Ana", produtoId: "p1", animalId: "", ultimaCompra: "2026-08-01T00:00:00.000Z" });
  });
});
