# Melhorias do Sistema GreenPET — Backend

> Análise técnica do estado atual do projeto. Nenhum código foi modificado.

---

## 1. Segurança

### 1.1 Senha admin exposta em log (CRÍTICO)
- **Arquivo**: `backend/prisma/seed.ts` — linha 21
- **Problema**: `console.log('✅ Usuário admin criado: admin@greenpet.com / admin123')` imprime a senha em texto claro nos logs de execução.
- **Ação**: Remover a senha do log; gerar senha aleatória ou lê-la via variável de ambiente.

### 1.2 Rate limiting ausente no login (CRÍTICO)
- **Arquivo**: `backend/src/shared/infrastructure/http/fastify-app.ts`
- **Problema**: Nenhum limite de tentativas na rota `/api/v1/auth/login`. Sujeito a ataques de força bruta.
- **Ação**: Instalar `@fastify/rate-limit` e aplicar limite restritivo (ex: 5 tentativas / 15 min) na rota de login.

### 1.3 CORS permissivo (`origin: true`)
- **Arquivo**: `backend/src/shared/infrastructure/http/fastify-app.ts` — linha 15
- **Problema**: Qualquer origem pode fazer requisições à API, abrindo espaço para CSRF.
- **Ação**: Restringir a domínios conhecidos via variável `ALLOWED_ORIGINS` no `.env`.

### 1.4 Helmet ausente — headers de segurança HTTP faltando
- **Arquivo**: `backend/src/shared/infrastructure/http/fastify-app.ts`
- **Problema**: Nenhum plugin `@fastify/helmet` configurado. Headers como `X-Frame-Options`, `Content-Security-Policy` e `Strict-Transport-Security` não são enviados.
- **Ação**: Instalar e registrar `@fastify/helmet`.

### 1.5 JwtService implementado manualmente (redundante)
- **Arquivo**: `backend/src/modules/auth/infrastructure/services/jwt.service.ts`
- **Problema**: A aplicação já usa `@fastify/jwt` (declarado em `package.json`), mas também mantém um serviço JWT manual. Duplicidade aumenta superfície de falha.
- **Ação**: Remover o serviço manual e usar exclusivamente `@fastify/jwt`.

### 1.6 Credenciais do banco de dados com valores fracos
- **Arquivo**: `backend/.env` (não versionado) e `backend/.env.example`
- **Problema**: Senhas de desenvolvimento `greenpet_dev_pass` e `greenpet_test_pass` são triviais.
- **Ação**: Usar senhas aleatórias longas mesmo em desenvolvimento; usar secrets manager em produção.

---

## 2. Testes

### 2.1 Nenhum teste de integração implementado
- **Diretório**: `backend/tests/integration/` — vazio
- **Problema**: O arquivo `vitest.integration.config.ts` existe e o Docker de teste está configurado (`docker-compose.test.yml`), mas nenhum teste de integração foi criado.
- **Impacto**: Comportamento real das rotas HTTP, banco de dados e middlewares nunca é validado automaticamente.
- **Ação**: Criar testes de integração para ao menos os módulos críticos: `auth`, `clientes`, `vendas`.

### 2.2 Módulos sem qualquer teste de use case
Os módulos abaixo têm use cases implementados mas sem cobertura de testes unitários:

| Módulo | Use Cases presentes | Testes |
|---|---|---|
| `produtos` | CRUD | Nenhum |
| `vendas` | CRUD | Nenhum |
| `orcamentos` | CRUD + converter | Nenhum |
| `compras` | CRUD + updateStatus | Nenhum |
| `recompra` | listAlertas | Nenhum |
| `dashboard` | getKPIs | Nenhum |

### 2.3 Casos de erro pouco cobertos
- **Exemplo**: `tests/unit/modules/auth/login.use-case.spec.ts` não testa refresh token expirado, payload vazio, ou senha com hash corrompido.
- **Ação**: Adicionar cenários negativos em todos os specs existentes.

### 2.4 Nenhum teste de repositório Prisma
- **Problema**: Queries com joins, filtros dinâmicos e paginação nos repositórios Prisma nunca são testadas.
- **Ação**: Criar testes de repositório conectando ao banco de testes (requer Docker test DB).

---

## 3. Arquitetura DDD

### 3.1 Módulo `recompra` sem entidade nem interface de repositório
- **Diretório**: `backend/src/modules/recompra/`
- **Problema**: O módulo não tem `domain/entities/`, nem `domain/repositories/` interface. A lógica de negócio (`classifyUrgency`, `calcDiasRestantes`) está dentro do repositório Prisma, violando a separação entre domínio e infraestrutura.
- **Ação**: Criar entidade `RecompraAlerta` no domínio e extrair a lógica de classificação para value objects.

### 3.2 Módulo `dashboard` sem use case
- **Diretório**: `backend/src/modules/dashboard/`
- **Problema**: O controller chama o repositório diretamente, sem passar por um use case. Viola o padrão adotado nos outros módulos.
- **Ação**: Criar `GetDashboardKpisUseCase` como wrapper de orquestração.

### 3.3 Inconsistência no padrão de routes/controllers
- **Problema**: Alguns módulos usam classes Controller com injeção de dependência (`clientes`, `animais`, `auth`); outros usam route factories diretas (`produtos`, `vendas`, `orcamentos`). O projeto não tem padrão único.
- **Ação**: Padronizar todos os módulos no estilo de Controller com injeção de use case.

### 3.4 Módulo `vendas` sem use case de atualização
- **Diretório**: `backend/src/modules/vendas/application/use-cases/`
- **Problema**: Não existe `update-venda.use-case.ts`. Vendas não podem ser editadas após criação.
- **Ação**: Implementar o use case de atualização (com validação de status permitido para edição).

---

## 4. Validação e Tratamento de Erros

### 4.1 Erros de validação sem indicar o campo inválido
- **Arquivo**: `backend/src/shared/infrastructure/http/error-handler.ts` — linha 20–29
- **Problema**: Erros Zod são retornados genericamente, sem indicar qual campo falhou.
- **Ação**: Mapear `error.validation` para um campo `fields` estruturado na resposta de erro.

### 4.2 CPF validado apenas por formato, não por dígito verificador
- **Arquivo**: `backend/src/modules/clientes/infrastructure/http/clientes.schema.ts`
- **Problema**: A regex `/^\d{3}\.\d{3}\.\d{3}-\d{2}$/` aceita CPFs com formato correto mas numericamente inválidos (ex: `111.111.111-11`).
- **Ação**: Adicionar validação do algoritmo de dígito verificador do CPF.

### 4.3 Paginação sem limite seguro
- **Arquivo**: `backend/src/modules/clientes/infrastructure/http/clientes.schema.ts` — linha 18–22
- **Problema**: `max(100)` permite até 100 registros por página, podendo sobrecarregar o banco em tabelas grandes.
- **Ação**: Reduzir para `max(50)` e adicionar validação no repositório.

---

## 5. Performance

### 5.1 N+1 em `GetClienteDetailUseCase`
- **Arquivo**: `backend/src/modules/clientes/application/use-cases/get-cliente-detail.use-case.ts`
- **Problema**: O use case chama 3 repositórios separados (cliente, animais, vendas), gerando 3+ queries independentes por requisição.
- **Ação**: Consolidar em uma única query Prisma com `include` ou criar método dedicado no repositório.

### 5.2 Módulo `recompra` pagina em memória
- **Arquivo**: `backend/src/modules/recompra/infrastructure/repositories/prisma-recompra.repository.ts` — linhas 72–85
- **Problema**: O repositório busca **todos** os `VendaItem` do banco, aplica filtros e paginação em memória com `.filter()` e `.slice()`. Com volume alto de dados, isso carrega a memória do processo Node.js desnecessariamente.
- **Ação**: Mover filtros e paginação para a query Prisma.

### 5.3 Ausência de índices de banco de dados
- **Arquivo**: `backend/prisma/schema.prisma`
- **Problema**: Queries frequentes como buscas por `data` em `Venda`, por `clienteId` e por `produtoId` em `VendaItem` não têm índices declarados.
- **Ação**: Adicionar `@@index` nas colunas de filtro e join mais utilizadas.

### 5.4 Busca textual por `nome` sem suporte a full-text search
- **Arquivo**: `backend/src/modules/clientes/infrastructure/repositories/prisma-cliente.repository.ts` — linha 31
- **Problema**: `contains` com `mode: 'insensitive'` não usa índice, resultando em full table scan no PostgreSQL.
- **Ação**: Adicionar índice em `Clientes.nome` ou migrar para `tsvector` (full-text search nativo do PostgreSQL) quando o volume crescer.

---

## 6. API e Documentação

### 6.1 Sem documentação OpenAPI/Swagger
- **Problema**: Nenhuma spec formal da API é gerada. Clientes (frontend, mobile, terceiros) dependem de documentação manual.
- **Ação**: Instalar `@fastify/swagger` + `@fastify/swagger-ui` e gerar spec OpenAPI 3.0 a partir dos schemas Zod existentes.

### 6.2 Arquivo `.env.test` ausente
- **Arquivo**: `backend/vitest.integration.config.ts`
- **Problema**: O `globalSetup` referencia `.env.test`, mas o arquivo não existe no repositório.
- **Ação**: Criar `backend/.env.test` com valores de teste e adicionar ao `.gitignore`.

---

## 7. Resumo Priorizado

| Prioridade | Área | Problema | Esforço |
|---|---|---|---|
| Crítico | Segurança | Senha admin em `console.log` (`seed.ts:21`) | 5 min |
| Crítico | Segurança | Rate limiting ausente no endpoint de login | 30 min |
| Alto | Segurança | CORS permissivo (`origin: true`) | 10 min |
| Alto | Segurança | Helmet ausente | 20 min |
| Alto | Testes | Nenhum teste de integração | 4–8 h |
| Alto | DDD | `recompra` sem entidade de domínio | 2 h |
| Alto | Domínios | `vendas` sem use case de atualização | 2 h |
| Médio | Performance | N+1 em `GetClienteDetail` | 1 h |
| Médio | Performance | Paginação em memória no módulo `recompra` | 1 h |
| Médio | DDD | `dashboard` sem use case | 1 h |
| Médio | Validação | CPF sem validação de dígito verificador | 1 h |
| Baixo | API | Documentação OpenAPI/Swagger | 2 h |
| Baixo | Testes | Use cases sem cobertura (produtos, orcamentos, compras) | 4 h |
| Baixo | Arquitetura | Inconsistência entre Controllers e route factories | 3 h |
