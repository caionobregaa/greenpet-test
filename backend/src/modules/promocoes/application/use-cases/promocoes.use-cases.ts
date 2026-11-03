import type { IPromocaoRepository, PromocaoRegistro } from '../../domain/promocao.repository.interface.js'
import { dataManaus, formatarData, situacaoPromocao, validarPeriodo } from '../../domain/promocao.js'
import { ConflictError } from '@/shared/errors/conflict.error.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { UnprocessableError } from '@/shared/errors/unprocessable.error.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

export interface EntradaPromocao {
  nome: string
  inicio: string
  fim: string
  itens: Array<{ produtoId: string; valorPromocional: number }>
}

/** Valida as regras de specs/promocoes/rules.md e cria ou substitui a campanha. */
export class SalvarPromocaoUseCase {
  constructor(private readonly repo: IPromocaoRepository) {}

  async execute(entrada: EntradaPromocao, id?: string): Promise<PromocaoRegistro> {
    if (id && !(await this.repo.buscar(id))) throw new NotFoundError('NOT_FOUND', 'Promoção não encontrada')

    const nome = entrada.nome.trim()
    if (!nome) throw new ValidationError('VALIDATION_ERROR', 'Informe o nome da promoção')
    const { inicio, fim } = validarPeriodo(entrada.inicio, entrada.fim)
    if (entrada.itens.length === 0) throw new ValidationError('VALIDATION_ERROR', 'Inclua ao menos um produto na promoção')

    const ids = entrada.itens.map((i) => i.produtoId)
    if (new Set(ids).size !== ids.length) {
      throw new ValidationError('VALIDATION_ERROR', 'Cada produto só pode aparecer uma vez na promoção')
    }

    const produtos = new Map((await this.repo.produtos(ids)).map((p) => [p.id, p]))
    for (const item of entrada.itens) {
      const produto = produtos.get(item.produtoId)
      if (!produto) throw new NotFoundError('NOT_FOUND', 'Produto da promoção não encontrado ou excluído')
      if (!(item.valorPromocional > 0)) {
        throw new ValidationError('VALIDATION_ERROR', `Preço promocional de "${produto.nome}" precisa ser maior que zero`)
      }
      if (item.valorPromocional >= produto.valorVenda) {
        throw new ValidationError(
          'VALIDATION_ERROR',
          `Preço promocional de "${produto.nome}" precisa ser menor que o preço normal`,
        )
      }
    }

    const [conflito] = await this.repo.conflitos(ids, inicio, fim, id)
    if (conflito) {
      throw new ConflictError(
        'PROMOCAO_CONFLITANTE',
        `"${conflito.produtoNome}" já está na promoção "${conflito.campanhaNome}" ` +
          `(${formatarData(dataManaus(conflito.inicio))} a ${formatarData(dataManaus(conflito.fim))})`,
      )
    }

    const dados = { nome, inicio, fim, itens: entrada.itens }
    return id ? this.repo.atualizar(id, dados) : this.repo.criar(dados)
  }
}

export class EncerrarPromocaoUseCase {
  constructor(private readonly repo: IPromocaoRepository) {}

  async execute(id: string, agora: Date = new Date()): Promise<PromocaoRegistro> {
    const promocao = await this.repo.buscar(id)
    if (!promocao) throw new NotFoundError('NOT_FOUND', 'Promoção não encontrada')
    if (situacaoPromocao(promocao, agora) === 'encerrada') {
      throw new UnprocessableError('PROMOCAO_ENCERRADA', 'Esta promoção já está encerrada')
    }
    return this.repo.alterarFim(id, agora)
  }
}

export class ExcluirPromocaoUseCase {
  constructor(private readonly repo: IPromocaoRepository) {}

  async execute(id: string, agora: Date = new Date()): Promise<void> {
    const promocao = await this.repo.buscar(id)
    if (!promocao) throw new NotFoundError('NOT_FOUND', 'Promoção não encontrada')
    if (situacaoPromocao(promocao, agora) === 'ativa') {
      throw new UnprocessableError('PROMOCAO_ATIVA', 'Encerre a promoção antes de excluir')
    }
    await this.repo.excluir(id)
  }
}
