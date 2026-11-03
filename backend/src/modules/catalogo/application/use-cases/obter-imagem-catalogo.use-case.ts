import type { ICatalogoRepository } from '../../domain/catalogo.repository.interface.js'
import { interpretarImagem, type ImagemCatalogo } from '../../domain/catalogo-imagem.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class ObterImagemCatalogoUseCase {
  constructor(private readonly repo: ICatalogoRepository) {}

  async execute(id: string): Promise<ImagemCatalogo> {
    const valor = await this.repo.buscarImagem(id)
    const imagem = valor ? interpretarImagem(valor) : null
    if (!imagem) throw new NotFoundError('NOT_FOUND', 'Imagem não encontrada')
    return imagem
  }
}
