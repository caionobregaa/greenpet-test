import { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PagamentoParcialField,
  valorEmAbertoDe,
  valorRecebidoValido,
} from "@/components/vendas/pagamento-parcial-field";

// specs/vendas/spec-v6.md — "Cliente não pagou tudo"

let ultimoValor: number | undefined;

function Harness({ total }: { total: number }) {
  const [valor, setValor] = useState<number | undefined>(undefined);
  ultimoValor = valor;
  return <PagamentoParcialField total={total} value={valor} onChange={setValor} />;
}

describe("PagamentoParcialField", () => {
  it("desmarcado: venda paga por inteiro, sem campo de valor", () => {
    render(<Harness total={200} />);
    expect(screen.getByLabelText(/Cliente não pagou tudo/)).not.toBeChecked();
    expect(screen.queryByLabelText(/Valor recebido agora/)).not.toBeInTheDocument();
    expect(ultimoValor).toBeUndefined();
  });

  it("marcado: pede o valor recebido e mostra o que fica em aberto", async () => {
    const user = userEvent.setup();
    render(<Harness total={200} />);

    await user.click(screen.getByLabelText(/Cliente não pagou tudo/));
    expect(screen.getByText(/Fica em aberto/)).toHaveTextContent(/R\$\s?200,00/);

    const campo = screen.getByLabelText(/Valor recebido agora/);
    await user.clear(campo);
    await user.type(campo, "50");
    expect(ultimoValor).toBe(50);
    expect(screen.getByText(/Fica em aberto/)).toHaveTextContent(/R\$\s?150,00/);
  });

  it("valor recebido maior que o total mostra erro", async () => {
    const user = userEvent.setup();
    render(<Harness total={100} />);
    await user.click(screen.getByLabelText(/Cliente não pagou tudo/));
    const campo = screen.getByLabelText(/Valor recebido agora/);
    await user.clear(campo);
    await user.type(campo, "150");
    expect(screen.getByText(/não pode ser maior que o total/)).toBeInTheDocument();
  });

  it("desmarcar volta a venda para paga por inteiro", async () => {
    const user = userEvent.setup();
    render(<Harness total={100} />);
    await user.click(screen.getByLabelText(/Cliente não pagou tudo/));
    await user.click(screen.getByLabelText(/Cliente não pagou tudo/));
    expect(ultimoValor).toBeUndefined();
  });

  it("helpers: em aberto e validação", () => {
    expect(valorEmAbertoDe(200, undefined)).toBe(0);
    expect(valorEmAbertoDe(200, 50)).toBe(150);
    expect(valorEmAbertoDe(100, 150)).toBe(0);
    expect(valorRecebidoValido(100, undefined)).toBe(true);
    expect(valorRecebidoValido(100, 0)).toBe(true);
    expect(valorRecebidoValido(100, 100)).toBe(true);
    expect(valorRecebidoValido(100, 100.5)).toBe(false);
    expect(valorRecebidoValido(100, -1)).toBe(false);
  });
});
