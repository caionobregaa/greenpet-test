import { cn } from "@/lib/utils/cn";

type Status =
  | "pendente"
  | "aberto"
  | "fechado"
  | "perdido"
  | "confirmado"
  | "recebido"
  | "cancelado"
  | "ativo"
  | "inativo";

const STATUS_MAP: Record<Status, { label: string; className: string }> = {
  pendente:   { label: "Pendente",   className: "bg-amber-50 text-amber-800 border-amber-400" },
  aberto:     { label: "Aberto",     className: "bg-amber-50 text-amber-800 border-amber-400" },
  fechado:    { label: "Fechado",    className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  perdido:    { label: "Perdido",    className: "bg-red-50 text-red-600 border-red-400" },
  confirmado: { label: "Confirmado", className: "bg-brand-50 text-brand-700 border-brand-200" },
  recebido:   { label: "Recebido",   className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  cancelado:  { label: "Cancelado",  className: "bg-gray-100 text-gray-700 border-gray-300" },
  ativo:      { label: "Ativo",      className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  inativo:    { label: "Inativo",    className: "bg-gray-100 text-gray-700 border-gray-300" },
};

interface StatusPillProps {
  status: string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config = STATUS_MAP[status as Status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
