import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotivosSumidoDialog } from "@/components/clientes/motivos-sumido-dialog";
import type { ClienteSumidoAlerta } from "@/lib/types/recompra";

const SUMIDO: ClienteSumidoAlerta = {
  clienteId: "c1", clienteNome: "Maria Silva", clienteTelefone: "92991234567", animalId: "", animalNome: "Thor",
  produtoId: "p1", produtoNome: "Ração X", ultimaCompra: "2026-07-01T00:00:00.000Z", diasRecompra: 30,
  diasRestantes: -45, diasAtraso: 45, urgencia: "vencido",
  mensagemEnviadaEm: null, mensagemEnviadaPor: null, motivosSumido: null,
};

function abrir(onConfirm = vi.fn(), sumido = SUMIDO) {
  render(<MotivosSumidoDialog sumido={sumido} loading={false} onClose={vi.fn()} onConfirm={onConfirm} />);
  return onConfirm;
}

describe("MotivosSumidoDialog", () => {
  it("não avança sem nenhum motivo marcado", () => {
    abrir();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  it("'Outro' exige texto para avançar", async () => {
    abrir();
    await userEvent.click(screen.getByRole("checkbox", { name: "Outro" }));
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();

    await userEvent.type(screen.getByRole("textbox", { name: "Descreva o outro motivo" }), "achou no atacado");
    expect(screen.getByRole("button", { name: "Continuar" })).toBeEnabled();
  });

  it("checagem dupla: só grava depois de confirmar o resumo, com os motivos na ordem da lista", async () => {
    const onConfirm = abrir();
    await userEvent.click(screen.getByRole("checkbox", { name: "Mudou de cidade" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Preço" }));
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText("Confirmar motivos?")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Motivos selecionados" }).textContent).toContain("Preço");

    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledWith({ motivos: ["Preço", "Mudou de cidade"], outroTexto: null });
  });

  it("'Voltar' retorna à seleção sem gravar", async () => {
    const onConfirm = abrir();
    await userEvent.click(screen.getByRole("checkbox", { name: "Preço" }));
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await userEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(screen.getByRole("checkbox", { name: "Preço" })).toBeChecked();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("ao editar, já vem com os motivos registrados", () => {
    abrir(vi.fn(), { ...SUMIDO, motivosSumido: { motivos: ["Outro"], outroTexto: "viajou", registradoEm: "2026-10-01T00:00:00.000Z" } });
    expect(screen.getByRole("checkbox", { name: "Outro" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Descreva o outro motivo" })).toHaveValue("viajou");
  });
});
