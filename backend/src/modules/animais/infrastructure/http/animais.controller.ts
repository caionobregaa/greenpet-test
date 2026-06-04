import type { FastifyRequest, FastifyReply } from 'fastify'
import type { CreateAnimalUseCase } from '../../application/use-cases/create-animal.use-case.js'
import type { UpdateAnimalUseCase } from '../../application/use-cases/update-animal.use-case.js'
import type { DeleteAnimalUseCase } from '../../application/use-cases/delete-animal.use-case.js'
import type { GetAnimalUseCase } from '../../application/use-cases/get-animal.use-case.js'
import type { ListAnimaisUseCase } from '../../application/use-cases/list-animais.use-case.js'
import { CreateAnimalSchema, UpdateAnimalSchema, ListAnimaisQuerySchema } from './animais.schema.js'
import { ValidationError } from '@/shared/errors/validation.error.js'
import type { Animal } from '../../domain/entities/animal.entity.js'

function toResponse(a: Animal, clienteNome?: string) {
  return {
    id: a.id,
    nome: a.nome,
    clienteId: a.clienteId,
    cliente: clienteNome ? { nome: clienteNome } : undefined,
    especie: a.especie,
    raca: a.raca,
    sexo: a.sexo,
    nascimento: a.nascimento,
    peso: a.peso,
    obs: a.obs,
    idadeCalculada: a.idadeCalculada,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }
}

export class AnimaisController {
  constructor(
    private readonly createUseCase: CreateAnimalUseCase,
    private readonly updateUseCase: UpdateAnimalUseCase,
    private readonly deleteUseCase: DeleteAnimalUseCase,
    private readonly getUseCase: GetAnimalUseCase,
    private readonly listUseCase: ListAnimaisUseCase,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = CreateAnimalSchema.safeParse(request.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const animal = await this.createUseCase.execute(body.data)
    reply.status(201).send({ data: toResponse(animal) })
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = ListAnimaisQuerySchema.safeParse(request.query)
    if (!query.success) throw new ValidationError('VALIDATION_ERROR', query.error.errors[0].message)
    const result = await this.listUseCase.execute(query.data)
    reply.status(200).send({
      data: result.animais.map((a) => toResponse(a, result.clienteNomes[a.id])),
      meta: { page: query.data.page, limit: query.data.limit, total: result.total },
    })
  }

  async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const animal = await this.getUseCase.execute({ id: request.params.id })
    reply.status(200).send({ data: toResponse(animal) })
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const body = UpdateAnimalSchema.safeParse(request.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const animal = await this.updateUseCase.execute({ id: request.params.id, ...body.data })
    reply.status(200).send({ data: toResponse(animal) })
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    await this.deleteUseCase.execute({ id: request.params.id })
    reply.status(204).send()
  }
}
