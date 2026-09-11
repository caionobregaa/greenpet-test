import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("AppSidebar", () => {
  it("renderiza o link 'Curva de Venda' dentro do grupo Finanças, apontando para /curva-venda", async () => {
    render(
      <AppSidebar collapsed={false} onToggle={() => {}} mobileOpen={false} onMobileClose={() => {}} />
    );
    // Estando em /dashboard (fora do grupo), o grupo Finanças começa fechado —
    // precisa expandir antes de encontrar os itens filhos.
    await userEvent.click(screen.getByRole("button", { name: /finanças/i }));
    const link = screen.getByRole("link", { name: /curva de venda/i });
    expect(link).toHaveAttribute("href", "/curva-venda");
  });

  it("agrupa BI e Despesas dentro de Finanças também", async () => {
    render(
      <AppSidebar collapsed={false} onToggle={() => {}} mobileOpen={false} onMobileClose={() => {}} />
    );
    await userEvent.click(screen.getByRole("button", { name: /finanças/i }));
    expect(screen.getByRole("link", { name: /^bi$/i })).toHaveAttribute("href", "/bi");
    expect(screen.getByRole("link", { name: /despesas/i })).toHaveAttribute("href", "/compras");
  });

  it("continua renderizando os itens de navegação já existentes", () => {
    render(
      <AppSidebar collapsed={false} onToggle={() => {}} mobileOpen={false} onMobileClose={() => {}} />
    );
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /controle recompra/i })).toBeInTheDocument();
  });
});
