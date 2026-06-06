import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CreateAnimalUseCase } from '../../application/use-cases/create-animal.use-case.js';
import type { UpdateAnimalUseCase } from '../../application/use-cases/update-animal.use-case.js';
import type { DeleteAnimalUseCase } from '../../application/use-cases/delete-animal.use-case.js';
import type { GetAnimalUseCase } from '../../application/use-cases/get-animal.use-case.js';
import type { ListAnimaisUseCase } from '../../application/use-cases/list-animais.use-case.js';
export declare class AnimaisController {
    private readonly createUseCase;
    private readonly updateUseCase;
    private readonly deleteUseCase;
    private readonly getUseCase;
    private readonly listUseCase;
    constructor(createUseCase: CreateAnimalUseCase, updateUseCase: UpdateAnimalUseCase, deleteUseCase: DeleteAnimalUseCase, getUseCase: GetAnimalUseCase, listUseCase: ListAnimaisUseCase);
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
//# sourceMappingURL=animais.controller.d.ts.map