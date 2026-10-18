import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AppLayout from "@/app/(app)/layout";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/vendas/abc",
}));
vi.mock("@/lib/utils/auth-storage", () => ({ getAccessToken: () => "token" }));
vi.mock("@/components/layout/app-sidebar", () => ({ AppSidebar: () => <nav data-testid="sidebar" /> }));
vi.mock("@/components/layout/app-topbar", () => ({ AppTopbar: () => <header data-testid="topbar" /> }));

describe("AppLayout na impressão (spec-v3 vendas)", () => {
  it("esconde sidebar e topbar na impressão", async () => {
    render(<AppLayout><p>recibo</p></AppLayout>);
    expect((await screen.findByTestId("sidebar")).parentElement?.className).toMatch(/print:hidden/);
    expect(screen.getByTestId("topbar").parentElement?.className).toMatch(/print:hidden/);
  });

  it("não corta o conteúdo na impressão (sem altura de tela nem overflow escondido)", async () => {
    render(<AppLayout><p>recibo</p></AppLayout>);
    const main = (await screen.findByText("recibo")).closest("main")!;
    expect(main.className).toMatch(/print:p-0/);
    expect(main.className).toMatch(/print:overflow-visible/);
    const raiz = main.parentElement!.parentElement!;
    expect(raiz.className).toMatch(/print:h-auto/);
    expect(raiz.className).toMatch(/print:overflow-visible/);
  });
});
