"use client";

import Link from "next/link";
import Image from "next/image";
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
      <Link
        href="/dashboard"
        onClick={onMobileClose}
        className={cn("flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border", collapsed && "md:justify-center md:px-0")}
      >
        <Image
          src="/brand/mascote.png"
          alt="beezpet"
          width={320}
          height={320}
          priority
          className="h-10 w-10 shrink-0 rounded-full ring-2 ring-butter-200/30"
        />
        <div className={cn("min-w-0", collapsed && "md:hidden")}>
          <Image src="/brand/wordmark-amarelo.png" alt="" width={720} height={190} priority className="h-[22px] w-auto" />
          <p className="mt-1 text-[9px] tracking-[0.22em] uppercase whitespace-nowrap text-blush-200/70">
            Gestão Pet Shop
          </p>
        </div>
      </Link>

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
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
        "flex items-center gap-2.5 px-2.5 py-2 md:py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap overflow-hidden",
        indent && !collapsed && "pl-8",
        highlight
          ? "mb-2 bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-[0_6px_16px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-px hover:bg-butter-100"
          : active
          ? "bg-sidebar-accent text-sidebar-primary shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon
        className={cn(
          "w-[17px] h-[17px] shrink-0",
          highlight ? "text-sidebar-primary-foreground" : active ? "text-sidebar-primary" : "opacity-70"
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
