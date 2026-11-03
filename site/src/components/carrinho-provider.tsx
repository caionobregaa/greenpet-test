"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProdutoCatalogo } from "@/lib/catalogo";
import {
  alterarQuantidade,
  calcularTotal,
  conciliarCarrinho,
  lerCarrinho,
  montarLinhas,
  salvarCarrinho,
  type ItensCarrinho,
  type LinhaCarrinho,
} from "@/lib/carrinho";

interface CarrinhoContexto {
  itens: ItensCarrinho;
  linhas: LinhaCarrinho[];
  quantidadeTotal: number;
  total: number;
  aviso: string | null;
  aberto: boolean;
  definirQuantidade: (id: string, quantidade: number) => void;
  limpar: () => void;
  abrir: () => void;
  fechar: () => void;
}

const Contexto = createContext<CarrinhoContexto | null>(null);

export function useCarrinho(): CarrinhoContexto {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useCarrinho precisa estar dentro de CarrinhoProvider");
  return contexto;
}

export function CarrinhoProvider({
  produtos,
  children,
}: {
  produtos: ProdutoCatalogo[] | null;
  children: React.ReactNode;
}) {
  const [itens, setItens] = useState<ItensCarrinho>({});
  const [carregado, setCarregado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);

  // Só no navegador, depois da hidratação: o servidor não conhece o localStorage.
  useEffect(() => {
    const { itens: validos, removidos } = conciliarCarrinho(lerCarrinho(), produtos);
    setItens(validos);
    if (removidos > 0) {
      setAviso(
        removidos === 1
          ? "Um item saiu do catálogo e foi retirado do seu carrinho."
          : `${removidos} itens saíram do catálogo e foram retirados do seu carrinho.`,
      );
    }
    setCarregado(true);
  }, [produtos]);

  useEffect(() => {
    if (carregado) salvarCarrinho(itens);
  }, [itens, carregado]);

  const definirQuantidade = useCallback((id: string, quantidade: number) => {
    setItens((atuais) => alterarQuantidade(atuais, id, quantidade));
  }, []);
  const limpar = useCallback(() => setItens({}), []);
  const abrir = useCallback(() => setAberto(true), []);
  const fechar = useCallback(() => setAberto(false), []);

  const valor = useMemo(() => {
    const linhas = montarLinhas(itens, produtos ?? []);
    return {
      itens,
      linhas,
      quantidadeTotal: linhas.reduce((soma, l) => soma + l.quantidade, 0),
      total: calcularTotal(linhas),
      aviso,
      aberto,
      definirQuantidade,
      limpar,
      abrir,
      fechar,
    };
  }, [itens, produtos, aviso, aberto, definirQuantidade, limpar, abrir, fechar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
