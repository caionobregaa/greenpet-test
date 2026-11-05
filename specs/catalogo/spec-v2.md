# feature: Catálogo público — v2 (categorias adicionais, marca e Ração Úmida)

Revisão da [spec-v1](spec-v1.md). Tudo da v1 continua valendo.

## API

`GET /api/v1/catalogo/produtos` ganha dois campos públicos:

- `marca`: string ou null, usada na vitrine para variar as marcas
- `categorias`: categoria principal seguida das adicionais publicadas (specs/produtos/spec-v9.md), sem `Serviço`

## site

- O produto aparece em cada uma das suas categorias, no catálogo e na vitrine
- Ordem das seções: Ração, Ração Úmida, Petisco, Medicamento, Acessório, Higiene; categorias não previstas vêm depois
- O filtro de categoria considera a principal e as adicionais

## critérios de aceitação

- [ ] Produto com categoria adicional aparece nas duas seções do catálogo e no filtro das duas
- [ ] `marca` e `categorias` aparecem na resposta; continuam fora custo, margem, fornecedor e estoque
- [ ] Ração Úmida aparece logo depois de Ração
