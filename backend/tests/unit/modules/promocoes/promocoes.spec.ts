import { describe, it, expect, beforeEach } from 'vitest'
import {
  dataManaus,
  fimDoDia,
  formatarData,
  inicioDoDia,
  percentualDesconto,
  situacaoPromocao,
  validarPeriodo,
} from '@/modules/promocoes/domain/promocao'
import {
  EncerrarPromocaoUseCase,
  ExcluirPromocaoUseCase,
  SalvarPromocaoUseCase,
} from '@/modules/promocoes/application/use-cases/promocoes.use-cases'
import type {
  DadosPromocao,
  IPromocaoRepository,
  ProdutoParaPromocao,
  PromocaoRegistro,
} from '@/modules/promocoes/domain/promocao.repository.interface'
import { promocaoParaResposta } from '@/modules/promocoes/infrastructure/http/promocoes.routes'

// specs/promocoes/spec-v1.md e rules.md
class RepoEmMemoria implements IPromocaoRepository {
  promocoes: PromocaoRegistro[] = []
  catalogo: ProdutoParaPromocao[] = [
    { id: 'racao', nome: 'Ração Golden 10kg', valorVenda: 189.9 },
    { id: 'sache', nome: 'Sachê 85g', valorVenda: 3.9 },
  ]
  private seq = 0

  private registro(id: string, d: DadosPromocao): PromocaoRegistro {
    return {
      id, nome: d.nome, inicio: d.inicio, fim: d.fim,
      itens: d.itens.map((i) => {
        const p = this.catalogo.find((c) => c.id === i.produtoId)!
        return { produtoId: p.id, produtoNome: p.nome, valorVenda: p.valorVenda, valorCusto: 100, valorPromocional: i.valorPromocional }
      }),
    }
  }

  async listar() { return this.promocoes }
  async buscar(id: string) { return this.promocoes.find((p) => p.id === id) ?? null }
  async criar(d: DadosPromocao) { const p = this.registro(`c${++this.seq}`, d); this.promocoes.push(p); return p }
  async atualizar(id: string, d: DadosPromocao) {
    const p = this.registro(id, d)
    this.promocoes = this.promocoes.map((x) => (x.id === id ? p : x))
    return p
  }
  async alterarFim(id: string, fim: Date) { const p = (await this.buscar(id))!; p.fim = fim; return p }
  async excluir(id: string) { this.promocoes = this.promocoes.filter((p) => p.id !== id) }
  async produtos(ids: string[]) { return this.catalogo.filter((p) => ids.includes(p.id)) }
  async conflitos(ids: string[], inicio: Date, fim: Date, excetoId?: string) {
    return this.promocoes
      .filter((c) => c.id !== excetoId && c.inicio <= fim && c.fim >= inicio)
      .flatMap((c) => c.itens.filter((i) => ids.includes(i.produtoId)).map((i) => ({ produtoNome: i.produtoNome, campanhaNome: c.nome, inicio: c.inicio, fim: c.fim })))
  }
}

describe('Datas e situação da promoção (horário de Manaus)', () => {
  it('vale das 00:00 do início às 23:59:59.999 do fim, em UTC−4', () => {
    expect(inicioDoDia('2026-11-10').toISOString()).toBe('2026-11-10T04:00:00.000Z')
    expect(fimDoDia('2026-11-17').toISOString()).toBe('2026-11-18T03:59:59.999Z')
  })

  it('converte o instante para a data de Manaus', () => {
    expect(dataManaus(new Date('2026-11-18T03:59:59.999Z'))).toBe('2026-11-17')
    expect(dataManaus(new Date('2026-11-18T04:00:00.000Z'))).toBe('2026-11-18')
  })

  it('é agendada antes, ativa no período e encerrada depois', () => {
    const periodo = { inicio: inicioDoDia('2026-11-10'), fim: fimDoDia('2026-11-17') }
    expect(situacaoPromocao(periodo, new Date('2026-11-10T03:59:59.999Z'))).toBe('agendada')
    expect(situacaoPromocao(periodo, new Date('2026-11-10T04:00:00.000Z'))).toBe('ativa')
    expect(situacaoPromocao(periodo, new Date('2026-11-18T03:59:59.999Z'))).toBe('ativa')
    expect(situacaoPromocao(periodo, new Date('2026-11-18T04:00:00.000Z'))).toBe('encerrada')
  })

  it('aceita período de um dia só e recusa fim antes do início ou data inválida', () => {
    expect(() => validarPeriodo('2026-11-10', '2026-11-10')).not.toThrow()
    expect(() => validarPeriodo('2026-11-10', '2026-11-09')).toThrow('antes da data de início')
    expect(() => validarPeriodo('2026-13-40', '2026-11-09')).toThrow('inválidas')
  })

  it('calcula desconto e formata datas', () => {
    expect(percentualDesconto(189.9, 159.9)).toBe(16)
    expect(percentualDesconto(0, 1)).toBe(0)
    expect(formatarData('2026-11-17')).toBe('17/11/2026')
  })
})

describe('SalvarPromocaoUseCase', () => {
  let repo: RepoEmMemoria
  let salvar: SalvarPromocaoUseCase
  const base = { nome: 'Semana do Gato', inicio: '2026-11-10', fim: '2026-11-17', itens: [{ produtoId: 'racao', valorPromocional: 159.9 }] }

  beforeEach(() => {
    repo = new RepoEmMemoria()
    salvar = new SalvarPromocaoUseCase(repo)
  })

  it('cria a campanha com o período no horário de Manaus', async () => {
    const p = await salvar.execute({ ...base, nome: '  Semana do Gato  ' })
    expect(p.nome).toBe('Semana do Gato')
    expect(p.inicio).toEqual(inicioDoDia('2026-11-10'))
    expect(p.fim).toEqual(fimDoDia('2026-11-17'))
  })

  it('recusa preço promocional igual ou maior que o normal, ou zero', async () => {
    await expect(salvar.execute({ ...base, itens: [{ produtoId: 'racao', valorPromocional: 189.9 }] })).rejects.toThrow('menor que o preço normal')
    await expect(salvar.execute({ ...base, itens: [{ produtoId: 'racao', valorPromocional: 0 }] })).rejects.toThrow('maior que zero')
  })

  it('aceita preço abaixo do custo (o aviso é na tela)', async () => {
    await expect(salvar.execute({ ...base, itens: [{ produtoId: 'racao', valorPromocional: 50 }] })).resolves.toBeTruthy()
  })

  it('recusa nome vazio, lista vazia, produto repetido e produto inexistente', async () => {
    await expect(salvar.execute({ ...base, nome: '   ' })).rejects.toThrow('nome')
    await expect(salvar.execute({ ...base, itens: [] })).rejects.toThrow('ao menos um produto')
    await expect(salvar.execute({ ...base, itens: [base.itens[0], base.itens[0]] })).rejects.toThrow('uma vez')
    await expect(salvar.execute({ ...base, itens: [{ produtoId: 'sumiu', valorPromocional: 1 }] })).rejects.toThrow('não encontrado')
  })

  it('recusa o mesmo produto em campanhas com datas sobrepostas e diz qual conflita', async () => {
    await salvar.execute(base)
    await expect(salvar.execute({ ...base, nome: 'Black Friday', inicio: '2026-11-17', fim: '2026-11-30' }))
      .rejects.toThrow('"Ração Golden 10kg" já está na promoção "Semana do Gato" (10/11/2026 a 17/11/2026)')
  })

  it('aceita o mesmo produto em períodos que não se tocam, e outro produto no mesmo período', async () => {
    await salvar.execute(base)
    await expect(salvar.execute({ ...base, nome: 'Depois', inicio: '2026-11-18', fim: '2026-11-30' })).resolves.toBeTruthy()
    await expect(salvar.execute({ ...base, nome: 'Sachê', itens: [{ produtoId: 'sache', valorPromocional: 2.99 }] })).resolves.toBeTruthy()
  })

  it('editar a própria campanha não conflita com ela mesma', async () => {
    const p = await salvar.execute(base)
    const editada = await salvar.execute({ ...base, fim: '2026-11-20', itens: [{ produtoId: 'racao', valorPromocional: 149.9 }] }, p.id)
    expect(editada.itens[0].valorPromocional).toBe(149.9)
    expect(repo.promocoes).toHaveLength(1)
  })

  it('editar campanha inexistente responde não encontrada', async () => {
    await expect(salvar.execute(base, 'nao-existe')).rejects.toThrow('Promoção não encontrada')
  })
})

describe('Encerrar e excluir', () => {
  const agora = new Date('2026-11-12T15:00:00.000Z')
  let repo: RepoEmMemoria

  async function criar(inicio: string, fim: string) {
    return new SalvarPromocaoUseCase(repo).execute({ nome: 'C', inicio, fim, itens: [{ produtoId: 'racao', valorPromocional: 150 }] })
  }

  beforeEach(() => { repo = new RepoEmMemoria() })

  it('encerrar agora leva o fim para o momento atual e a campanha passa a encerrada', async () => {
    const p = await criar('2026-11-10', '2026-11-17')
    const encerrada = await new EncerrarPromocaoUseCase(repo).execute(p.id, agora)
    expect(encerrada.fim).toEqual(agora)
    expect(situacaoPromocao(encerrada, new Date(agora.getTime() + 1))).toBe('encerrada')
  })

  it('não encerra campanha já encerrada nem inexistente', async () => {
    const p = await criar('2026-11-01', '2026-11-05')
    await expect(new EncerrarPromocaoUseCase(repo).execute(p.id, agora)).rejects.toThrow('já está encerrada')
    await expect(new EncerrarPromocaoUseCase(repo).execute('x', agora)).rejects.toThrow('não encontrada')
  })

  it('não exclui campanha ativa; exclui agendada ou encerrada', async () => {
    const ativa = await criar('2026-11-10', '2026-11-17')
    await expect(new ExcluirPromocaoUseCase(repo).execute(ativa.id, agora)).rejects.toThrow('Encerre a promoção')
    const agendada = await criar('2026-12-01', '2026-12-05')
    await new ExcluirPromocaoUseCase(repo).execute(agendada.id, agora)
    expect(await repo.buscar(agendada.id)).toBeNull()
    await expect(new ExcluirPromocaoUseCase(repo).execute('x', agora)).rejects.toThrow('não encontrada')
  })
})

describe('Resposta da API', () => {
  it('mostra datas de Manaus, situação e desconto por item', () => {
    const r = promocaoParaResposta({
      id: 'c1', nome: 'Semana', inicio: inicioDoDia('2026-11-10'), fim: fimDoDia('2026-11-17'),
      itens: [{ produtoId: 'racao', produtoNome: 'Ração', valorVenda: 189.9, valorCusto: 120, valorPromocional: 159.9 }],
    }, new Date('2026-11-12T12:00:00Z'))
    expect(r).toEqual({
      id: 'c1', nome: 'Semana', inicio: '2026-11-10', fim: '2026-11-17', situacao: 'ativa',
      itens: [{ produtoId: 'racao', nome: 'Ração', valorVenda: 189.9, valorCusto: 120, valorPromocional: 159.9, desconto: 16 }],
    })
  })
})
