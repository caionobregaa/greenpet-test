# feature: Produtos (v2 — Composição de Nome para Ração)

## contexto

Estende [spec-v1.md](spec-v1.md) (mantido como registro histórico, não sobrescrito).
Documenta 3 novos campos opcionais (`faseDaVida`, `porte`, `sabor`) e a composição
automática do campo `nome`, restrita a `categoria = "Ração"`. Demais requisitos/endpoints
de v1 continuam válidos e inalterados.

## requisitos (delta sobre v1)

- Produto ganha 3 campos novos, persistidos, opcionais e nullable: `faseDaVida`, `porte`,
  `sabor` — sem enum/validação estrita no backend (mesmo padrão de `subCategoria` hoje).
  Aceitos pelo backend para qualquer categoria; a restrição a "Ração" é só de UX no
  frontend.
- Quando `categoria = "Ração"`, o formulário compõe automaticamente `nome` a partir de:
  nome-base da ração (campo só de UI, não persistido) + Espécie + Fase da Vida + Porte +
  Sabor + Peso da Embalagem + Unidade.
- Para as demais categorias, `nome` permanece texto livre, comportamento inalterado.
- `nome` composto continua editável livremente pelo usuário depois — a composição é só
  uma conveniência de preenchimento inicial, nunca um valor travado.
- `categoria` NÃO entra na string composta — permanece campo normal, útil para
  filtro/busca, fora da fórmula.

## regra de composição (fórmula)

Aplicável somente quando `categoria === "Ração"` e o usuário preencheu "Nome da Ração":

```
[Nome da Ração] [Espécie] [Fase da Vida] PORTE [Porte] SABOR [Sabor] [Peso][Unidade]
```

- Cada segmento é opcional; se vazio, omite o segmento inteiro (inclusive o rótulo fixo
  PORTE/SABOR correspondente) — nunca gera rótulos soltos sem valor.
- `[Peso][Unidade]` só entra se ambos `pesoEmbalagem` e `unidadeEmbalagem` estiverem
  preenchidos, concatenados sem espaço (ex.: `"15kg"`).
- Exemplo: `"Golden Fórmula Cão Adulto PORTE Pequeno SABOR Frango e Arroz 15kg"`.
- Roda 100% no cliente; o backend recebe/armazena `nome` como string livre, sem
  conhecer/validar a fórmula.
- Editar um produto Ração já existente sem preencher "Nome da Ração" (campo só de UI,
  sempre inicia vazio, mesmo em edição) nunca reescreve o `nome` já salvo.

## escopo

Restrito a `categoria = "Ração"` para a experiência de composição no frontend. Os campos
`faseDaVida`/`porte`/`sabor` em si são aceitos pelo backend para qualquer categoria (sem
restrição de schema), mas só Ração exibe os campos e monta o nome automaticamente hoje.

## endpoints (delta sobre v1)

### POST /produtos — request (Ração, exemplo)

```json
{
  "nome": "Golden Fórmula Cão Adulto PORTE Pequeno SABOR Frango e Arroz 15kg",
  "categoria": "Ração",
  "especie": "Cão",
  "subCategoria": "Seca",
  "faseDaVida": "Adulto",
  "porte": "Pequeno",
  "sabor": "Frango e Arroz",
  "marca": "Golden",
  "fornecedor": "Basso Pancotte",
  "pesoEmbalagem": 15,
  "unidadeEmbalagem": "kg",
  "valorCusto": 88.38,
  "valorVenda": 140.00
}
```

### GET /produtos — response (delta)

Cada item ganha `"faseDaVida"`, `"porte"`, `"sabor"` (string ou `null`, mesmo padrão de
`subCategoria`/`marca`/`fornecedor`), para qualquer categoria.

## critérios de aceitação (delta sobre v1)

- [ ] Backend aceita/persiste `faseDaVida`/`porte`/`sabor` para qualquer categoria
- [ ] Produto Ração com espécie+faseDaVida+porte+sabor+peso+unidade preenchidos gera
      `nome` seguindo a fórmula exata, na ordem definida
- [ ] Segmento vazio (Espécie, Fase da Vida, Porte ou Sabor em branco) é omitido do nome
      composto, sem espaços duplicados nem rótulos soltos
- [ ] `[Peso][Unidade]` só aparece quando ambos estão preenchidos
- [ ] GET /produtos e GET /produtos/:id retornam `faseDaVida`/`porte`/`sabor` (ou `null`)
- [ ] Editar produto Ração existente sem preencher "Nome da Ração" (UI) não sobrescreve o
      nome já salvo
- [ ] Usuário consegue editar `nome` manualmente após a composição automática, e o valor
      editado é o persistido
- [ ] Produto de categoria diferente de Ração não exibe os campos novos nem monta nome
      automaticamente

## casos de erro

Sem casos novos — campos opcionais, sem validação de formato.

| Situação | HTTP | Código |
|----------|------|--------|
| Nome duplicado | 409 | `NOME_ALREADY_EXISTS` |

## fora de escopo (v2)

- Enum/validação estrita de `faseDaVida`/`porte`/`sabor` no backend
- Parsing retroativo do `nome` legado de produtos Ração já existentes
- Composição de nome para outras categorias
- Inclusão de `categoria` na string composta
- Formatação regional (pt-BR) do peso na string composta (ex.: `2,5kg` em vez de `2.5kg`)
