import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppSidebar } from "@/components/layout/app-sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("AppSidebar", () => {
  it("renderiza o link 'Curva de Venda' apontando para /curva-venda", () => {
    render(
      <AppSidebar collapsed={false} onToggle={() => {}} mobileOpen={false} onMobileClose={() => {}} />
    );
    const link = screen.getByRole("link", { name: /curva de venda/i });
    expect(link).toHaveAttribute("href", "/curva-venda");
  });

  it("continua renderizando os itens de navegação já existentes", () => {
    render(
      <AppSidebar collapsed={false} onToggle={() => {}} mobileOpen={false} onMobileClose={() => {}} />
    );
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /controle recompra/i })).toBeInTheDocument();
  });
});
