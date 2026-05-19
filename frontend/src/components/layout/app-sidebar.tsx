"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Package,
  ClipboardList,
  FileText,
  Truck,
  RefreshCw,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/vendas/nova", label: "Nova Venda", icon: ShoppingCart, highlight: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/animais", label: "Animais", icon: PawPrint },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/vendas", label: "Histórico de Vendas", icon: ClipboardList },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/compras", label: "Compras", icon: Truck },
  { href: "/recompra", label: "Controle Recompra", icon: RefreshCw },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AppSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/vendas/nova") return pathname === "/vendas/nova";
    if (href === "/vendas") return pathname.startsWith("/vendas") && pathname !== "/vendas/nova";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className={cn(
        // Mobile (drawer fixo): desliza sobre o conteúdo
        "fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-card border-r border-border transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop (sidebar estático): sempre visível, largura controlada por collapsed
        "md:static md:z-auto md:translate-x-0 md:transition-all md:duration-250 md:overflow-hidden md:shrink-0",
        collapsed ? "md:w-16" : "md:w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 text-white font-bold"
          style={{ background: "linear-gradient(135deg, #388e3c, #00897b)" }}
        >
          🐾
        </div>
        <div className={cn("overflow-hidden", collapsed && "md:hidden")}>
          <p className="text-[17px] font-bold text-primary leading-tight whitespace-nowrap">
            GreenPET
          </p>
          <p className="text-[10px] text-muted-foreground tracking-wide uppercase whitespace-nowrap">
            Gestão Pet Shop
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2.5 md:py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap overflow-hidden",
                highlight && !active
                  ? "bg-primary text-primary-foreground hover:bg-brand-800"
                  : active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className={cn("truncate", collapsed && "md:hidden")}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Toggle — só visível no desktop */}
      <div className="hidden md:block p-2 border-t border-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
