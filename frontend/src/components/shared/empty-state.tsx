interface EmptyStateProps {
  message?: string;
  description?: string;
}

export function EmptyState({
  message = "Nenhum registro encontrado",
  description = "Tente ajustar os filtros ou adicionar um novo registro.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">📋</div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
    </div>
  );
}
