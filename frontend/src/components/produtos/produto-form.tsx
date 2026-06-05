"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProdutoSchema, type CreateProdutoInput } from "@/lib/schemas/produto.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";
import { formatBRL } from "@/lib/utils/format";
import type { Produto } from "@/lib/types/produto";

const CATEGORIAS = ["Ração", "Petisco", "Medicamento", "Acessório", "Higiene", "Serviço"];
const ESPECIES = ["Cão", "Gato", "Ambos"];

interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (data: CreateProdutoInput & { imagemUrl?: string | null }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProdutoForm({ produto, onSubmit, onCancel, isLoading }: ProdutoFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateProdutoInput & { imagemUrl?: string | null }>({
    resolver: zodResolver(CreateProdutoSchema),
    defaultValues: {
      nome: produto?.nome ?? "",
      categoria: produto?.categoria as CreateProdutoInput["categoria"] ?? undefined,
      especie: (produto?.especie as CreateProdutoInput["especie"]) ?? undefined,
      subCategoria: produto?.subCategoria ?? "",
      marca: produto?.marca ?? "",
      fornecedor: produto?.fornecedor ?? "",
      pesoEmbalagem: produto?.pesoEmbalagem ?? undefined,
      valorCusto: produto?.valorCusto ?? 0,
      valorVenda: produto?.valorVenda ?? 0,
      margemCartao: produto?.margemCartao ?? 0,
      margemImposto: produto?.margemImposto ?? 0,
      margemOperacao: produto?.margemOperacao ?? 0,
      margemLucro: produto?.margemLucro ?? 0,

      descricao: produto?.descricao ?? "",
      imagemUrl: produto?.imagemUrl ?? null,
    },
  });

  const custo = useWatch({ control, name: "valorCusto" }) ?? 0;
  const venda = useWatch({ control, name: "valorVenda" }) ?? 0;
  const margemBruta = venda > 0 ? ((venda - custo) / venda) * 100 : 0;
  const imagemUrl = useWatch({ control, name: "imagemUrl" as keyof CreateProdutoInput });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Imagem + Identificação */}
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        <div className="space-y-1.5 shrink-0">
          <Label>Foto do Produto</Label>
          <ImageUpload
            value={imagemUrl as string | null | undefined}
            onChange={(url) => setValue("imagemUrl" as keyof CreateProdutoInput, url as never)}
          />
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} placeholder="Nome do produto" />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoria && <p className="text-xs text-destructive">{errors.categoria.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Espécie</Label>
            <Controller
              control={control}
              name="especie"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as espécies" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESPECIES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" {...register("marca")} placeholder="Royal Canin, Pedigree..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input id="fornecedor" {...register("fornecedor")} placeholder="Nome do fornecedor" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subCategoria">Subcategoria</Label>
          <Input id="subCategoria" {...register("subCategoria")} placeholder="Ex: Adulto, Filhote..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pesoEmbalagem">Peso Embalagem (kg)</Label>
          <Input id="pesoEmbalagem" type="number" step="0.1" {...register("pesoEmbalagem", { valueAsNumber: true })} placeholder="1.0" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" {...register("descricao")} rows={2} placeholder="Descrição do produto..." />
        </div>
      </div>

      {/* Preços e Margens */}
      <div className="space-y-4 pt-1 border-t border-border/60">
        <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Preços e Margens</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="valorCusto">Custo (R$) *</Label>
            <Input id="valorCusto" type="number" step="0.01" min="0" {...register("valorCusto", { valueAsNumber: true })} placeholder="0.00" />
            {errors.valorCusto && <p className="text-xs text-destructive">{errors.valorCusto.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="valorVenda">Venda (R$) *</Label>
            <Input id="valorVenda" type="number" step="0.01" min="0" {...register("valorVenda", { valueAsNumber: true })} placeholder="0.00" />
            {errors.valorVenda && <p className="text-xs text-destructive">{errors.valorVenda.message}</p>}
          </div>

          {(custo > 0 || venda > 0) && (
            <div className="col-span-2 bg-accent rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wide">Margem bruta estimada</p>
                <p className="text-xs text-muted-foreground">
                  Custo: {formatBRL(custo)} → Venda: {formatBRL(venda)}
                </p>
              </div>
              <p className={`text-xl font-bold font-mono ${margemBruta >= 30 ? "text-primary" : margemBruta >= 15 ? "text-amber-600" : "text-destructive"}`}>
                {margemBruta.toFixed(1)}%
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="margemCartao">Margem Cartão (%)</Label>
            <Input id="margemCartao" type="number" step="0.1" min="0" max="100" {...register("margemCartao", { valueAsNumber: true })} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="margemImposto">Margem Imposto (%)</Label>
            <Input id="margemImposto" type="number" step="0.1" min="0" max="100" {...register("margemImposto", { valueAsNumber: true })} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="margemOperacao">Margem Operação (%)</Label>
            <Input id="margemOperacao" type="number" step="0.1" min="0" max="100" {...register("margemOperacao", { valueAsNumber: true })} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="margemLucro">Margem Lucro (%)</Label>
            <Input id="margemLucro" type="number" step="0.1" min="0" max="100" {...register("margemLucro", { valueAsNumber: true })} placeholder="0" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-1 border-t border-border/60">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading} className="text-muted-foreground">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
