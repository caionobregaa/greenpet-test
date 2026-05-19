import { cn } from "@/lib/utils/cn";

type Status =
  | "pendente"
  | "aprovado"
  | "recusado"
  | "confirmado"
  | "recebido"
  | "cancelado"
  | "ativo"
  | "inativo";

const STATUS_MAP: Record<Status, { label: string; className: string }> = {
  pendente:   { label: "Pendente",   className: "bg-amber-50 text-amber-800 border-amber-400" },
  aprovado:   { label: "Aprovado",   className: "bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]" },
  recusado:   { label: "Recusado",   className: "bg-red-50 text-red-600 border-red-400" },
  confirmado: { label: "Confirmado", className: "bg-[#e0f2f1] text-[#004d40] border-[#80cbc4]" },
  recebido:   { label: "Recebido",   className: "bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]" },
  cancelado:  { label: "Cancelado",  className: "bg-gray-100 text-gray-700 border-gray-300" },
  ativo:      { label: "Ativo",      className: "bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]" },
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
