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
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/vendas/nova") return pathname === "/vendas/nova";
    if (href === "/vendas") return pathname.startsWith("/vendas") && pathname !== "/vendas/nova";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-250 overflow-hidden shrink-0",
        collapsed ? "w-16" : "w-[220px]"
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
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-[17px] font-bold text-primary leading-tight whitespace-nowrap">
              GreenPET
            </p>
            <p className="text-[10px] text-muted-foreground tracking-wide uppercase whitespace-nowrap">
              Gestão Pet Shop
            </p>
          </div>
        )}
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
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap overflow-hidden",
                highlight && !active
                  ? "bg-primary text-primary-foreground hover:bg-brand-800"
                  : active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <div className="p-2 border-t border-border">
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
