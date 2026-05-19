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

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 md:px-6 gap-4 shrink-0">
      <button
        onClick={onMenuToggle}
        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div>
        <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block" />
          Sistema Online
        </span>

        <span className="hidden md:block text-xs text-muted-foreground">
          {formatDate(new Date().toISOString())}
        </span>

        {user && (
          <span className="text-xs font-medium text-foreground hidden sm:block">
            {user.nome}
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="text-muted-foreground hover:text-destructive h-8 px-2"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
