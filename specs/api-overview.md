# GreenPET REST API — Visão Geral

## Contexto

API RESTful para o sistema de gestão GreenPET (pet shop). Substitui o mock de dados em `localStorage` do frontend HTML por um backend persistente e multi-usuário.

## Convenções Gerais

| Item | Definição |
|------|-----------|
| Base URL | `/api/v1` |
| Formato | `application/json` |
| Autenticação | JWT Bearer Token (`Authorization: Bearer <token>`) |
| Paginação | `?page=1&limit=20` |
| Datas | ISO 8601 — `YYYY-MM-DD` |
| Moeda | Número decimal em BRL — ex: `170.00` |
| IDs | UUID v4 gerados pelo servidor |
| Fuso | America/Manaus (UTC-4) |

## Domínios da API

| Domínio | Prefixo | Spec |
|---------|---------|------|
| Autenticação | `/auth` | [auth/spec-v1.md](auth/spec-v1.md) |
| Clientes | `/clientes` | [clientes/spec-v1.md](clientes/spec-v1.md) |
| Animais | `/animais` | [animais/spec-v1.md](animais/spec-v1.md) |
| Produtos | `/produtos` | [produtos/spec-v1.md](produtos/spec-v1.md) |
| Vendas | `/vendas` | [vendas/spec-v1.md](vendas/spec-v1.md) |
| Orçamentos | `/orcamentos` | [orcamentos/spec-v1.md](orcamentos/spec-v1.md) |
| Compras | `/compras` | [compras/spec-v1.md](compras/spec-v1.md) |
| Recompra | `/recompra` | [recompra/spec-v1.md](recompra/spec-v1.md) |
| Dashboard | `/dashboard` | [dashboard/spec-v1.md](dashboard/spec-v1.md) |

## Padrão de Resposta

### Sucesso
```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

### Erro
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo 'nome' é obrigatório.",
    "fields": { "nome": "required" }
  }
}
```

## Códigos HTTP

| Código | Uso |
|--------|-----|
| 200 | Sucesso (GET, PUT, PATCH) |
| 201 | Criado (POST) |
| 204 | Sem conteúdo (DELETE) |
| 400 | Requisição inválida / validação |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicidade) |
| 422 | Entidade não processável (regra de negócio) |
| 500 | Erro interno |

## Stack Sugerida

- **Runtime:** Node.js 20+
- **Framework:** Fastify ou Express
- **ORM:** Prisma
- **Banco:** PostgreSQL
- **Auth:** JWT + bcrypt
- **Validação:** Zod
- **Testes:** Vitest + Supertest
