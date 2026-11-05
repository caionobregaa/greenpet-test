# feature: Produtos — v9 (Ração Úmida, categorias adicionais, Fórmula Natural e filtro de ocultos)

Revisão da [spec-v8](spec-v8.md). Tudo da v8 continua valendo (usuário, 04/11/2026).

## Ração Úmida

- Nova categoria `Ração Úmida`, com SKU `RUM-0001`, `RUM-0002`… (sequence própria)
- Comporta-se como `Ração` no sistema:
  - composição do nome no cadastro
  - duração da embalagem por peso e consumo diário na venda, que alimenta a recompra
- Migração: rações (categoria `Ração`) com "Úmida", "Lata" ou "Sachê" no nome passam para `Ração Úmida`. O SKU antigo (`RAC-…`) é mantido

## Categorias adicionais

- O produto continua com uma **categoria principal**, usada no SKU, nos relatórios, nas margens e na curva de venda
- Novo campo `categoriasAdicionais` (lista, padrão vazia): o produto também aparece nessas categorias no site e no filtro de categoria do sistema
- A lista é normalizada ao salvar: sem repetições, sem a categoria principal e só com categorias válidas

## Fórmula Natural

- Em rações (`Ração` e `Ração Úmida`), a sigla "FN" como palavra isolada no nome vira "Fórmula Natural", ao criar e ao editar
- Migração: aplica a troca nos nomes atuais. Também troca a marca escrita só como "FN". Se o nome novo já existir em outro produto ativo, aquele produto fica como está, para não duplicar nomes
- Vendas e orçamentos já registrados guardam o nome da época e não mudam

## Filtro de ocultos

- Lista de Produtos ganha o botão **"Ocultos no site"**, que mostra só os produtos marcados com "Ocultar produto no catálogo oficial"
- API: `GET /api/v1/produtos?ocultos=true`

## critérios de aceitação

- [ ] Cadastrar produto em Ração Úmida gera SKU `RUM-…`
- [ ] Ração Úmida mostra a composição do nome no cadastro e calcula a duração na venda, como Ração
- [ ] A migração move para Ração Úmida as rações com Úmida, Lata ou Sachê no nome
- [ ] Produto com categoria adicional aparece no filtro dessa categoria no sistema e no site
- [ ] Relatórios continuam usando só a categoria principal
- [ ] "FN Fresh Meat…" vira "Fórmula Natural Fresh Meat…", na migração e em novos cadastros; "FNX" ou "Fnatural" não mudam
- [ ] O botão "Ocultos no site" lista só os produtos ocultos e pode ser desligado
