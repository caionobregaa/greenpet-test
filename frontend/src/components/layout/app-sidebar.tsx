"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  ChevronDown,
  Warehouse,
  Receipt,
  Bell,
  TrendingUp,
  Gauge,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface LeafNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  highlight?: boolean;
}

interface GroupNavItem {
  label: string;
  icon: React.ElementType;
  items: LeafNavItem[];
}

type NavEntry = LeafNavItem | GroupNavItem;

function isGroup(entry: NavEntry): entry is GroupNavItem {
  return "items" in entry;
}

const NAV_ITEMS: NavEntry[] = [
  { href: "/vendas/nova", label: "Nova Venda", icon: ShoppingCart, highlight: true },
  { href: "/avisos", label: "Avisos", icon: Bell },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Finanças",
    icon: Wallet,
    items: [
      { href: "/bi", label: "BI", icon: Gauge },
      { href: "/curva-venda", label: "Curva de Venda", icon: TrendingUp },
      { href: "/compras", label: "Despesas", icon: Receipt },
    ],
  },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/animais", label: "Animais", icon: PawPrint },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/estoque", label: "Estoque", icon: Warehouse },
  { href: "/vendas", label: "Histórico de Vendas", icon: ClipboardList },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
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
        {NAV_ITEMS.map((entry) => {
          if (isGroup(entry)) {
            return (
              <NavGroup
                key={entry.label}
                entry={entry}
                collapsed={collapsed}
                isActive={isActive}
                onMobileClose={onMobileClose}
              />
            );
          }
          return (
            <NavLink key={entry.href} entry={entry} collapsed={collapsed} active={isActive(entry.href)} onMobileClose={onMobileClose} />
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

function NavLink({
  entry,
  collapsed,
  active,
  onMobileClose,
  indent,
}: {
  entry: LeafNavItem;
  collapsed: boolean;
  active: boolean;
  onMobileClose: () => void;
  indent?: boolean;
}) {
  const { href, label, icon: Icon, highlight } = entry;
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onMobileClose}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 md:py-[7px] rounded-md text-[13px] font-medium transition-all duration-150 whitespace-nowrap overflow-hidden",
        indent && !collapsed && "pl-8",
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
}

function NavGroup({
  entry,
  collapsed,
  isActive,
  onMobileClose,
}: {
  entry: GroupNavItem;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  onMobileClose: () => void;
}) {
  const hasActiveChild = entry.items.some((item) => isActive(item.href));
  const [open, setOpen] = useState(hasActiveChild);
  const Icon = entry.icon;

  // Sidebar recolhida: mostra só os ícones dos filhos direto, sem accordion
  // (não tem espaço pra rótulo do grupo nem faz sentido colapsar mais ainda).
  if (collapsed) {
    return (
      <>
        {entry.items.map((item) => (
          <NavLink key={item.href} entry={item} collapsed={collapsed} active={isActive(item.href)} onMobileClose={onMobileClose} />
        ))}
      </>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-150",
          hasActiveChild ? "text-sidebar-primary" : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon className={cn("w-[17px] h-[17px] shrink-0", hasActiveChild ? "text-sidebar-primary" : "opacity-70")} />
        <span className="truncate flex-1 text-left">{entry.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 opacity-60 transition-transform duration-200", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[starting-style]:h-0 data-[ending-style]:h-0 transition-[height] duration-200">
        <div className="space-y-0.5 pt-0.5 pb-1">
          {entry.items.map((item) => (
            <NavLink key={item.href} entry={item} collapsed={collapsed} active={isActive(item.href)} onMobileClose={onMobileClose} indent />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
