"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const cliente_entity_1 = require("../../../../src/modules/clientes/domain/entities/cliente.entity");
(0, vitest_1.describe)('Cliente entity', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('cria cliente com dados válidos mínimos', () => {
            const c = cliente_entity_1.Cliente.create({ nome: 'João Silva', telefone: '(92) 9 8765-4321' });
            (0, vitest_1.expect)(c.nome).toBe('João Silva');
            (0, vitest_1.expect)(c.telefone).toBe('(92) 9 8765-4321');
            (0, vitest_1.expect)(c.cidade).toBe('Manaus');
            (0, vitest_1.expect)(c.isActive).toBe(true);
        });
        (0, vitest_1.it)('aceita e-mail e CPF opcionais', () => {
            const c = cliente_entity_1.Cliente.create({
                nome: 'Maria',
                telefone: '(92) 3307-1000',
                email: 'maria@test.com',
                cpf: '529.982.247-25',
            });
            (0, vitest_1.expect)(c.email).toBe('maria@test.com');
            (0, vitest_1.expect)(c.cpf).toBe('529.982.247-25');
        });
        (0, vitest_1.it)('rejeita nome com menos de 3 caracteres', () => {
            (0, vitest_1.expect)(() => cliente_entity_1.Cliente.create({ nome: 'Ab', telefone: '(92) 9 8765-4321' })).toThrow('Nome deve ter ao menos 3 caracteres');
        });
        (0, vitest_1.it)('rejeita telefone inválido', () => {
            (0, vitest_1.expect)(() => cliente_entity_1.Cliente.create({ nome: 'João', telefone: '929876' })).toThrow('Telefone inválido');
        });
        (0, vitest_1.it)('rejeita e-mail inválido quando fornecido', () => {
            (0, vitest_1.expect)(() => cliente_entity_1.Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321', email: 'invalido' })).toThrow('E-mail inválido');
        });
        (0, vitest_1.it)('rejeita CPF inválido quando fornecido', () => {
            (0, vitest_1.expect)(() => cliente_entity_1.Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321', cpf: '111.111.111-11' })).toThrow('CPF inválido');
        });
        (0, vitest_1.it)('usa cidade Manaus como padrão', () => {
            const c = cliente_entity_1.Cliente.create({ nome: 'Ana', telefone: '(92) 9 1234-5678' });
            (0, vitest_1.expect)(c.cidade).toBe('Manaus');
        });
        (0, vitest_1.it)('numeroDeAnimais retorna 0 por padrão', () => {
            const c = cliente_entity_1.Cliente.create({ nome: 'Ana', telefone: '(92) 9 1234-5678' });
            (0, vitest_1.expect)(c.numeroDeAnimais).toBe(0);
        });
        (0, vitest_1.it)('numeroDeAnimais retorna valor passado no create', () => {
            const c = cliente_entity_1.Cliente.create({ nome: 'Ana', telefone: '(92) 9 1234-5678', numeroDeAnimais: 3 });
            (0, vitest_1.expect)(c.numeroDeAnimais).toBe(3);
        });
    });
    (0, vitest_1.describe)('softDelete', () => {
        (0, vitest_1.it)('marca deletedAt e isActive fica false', () => {
            const c = cliente_entity_1.Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' });
            c.softDelete();
            (0, vitest_1.expect)(c.isActive).toBe(false);
            (0, vitest_1.expect)(c.deletedAt).toBeDefined();
        });
        (0, vitest_1.it)('é idempotente - chamar duas vezes não muda o deletedAt', () => {
            const c = cliente_entity_1.Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' });
            c.softDelete();
            const first = c.deletedAt;
            c.softDelete();
            (0, vitest_1.expect)(c.deletedAt).toEqual(first);
        });
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('atualiza apenas os campos fornecidos', () => {
            const c = cliente_entity_1.Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' });
            c.update({ nome: 'João Atualizado' });
            (0, vitest_1.expect)(c.nome).toBe('João Atualizado');
            (0, vitest_1.expect)(c.telefone).toBe('(92) 9 8765-4321');
        });
        (0, vitest_1.it)('rejeita nome < 3 caracteres no update', () => {
            const c = cliente_entity_1.Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' });
            (0, vitest_1.expect)(() => c.update({ nome: 'Jo' })).toThrow('Nome deve ter ao menos 3 caracteres');
        });
    });
});
//# sourceMappingURL=cliente.entity.spec.js.map