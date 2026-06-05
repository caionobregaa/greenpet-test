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
  RefreshCw,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Receipt,
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
  { href: "/estoque", label: "Estoque", icon: Warehouse },
  { href: "/vendas", label: "Histórico de Vendas", icon: ClipboardList },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/compras", label: "Despesas", icon: Receipt },
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
    if (!pathname) return false;
    if (href === "/vendas/nova") return pathname === "/vendas/nova";
    if (href === "/vendas") return pathname.startsWith("/vendas") && pathname !== "/vendas/nova";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "md:static md:z-auto md:translate-x-0 md:transition-all md:duration-250 md:overflow-hidden md:shrink-0",
        collapsed ? "md:w-16" : "md:w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: "linear-gradient(135deg, #5cbf7a 0%, #1a9688 100%)" }}
        >
          <span className="text-[15px]">🐾</span>
        </div>
        <div className={cn("overflow-hidden", collapsed && "md:hidden")}>
          <p
            className="text-[16px] font-semibold leading-tight whitespace-nowrap tracking-tight"
            style={{ color: "#d4ead4", fontFamily: "var(--font-sora)" }}
          >
            GreenPET
          </p>
          <p className="text-[9px] tracking-widest uppercase whitespace-nowrap" style={{ color: "#5a7a5a" }}>
            Gestão Pet Shop
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 md:py-[7px] rounded-md text-[13px] font-medium transition-all duration-150 whitespace-nowrap overflow-hidden",
                highlight && !active
                  ? "bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/25 hover:bg-sidebar-primary/30"
                  : active
                  ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary ml-0"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-[17px] h-[17px] shrink-0",
                  active ? "text-sidebar-primary" : highlight && !active ? "text-sidebar-primary" : "opacity-70"
                )}
              />
              <span className={cn("truncate", collapsed && "md:hidden")}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Toggle — desktop only */}
      <div className="hidden md:block px-2 py-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors"
          style={{ color: "#3a5a3a" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#152219")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
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
