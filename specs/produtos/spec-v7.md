# feature: Produtos — v7 (ocultar no catálogo oficial)

Revisão da [spec-v6](spec-v6.md). Tudo da v6 continua valendo. Ligação com [specs/catalogo/spec-v1.md](../catalogo/spec-v1.md).

## regras de negócio

- Novo campo `ocultarCatalogo` (booleano, padrão `false`): todo produto, atual ou novo, aparece no catálogo até ser marcado
- Ocultar afeta só o catálogo: o produto continua em vendas, orçamentos, compras e estoque
- Editar um produto sem enviar o campo mantém o valor salvo

## critérios de aceitação

- [ ] Cadastro tem a caixa "Ocultar produto no catálogo oficial", desmarcada por padrão
- [ ] Marcar ou desmarcar a caixa é gravado e aparece ao reabrir o produto
- [ ] Lista de produtos mostra o selo "Oculto no catálogo" nos produtos marcados
- [ ] Produto oculto continua nas buscas de venda e orçamento
- [ ] Editar outro campo não muda a marcação
- [ ] Migração adiciona só a coluna, sem apagar `produtos_nome_ativo_key` nem `venda_numero_seq`
