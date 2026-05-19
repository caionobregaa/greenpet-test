import type { FastifyRequest, FastifyReply } from 'fastify'
import type { CreateClienteUseCase } from '../../application/use-cases/create-cliente.use-case.js'
import type { UpdateClienteUseCase } from '../../application/use-cases/update-cliente.use-case.js'
import type { DeleteClienteUseCase } from '../../application/use-cases/delete-cliente.use-case.js'
import type { GetClienteDetailUseCase } from '../../application/use-cases/get-cliente-detail.use-case.js'
import type { ListClientesUseCase } from '../../application/use-cases/list-clientes.use-case.js'
import {
  CreateClienteSchema,
  UpdateClienteSchema,
  ListClientesQuerySchema,
} from './clientes.schema.js'
import { ValidationError } from '@/shared/errors/validation.error.js'
import type { Cliente } from '../../domain/entities/cliente.entity.js'
import type { Animal } from '@/modules/animais/domain/entities/animal.entity.js'
import type { Venda } from '@/modules/vendas/domain/entities/venda.entity.js'

function toResponse(c: Cliente) {
  return {
    id: c.id,
    nome: c.nome,
    telefone: c.telefone,
    email: c.email,
    cpf: c.cpf,
    endereco: c.endereco,
    bairro: c.bairro,
    cidade: c.cidade,
    obs: c.obs,
    numeroDeAnimais: c.numeroDeAnimais,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

function animalToResponse(a: Animal) {
  return {
    id: a.id,
    nome: a.nome,
    especie: a.especie,
    raca: a.raca,
    sexo: a.sexo,
    nascimento: a.nascimento,
    peso: a.peso,
  }
}

function vendaToResponse(v: Venda) {
  return {
    id: v.id,
    data: v.data,
    formaPag: v.formaPag,
    total: v.total,
    animalId: v.animalId,
    obs: v.obs,
  }
}

export class ClientesController {
  constructor(
    private readonly createUseCase: CreateClienteUseCase,
    private readonly updateUseCase: UpdateClienteUseCase,
    private readonly deleteUseCase: DeleteClienteUseCase,
    private readonly getDetailUseCase: GetClienteDetailUseCase,
    private readonly listUseCase: ListClientesUseCase,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = CreateClienteSchema.safeParse(request.body)
    if (!body.success) {
      throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    }
    const cliente = await this.createUseCase.execute(body.data)
    reply.status(201).send({ data: toResponse(cliente) })
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = ListClientesQuerySchema.safeParse(request.query)
    if (!query.success) {
      throw new ValidationError('VALIDATION_ERROR', query.error.errors[0].message)
    }
    const result = await this.listUseCase.execute(query.data)
    reply.status(200).send({
      data: result.clientes.map(toResponse),
      meta: { page: query.data.page, limit: query.data.limit, total: result.total },
    })
  }

  async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const { cliente, animais, vendas } = await this.getDetailUseCase.execute({ id: request.params.id })
    reply.status(200).send({
      data: {
        ...toResponse(cliente),
        animais: animais.map(animalToResponse),
        vendas: vendas.map(vendaToResponse),
      },
    })
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const body = UpdateClienteSchema.safeParse(request.body)
    if (!body.success) {
      throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    }
    const cliente = await this.updateUseCase.execute({ id: request.params.id, ...body.data })
    reply.status(200).send({ data: toResponse(cliente) })
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    await this.deleteUseCase.execute({ id: request.params.id })
    reply.status(204).send()
  }
}
