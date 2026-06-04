"use client";

import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

interface AppTopbarProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
}

export function AppTopbar({ title, subtitle, onMenuToggle }: AppTopbarProps) {
  const { user, logout } = useAuth();

  const initial = user?.nome?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="h-13 bg-card/90 backdrop-blur-sm border-b border-border/70 flex items-center px-4 md:px-5 gap-3 shrink-0">
      <button
        onClick={onMenuToggle}
        className="p-1.5 rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      <div className="flex items-baseline gap-2">
        <p className="text-[13px] font-semibold text-foreground leading-tight tracking-tight">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground/60 leading-tight hidden sm:block">{subtitle}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden md:block text-[11px] text-muted-foreground/50 tabular-nums">
          {formatDate(new Date().toISOString())}
        </span>

        <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block" />
          Online
        </span>

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-muted-foreground hidden md:block">
              {user.nome}
            </span>
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-[11px] shrink-0">
              {initial}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="text-muted-foreground/50 hover:text-destructive h-7 w-7 p-0"
          title="Sair"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
}
