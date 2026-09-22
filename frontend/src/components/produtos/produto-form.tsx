"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { Loader2, Plus, Check, X } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";
import { formatBRL } from "@/lib/utils/format";
import { composeNomeRacao } from "@/lib/utils/produtos";
import type { Produto } from "@/lib/types/produto";
import {
  DISTRIBUIDORAS_PADRAO,
  carregarDistribuidorasCustomizadas,
  salvarDistribuidorasCustomizadas,
} from "@/lib/utils/distribuidoras";

const CATEGORIAS = ["Ração", "Petisco", "Suplemento", "Medicamento", "Acessório", "Higiene", "Serviço"];
const ESPECIES = ["Cão", "Gato", "Cão e Gato", "Ambos"];

const SUBCATEGORIAS: Record<string, string[]> = {
  "Ração":       ["Seca", "Úmida", "Úmida Sachê", "Úmida Lata", "Natural"],
  "Petisco":     ["Snack", "Ossinho", "Mordedor", "Brinquedo Comestível", "Funcional"],
  "Suplemento":  ["Comprimidos", "Cápsula", "Líquido", "Pó", "Pasta", "Sachê"],
  "Medicamento": ["Comprimidos", "Líquido", "Injetável", "Tópico", "Spray", "Cápsula"],
  "Acessório":   ["Coleira", "Guia", "Cama", "Roupa", "Brinquedo", "Comedouro"],
  "Higiene":     ["Shampoo", "Condicionador", "Perfume", "Escova", "Protetor Solar"],
  "Serviço":     ["Consulta", "Cirurgia", "Exame", "Banho e Tosa", "Vacina"],
};

const UNIDADES_EMBALAGEM = ["kg", "g", "Comprimidos", "mL", "L", "unidade"];

const FASES_DA_VIDA = ["Filhote", "Adulto", "Sênior"];
const PORTES = ["Mini e Pequeno", "Pequeno", "Médio", "Grande", "Gigante"];

interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (data: CreateProdutoInput & { imagemUrl?: string | null; estoqueInicial?: number; estoqueValidade?: string | null; estoqueLote?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// ── Combobox com botão "+" ───────────────────────────────────────────────────

function ComboboxComAdicao({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione ou adicione...",
  addLabel = "Nova opção",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  addLabel?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [novo, setNovo] = useState("");

  function confirmar() {
    const trimmed = novo.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setNovo("");
    setAdding(false);
  }

  function cancelar() {
    setNovo("");
    setAdding(false);
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {adding ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmar(); } if (e.key === "Escape") cancelar(); }}
            placeholder={addLabel}
            className="flex-1 h-9 text-sm"
          />
          <Button type="button" size="sm" className="h-9 px-3" onClick={confirmar}>
            <Check className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-9 px-3" onClick={cancelar}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{placeholder}</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
            {value && !options.includes(value) && (
              <option value={value}>{value}</option>
            )}
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 shrink-0"
            title={addLabel}
            onClick={() => setAdding(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Form principal ───────────────────────────────────────────────────────────

export function ProdutoForm({ produto, onSubmit, onCancel, isLoading }: ProdutoFormProps) {
  const [estoqueInicial, setEstoqueInicial] = useState<number | "">("");
  const [estoqueValidade, setEstoqueValidade] = useState("");
  const [estoqueLote, setEstoqueLote] = useState("");
  const [nomeRacao, setNomeRacao] = useState("");

  // Load distributors from localStorage + defaults on mount
  const [distribuidoras, setDistribuidoras] = useState<string[]>(() => {
    const customizadas = carregarDistribuidorasCustomizadas();
    const todas = [...new Set([...DISTRIBUIDORAS_PADRAO, ...customizadas])];
    if (produto?.fornecedor && !todas.includes(produto.fornecedor)) {
      todas.push(produto.fornecedor);
    }
    return todas;
  });

  // Reload from localStorage once hydrated (SSR safety)
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const customizadas = carregarDistribuidorasCustomizadas();
    if (customizadas.length === 0) return;
    setDistribuidoras((prev) => {
      const todas = [...new Set([...DISTRIBUIDORAS_PADRAO, ...customizadas, ...prev])];
      return todas;
    });
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateProdutoInput & { imagemUrl?: string | null }>({
    resolver: zodResolver(CreateProdutoSchema),
    defaultValues: {
      nome:              produto?.nome ?? "",
      categoria:         produto?.categoria as CreateProdutoInput["categoria"] ?? undefined,
      especie:           (produto?.especie as CreateProdutoInput["especie"]) ?? undefined,
      subCategoria:      produto?.subCategoria ?? "",
      faseDaVida:        produto?.faseDaVida ?? "",
      porte:             produto?.porte ?? "",
      sabor:             produto?.sabor ?? "",
      marca:             produto?.marca ?? "",
      fornecedor:        produto?.fornecedor ?? "",
      pesoEmbalagem:     produto?.pesoEmbalagem ?? undefined,
      unidadeEmbalagem:  produto?.unidadeEmbalagem ?? "",
      valorCusto:        produto?.valorCusto ?? 0,
      valorVenda:        produto?.valorVenda ?? 0,
      estoqueMinimo:     produto?.estoqueMinimo ?? undefined,
      margemCartao:      produto?.margemCartao ?? 0,
      margemImposto:     produto?.margemImposto ?? 0,
      margemOperacao:    produto?.margemOperacao ?? 0,
      margemLucro:       produto?.margemLucro ?? 0,
      descricao:         produto?.descricao ?? "",
      imagemUrl:         produto?.imagemUrl ?? null,
    },
  });

  const custo            = useWatch({ control, name: "valorCusto" }) ?? 0;
  const venda            = useWatch({ control, name: "valorVenda" }) ?? 0;
  const categoria        = useWatch({ control, name: "categoria" }) ?? "";
  const unidadeEmbalagem = useWatch({ control, name: "unidadeEmbalagem" }) ?? "";
  const imagemUrl        = useWatch({ control, name: "imagemUrl" as keyof CreateProdutoInput });
  const especie           = useWatch({ control, name: "especie" }) ?? "";
  const faseDaVida        = useWatch({ control, name: "faseDaVida" }) ?? "";
  const porte             = useWatch({ control, name: "porte" }) ?? "";
  const sabor             = useWatch({ control, name: "sabor" }) ?? "";
  const pesoEmbalagemWatch = useWatch({ control, name: "pesoEmbalagem" });

  const margem               = venda > 0 ? ((venda - custo) / venda) * 100 : 0;
  const margemCor            = margem >= 30 ? "text-primary" : margem >= 20 ? "text-amber-500" : "text-destructive";
  const margemAbaixoDoMinimo = venda > 0 && margem < 20;

  const [margemDesejada, setMargemDesejada] = useState("");
  const margemDesejadaNum = margemDesejada.trim() ? parseFloat(margemDesejada.replace(",", ".")) : null;
  const margemDesejadaAbaixoDoMinimo =
    margemDesejadaNum !== null && !isNaN(margemDesejadaNum) && margemDesejadaNum < 20;

  function handleMargemDesejadaChange(valor: string) {
    setMargemDesejada(valor);
    const alvo = parseFloat(valor.replace(",", "."));
    if (!custo || isNaN(alvo)) return;
    const margemAplicada = Math.min(Math.max(alvo, 20), 95);
    const novaVenda = custo / (1 - margemAplicada / 100);
    setValue("valorVenda", Math.round(novaVenda * 100) / 100, { shouldValidate: true, shouldDirty: true });
  }

  const nomeComposto = categoria === "Ração" && nomeRacao.trim()
    ? composeNomeRacao({ nomeRacao, especie, faseDaVida, porte, sabor, pesoEmbalagem: pesoEmbalagemWatch, unidadeEmbalagem })
    : null;

  useEffect(() => {
    if (nomeComposto !== null) {
      setValue("nome", nomeComposto, { shouldValidate: true, shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomeComposto]);

  const subcategoriasSugeridas = SUBCATEGORIAS[categoria] ?? [];

  // Label and step for the quantidade field based on selected unit
  const unidadeLabel = unidadeEmbalagem
    ? unidadeEmbalagem === "kg"         ? "Peso (kg)"
    : unidadeEmbalagem === "g"          ? "Peso (g)"
    : unidadeEmbalagem === "Comprimidos"? "Quantidade (comprimidos)"
    : unidadeEmbalagem === "mL"         ? "Volume (mL)"
    : unidadeEmbalagem === "L"          ? "Volume (L)"
    : "Quantidade"
    : "Quantidade";
  const unidadeStep = unidadeEmbalagem === "kg" || unidadeEmbalagem === "L" ? "0.01"
    : unidadeEmbalagem === "g" || unidadeEmbalagem === "mL" ? "1"
    : "1";
  const unidadePlaceholder = unidadeEmbalagem === "kg" ? "Ex: 15"
    : unidadeEmbalagem === "g"           ? "Ex: 500"
    : unidadeEmbalagem === "Comprimidos" ? "Ex: 30"
    : unidadeEmbalagem === "mL"          ? "Ex: 250"
    : unidadeEmbalagem === "L"           ? "Ex: 1"
    : "Quantidade";

  function handleFornecedorChange(valor: string) {
    if (valor && !distribuidoras.includes(valor)) {
      const nova = [...distribuidoras, valor];
      setDistribuidoras(nova);
      // Persist only the custom ones (beyond the defaults)
      const customizadas = nova.filter((d) => !DISTRIBUIDORAS_PADRAO.includes(d));
      salvarDistribuidorasCustomizadas(customizadas);
    }
    setValue("fornecedor", valor);
  }

  function handleFormSubmit(data: CreateProdutoInput & { imagemUrl?: string | null }) {
    const qtd = typeof estoqueInicial === "number" && estoqueInicial > 0 ? estoqueInicial : undefined;
    onSubmit({
      ...data,
      estoqueInicial: qtd,
      estoqueValidade: qtd ? (estoqueValidade || null) : undefined,
      estoqueLote: qtd ? (estoqueLote || undefined) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      {/* Imagem + Identificação */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="space-y-1.5 shrink-0">
          <Label>Foto do Produto</Label>
          <ImageUpload
            value={imagemUrl as string | null | undefined}
            onChange={(url) => setValue("imagemUrl" as keyof CreateProdutoInput, url as never)}
          />
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full">
          <div className="space-y-1.5 col-span-1 sm:col-span-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} placeholder="Nome do produto" />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>SKU</Label>
            {produto ? (
              <Input value={produto.sku} readOnly disabled className="font-mono" />
            ) : (
              <Input value="Gerado automaticamente ao salvar" readOnly disabled className="text-muted-foreground" />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <Select onValueChange={(v) => { field.onChange(v); setValue("subCategoria", ""); }} defaultValue={field.value}>
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

      {/* Composição do Nome — só para Ração */}
      {categoria === "Ração" && (
        <div className="space-y-4 pt-2 border-t border-border/60">
          <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
            Composição do Nome (Ração)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <Label htmlFor="nomeRacao">Nome da Ração</Label>
              <Input
                id="nomeRacao"
                value={nomeRacao}
                onChange={(e) => setNomeRacao(e.target.value)}
                placeholder="Ex: Golden Fórmula"
              />
              <p className="text-xs text-muted-foreground/70">
                Usado para montar o campo Nome acima automaticamente. Deixe em branco para editar o Nome manualmente.
              </p>
            </div>

            <Controller
              control={control}
              name="faseDaVida"
              render={({ field }) => (
                <ComboboxComAdicao
                  label="Fase da Vida"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={FASES_DA_VIDA}
                  placeholder="Selecione ou adicione..."
                  addLabel="Nova fase da vida"
                />
              )}
            />

            <Controller
              control={control}
              name="porte"
              render={({ field }) => (
                <ComboboxComAdicao
                  label="Porte"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={PORTES}
                  placeholder="Selecione ou adicione..."
                  addLabel="Novo porte"
                />
              )}
            />

            <div className="space-y-1.5">
              <Label htmlFor="sabor">Sabor</Label>
              <Input id="sabor" {...register("sabor")} placeholder="Ex: Frango e Arroz" />
            </div>

            {nomeComposto && (
              <div className="col-span-1 sm:col-span-2 rounded-lg border border-border bg-accent/40 px-4 py-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Nome Composto</p>
                <p className="text-sm font-mono mt-1">{nomeComposto}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Preenchido automaticamente no campo Nome acima — você pode editá-lo livremente depois.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detalhes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" {...register("marca")} placeholder="Royal Canin, Pedigree..." />
        </div>

        {/* Distribuidora com "+" e persistência em localStorage */}
        <Controller
          control={control}
          name="fornecedor"
          render={({ field }) => (
            <ComboboxComAdicao
              label="Distribuidora / Fornecedor"
              value={field.value ?? ""}
              onChange={(v) => { handleFornecedorChange(v); field.onChange(v); }}
              options={distribuidoras}
              placeholder="Selecione a distribuidora..."
              addLabel="Nome da nova distribuidora"
            />
          )}
        />

        {/* Subcategoria com "+" e sugestões por categoria */}
        <Controller
          control={control}
          name="subCategoria"
          render={({ field }) => (
            <ComboboxComAdicao
              label={
                categoria === "Medicamento" || categoria === "Suplemento"
                  ? "Forma (Comprimidos, Líquido...)"
                  : "Subcategoria"
              }
              value={field.value ?? ""}
              onChange={field.onChange}
              options={subcategoriasSugeridas}
              placeholder={
                subcategoriasSugeridas.length > 0
                  ? "Selecione ou adicione..."
                  : "Ex: Adulto, Filhote..."
              }
              addLabel="Nova subcategoria"
            />
          )}
        />

        {/* Quantidade na embalagem: seletor de unidade + campo de valor */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label>Quantidade / Peso da Embalagem</Label>
          <div className="flex gap-3 items-end flex-wrap sm:flex-nowrap">
            {/* Unit selector */}
            <div className="space-y-1 shrink-0">
              <p className="text-xs text-muted-foreground">Unidade</p>
              <Controller
                control={control}
                name="unidadeEmbalagem"
                render={({ field }) => (
                  <select
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring w-36"
                  >
                    <option value="">Selecione...</option>
                    {UNIDADES_EMBALAGEM.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Quantity input */}
            <div className="space-y-1 flex-1 min-w-[120px]">
              <p className="text-xs text-muted-foreground">{unidadeLabel}</p>
              <Input
                type="number"
                step={unidadeStep}
                min="0"
                {...register("pesoEmbalagem", { valueAsNumber: true })}
                placeholder={unidadePlaceholder}
                disabled={!unidadeEmbalagem}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Usado para calcular recompra e controle de estoque
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="estoqueMinimo">
            Estoque Mínimo
            <span className="ml-1 text-muted-foreground font-normal text-xs">(opcional)</span>
          </Label>
          <Input
            id="estoqueMinimo"
            type="number"
            min="0"
            step="1"
            {...register("estoqueMinimo", { valueAsNumber: true })}
            placeholder="Ex: 10"
          />
          <p className="text-xs text-muted-foreground/70">
            Abaixo desse valor o produto aparece no alerta de estoque baixo do Dashboard
          </p>
        </div>

        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" {...register("descricao")} rows={2} placeholder="Descrição do produto..." />
        </div>
      </div>

      {/* Preços e Margem */}
      <div className="space-y-4 pt-2 border-t border-border/60">
        <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Preços e Margem</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="valorCusto">Custo (R$) *</Label>
            <Input
              id="valorCusto"
              type="number"
              step="0.01"
              min="0"
              {...register("valorCusto", { valueAsNumber: true })}
              placeholder="0,00"
            />
            {errors.valorCusto && <p className="text-xs text-destructive">{errors.valorCusto.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="valorVenda">Preço de Venda (R$) *</Label>
            <Input
              id="valorVenda"
              type="number"
              step="0.01"
              min="0"
              {...register("valorVenda", { valueAsNumber: true })}
              placeholder="0,00"
            />
            {errors.valorVenda && <p className="text-xs text-destructive">{errors.valorVenda.message}</p>}
          </div>

          <div className="col-span-1 sm:col-span-2 space-y-1.5">
            <Label htmlFor="margemDesejada">
              Calcular preço pela margem desejada
              <span className="ml-1 text-muted-foreground font-normal text-xs">(opcional)</span>
            </Label>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                id="margemDesejada"
                type="number"
                step="0.1"
                min="20"
                max="95"
                value={margemDesejada}
                onChange={(e) => handleMargemDesejadaChange(e.target.value)}
                placeholder="Ex: 35"
                disabled={!custo}
                className="max-w-[140px]"
              />
              <span className="text-xs text-muted-foreground">
                % sobre o custo — preenche o Preço de Venda automaticamente
              </span>
            </div>
            {!custo && (
              <p className="text-xs text-muted-foreground/70">Informe o custo primeiro para calcular pela margem.</p>
            )}
            {margemDesejadaAbaixoDoMinimo && (
              <p className="text-xs text-destructive">
                A margem mínima permitida é 20%. O preço foi calculado usando 20%.
              </p>
            )}
          </div>

          {venda > 0 && (
            <div className="col-span-1 sm:col-span-2 rounded-lg border border-border bg-accent/40 px-4 py-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Margem Bruta</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ({formatBRL(venda)} − {formatBRL(custo)}) ÷ {formatBRL(venda)} × 100
                  </p>
                </div>
                <p className={`text-2xl font-bold font-mono tabular-nums ${margemCor}`}>
                  {margem.toFixed(1)}%
                </p>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${margem >= 30 ? "bg-primary" : margem >= 20 ? "bg-amber-500" : "bg-destructive"}`}
                  style={{ width: `${Math.min(100, Math.max(0, margem))}%` }}
                />
              </div>
              {margemAbaixoDoMinimo && (
                <p className="text-xs text-destructive mt-2">
                  Cuidado com essa margem, está abaixo do padrão mínimo que é 20%
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estoque inicial — apenas ao criar um novo produto */}
      {!produto && (
        <div className="space-y-3 pt-2 border-t border-border/60">
          <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Estoque Inicial</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="estoqueInicial">
                Quantidade
                <span className="ml-1 text-muted-foreground font-normal text-xs">(opcional)</span>
              </Label>
              <Input
                id="estoqueInicial"
                type="number"
                min="0"
                step="1"
                value={estoqueInicial}
                onChange={(e) => setEstoqueInicial(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estoqueValidade">
                Validade
                <span className="ml-1 text-muted-foreground font-normal text-xs">(opcional)</span>
              </Label>
              <Input
                id="estoqueValidade"
                type="date"
                value={estoqueValidade}
                onChange={(e) => setEstoqueValidade(e.target.value)}
                disabled={!estoqueInicial || estoqueInicial === 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estoqueLote">
                Lote / Referência
                <span className="ml-1 text-muted-foreground font-normal text-xs">(opcional)</span>
              </Label>
              <Input
                id="estoqueLote"
                value={estoqueLote}
                onChange={(e) => setEstoqueLote(e.target.value)}
                placeholder="Ex: LOT-2025-01"
                disabled={!estoqueInicial || estoqueInicial === 0}
              />
            </div>
          </div>
          {typeof estoqueInicial === "number" && estoqueInicial > 0 && (
            <p className="text-xs text-primary font-medium">
              {estoqueInicial} unidade{estoqueInicial !== 1 ? "s" : ""} serão lançadas no estoque ao salvar
              {estoqueValidade ? ` · Validade: ${new Date(estoqueValidade + "T00:00:00").toLocaleDateString("pt-BR")}` : ""}
              {estoqueLote ? ` · Lote: ${estoqueLote}` : ""}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-border/60 sticky bottom-0 bg-background pb-2 -mx-1 px-1">
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
