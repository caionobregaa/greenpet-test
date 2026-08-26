import { describe, it, expect } from 'vitest'
import { classifyCurva, calcularCurvaAbc, ordenarCurvaVenda, type Ordenavel } from '@/modules/curva-venda/domain/services/curva-abc.service'

describe('curva-abc.service — classifyCurva', () => {
  it('retorna A quando percentualAcumulado <= 80', () => {
    expect(classifyCurva(0)).toBe('A')
    expect(classifyCurva(50)).toBe('A')
    expect(classifyCurva(80)).toBe('A')
  })

  it('retorna B quando percentualAcumulado está em (80, 95]', () => {
    expect(classifyCurva(80.01)).toBe('B')
    expect(classifyCurva(90)).toBe('B')
    expect(classifyCurva(95)).toBe('B')
  })

  it('retorna C quando percentualAcumulado > 95', () => {
    expect(classifyCurva(95.01)).toBe('C')
    expect(classifyCurva(100)).toBe('C')
  })
})

describe('curva-abc.service — calcularCurvaAbc', () => {
  it('retorna lista vazia quando não há itens', () => {
    expect(calcularCurvaAbc([])).toEqual([])
  })

  it('retorna lista vazia quando a receita geral é zero', () => {
    const resultado = calcularCurvaAbc([
      { produtoId: 'p1', receita: 0, qtd: 5 },
      { produtoId: 'p2', receita: 0, qtd: 3 },
    ])
    expect(resultado).toEqual([])
  })

  it('classifica um único produto com 100% da receita acumulada como curva C (regra de percentual acumulado > 95)', () => {
    // Comportamento esperado do método clássico de curva ABC por percentual acumulado:
    // o(s) último(s) item(ns) da lista sempre fecham em 100% acumulado, que cai na faixa C (>95%).
    const resultado = calcularCurvaAbc([{ produtoId: 'p1', receita: 1000, qtd: 10 }])
    expect(resultado).toHaveLength(1)
    expect(resultado[0]).toMatchObject({
      produtoId: 'p1',
      quantidadeVendida: 10,
      receitaTotal: 1000,
      percentualReceita: 100,
      percentualAcumulado: 100,
      curva: 'C',
    })
  })

  it('ordena por receita decrescente e acumula percentuais corretamente', () => {
    const resultado = calcularCurvaAbc([
      { produtoId: 'baixo', receita: 100, qtd: 1 },
      { produtoId: 'alto', receita: 700, qtd: 1 },
      { produtoId: 'medio', receita: 200, qtd: 1 },
    ])

    expect(resultado.map((r) => r.produtoId)).toEqual(['alto', 'medio', 'baixo'])
    expect(resultado[0]).toMatchObject({ percentualReceita: 70, percentualAcumulado: 70, curva: 'A' })
    expect(resultado[1]).toMatchObject({ percentualReceita: 20, percentualAcumulado: 90, curva: 'B' })
    expect(resultado[2]).toMatchObject({ percentualReceita: 10, percentualAcumulado: 100, curva: 'C' })
  })

  it('classifica corretamente um cenário com produtos em A, B e C', () => {
    // percentuais: 50%, 30%, 15%, 5% -> acumulado: 50, 80, 95, 100
    const resultado = calcularCurvaAbc([
      { produtoId: 'p1', receita: 5000, qtd: 50 },
      { produtoId: 'p2', receita: 3000, qtd: 30 },
      { produtoId: 'p3', receita: 1500, qtd: 15 },
      { produtoId: 'p4', receita: 500, qtd: 5 },
    ])

    const curvas = resultado.map((r) => r.curva)
    expect(curvas).toEqual(['A', 'A', 'B', 'C'])
    expect(resultado[resultado.length - 1].percentualAcumulado).toBe(100)
  })
})

describe('curva-abc.service — ordenarCurvaVenda', () => {
  const itens: (Ordenavel & { produtoId: string })[] = [
    { produtoId: 'p1', categoria: 'Ração', quantidadeVendida: 50, receitaTotal: 5000, percentualReceita: 50, percentualAcumulado: 50 },
    { produtoId: 'p2', categoria: 'Petisco', quantidadeVendida: 10, receitaTotal: 1000, percentualReceita: 10, percentualAcumulado: 90 },
    { produtoId: 'p3', categoria: 'Acessório', quantidadeVendida: 30, receitaTotal: 3000, percentualReceita: 30, percentualAcumulado: 80 },
  ]

  it('retorna a lista sem alterações quando sortBy não é informado', () => {
    const resultado = ordenarCurvaVenda(itens)
    expect(resultado.map((r) => r.produtoId)).toEqual(['p1', 'p2', 'p3'])
  })

  it('ordena por receitaTotal decrescente (padrão) e crescente', () => {
    const desc = ordenarCurvaVenda(itens, 'receitaTotal')
    expect(desc.map((r) => r.produtoId)).toEqual(['p1', 'p3', 'p2'])

    const asc = ordenarCurvaVenda(itens, 'receitaTotal', 'asc')
    expect(asc.map((r) => r.produtoId)).toEqual(['p2', 'p3', 'p1'])
  })

  it('ordena por quantidadeVendida', () => {
    const asc = ordenarCurvaVenda(itens, 'quantidadeVendida', 'asc')
    expect(asc.map((r) => r.produtoId)).toEqual(['p2', 'p3', 'p1'])
  })

  it('ordena por percentualReceita e percentualAcumulado', () => {
    expect(ordenarCurvaVenda(itens, 'percentualReceita', 'desc').map((r) => r.produtoId)).toEqual(['p1', 'p3', 'p2'])
    expect(ordenarCurvaVenda(itens, 'percentualAcumulado', 'asc').map((r) => r.produtoId)).toEqual(['p1', 'p3', 'p2'])
  })

  it('ordena por categoria alfabeticamente (string), asc e desc', () => {
    const asc = ordenarCurvaVenda(itens, 'categoria', 'asc')
    expect(asc.map((r) => r.produtoId)).toEqual(['p3', 'p2', 'p1']) // Acessório, Petisco, Ração

    const desc = ordenarCurvaVenda(itens, 'categoria', 'desc')
    expect(desc.map((r) => r.produtoId)).toEqual(['p1', 'p2', 'p3'])
  })

  it('não muta o array original', () => {
    const copia = [...itens]
    ordenarCurvaVenda(itens, 'receitaTotal', 'asc')
    expect(itens).toEqual(copia)
  })
})
