import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CreateClienteUseCase } from '../../application/use-cases/create-cliente.use-case.js';
import type { UpdateClienteUseCase } from '../../application/use-cases/update-cliente.use-case.js';
import type { DeleteClienteUseCase } from '../../application/use-cases/delete-cliente.use-case.js';
import type { GetClienteDetailUseCase } from '../../application/use-cases/get-cliente-detail.use-case.js';
import type { ListClientesUseCase } from '../../application/use-cases/list-clientes.use-case.js';
export declare class ClientesController {
    private readonly createUseCase;
    private readonly updateUseCase;
    private readonly deleteUseCase;
    private readonly getDetailUseCase;
    private readonly listUseCase;
    constructor(createUseCase: CreateClienteUseCase, updateUseCase: UpdateClienteUseCase, deleteUseCase: DeleteClienteUseCase, getDetailUseCase: GetClienteDetailUseCase, listUseCase: ListClientesUseCase);
    create(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    list(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getOne(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    update(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    delete(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=clientes.controller.d.ts.map