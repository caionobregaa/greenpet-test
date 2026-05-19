"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useCliente } from "@/lib/hooks/use-clientes";
import { useAnimais } from "@/lib/hooks/use-animais";
import { useVendas } from "@/lib/hooks/use-vendas";
import { useOrcamentos } from "@/lib/hooks/use-orcamentos";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ClienteDialog } from "@/components/clientes/cliente-dialog";
import { AnimalDialog } from "@/components/animais/animal-dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { formatDate, formatBRL, formatIdade, formatPhone } from "@/lib/utils/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ClienteDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [newAnimalOpen, setNewAnimalOpen] = useState(false);

  const { data: cliente, isLoading } = useCliente(id);
  const { data: animaisData } = useAnimais({ clienteId: id, limit: 50 });
  const { data: vendasData } = useVendas({ clienteId: id, limit: 20 });
  const { data: orcamentosData } = useOrcamentos({ clienteId: id, limit: 20 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="link" onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{cliente.nome}</h1>
          <p className="text-sm text-muted-foreground">{formatPhone(cliente.telefone)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="w-3.5 h-3.5 mr-2" />
          Editar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="mb-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="animais">Animais ({animaisData?.data.length ?? 0})</TabsTrigger>
          <TabsTrigger value="vendas">Vendas ({vendasData?.meta?.total ?? 0})</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos ({orcamentosData?.meta?.total ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm grid grid-cols-2 gap-4">
            {[
              ["Nome", cliente.nome],
              ["Telefone", cliente.telefone],
              ["E-mail", cliente.email ?? "—"],
              ["CPF", cliente.cpf ?? "—"],
              ["Endereço", cliente.endereco ?? "—"],
              ["Cidade", cliente.cidade],
              ["Cadastrado em", formatDate(cliente.createdAt)],
              ["Observações", cliente.obs ?? "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="animais">
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => setNewAnimalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Animal
            </Button>
          </div>
          <div className="space-y-2">
            {animaisData?.data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum animal cadastrado.</p>
            ) : animaisData?.data.map((a) => (
              <div key={a.id} className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-4">
                <span className="text-2xl">{a.especie === "Cão" ? "🐕" : "🐈"}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{a.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.especie}{a.raca ? ` · ${a.raca}` : ""} · {formatIdade(a.nascimento)}
                    {a.peso ? ` · ${a.peso}kg` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vendas">
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Animal</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Forma Pag.</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {vendasData?.data.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">Nenhuma venda registrada.</td></tr>
                ) : vendasData?.data.map((v) => (
                  <tr key={v.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-3">{formatDate(v.data)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.animal?.nome ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.formaPag}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary font-mono">{formatBRL(v.total)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/vendas/${v.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 text-xs")}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="orcamentos">
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Validade</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {orcamentosData?.data.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">Nenhum orçamento registrado.</td></tr>
                ) : orcamentosData?.data.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-3">{formatDate(o.data)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(o.validade)}</td>
                    <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                    <td className="px-4 py-3 text-right font-bold text-primary font-mono">{formatBRL(o.total)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/orcamentos/${o.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 text-xs")}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <ClienteDialog open={editOpen} onOpenChange={setEditOpen} cliente={cliente} />
      <AnimalDialog open={newAnimalOpen} onOpenChange={setNewAnimalOpen} fixedClienteId={id} />
    </div>
  );
}
