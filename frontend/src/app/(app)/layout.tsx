"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAccessToken } from "@/lib/utils/auth-storage";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral do negócio" },
  "/clientes": { title: "Clientes", subtitle: "Gerenciamento de clientes" },
  "/animais": { title: "Animais", subtitle: "Gerenciamento de animais" },
  "/produtos": { title: "Produtos", subtitle: "Catálogo de produtos" },
  "/vendas": { title: "Histórico de Vendas", subtitle: "Registro de vendas" },
  "/vendas/nova": { title: "Nova Venda", subtitle: "Registrar nova venda" },
  "/orcamentos": { title: "Orçamentos", subtitle: "Gerenciamento de orçamentos" },
  "/compras": { title: "Compras", subtitle: "Pedidos de compra" },
  "/recompra": { title: "Controle Recompra", subtitle: "Alertas de reposição de estoque" },
};

function getPageMeta(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [key, meta] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + "/")) return meta;
  }
  return { title: "GreenPET" };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const { title, subtitle } = getPageMeta(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppTopbar
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setCollapsed((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
