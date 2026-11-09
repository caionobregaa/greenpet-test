# feature: Produtos — v10 (nome da ração na edição e SKU RUM para rações úmidas antigas)

Revisão da [spec-v9](spec-v9.md). Tudo da v9 continua valendo (usuário, 09/11/2026).

## problema

Ao editar uma ração, o campo "Nome da Ração" abria vazio. Mudar o sabor, por exemplo, salvava o campo Sabor, mas o nome continuava com o sabor antigo, e a lista e o site mostravam o nome desatualizado.

## regras

- Na edição de `Ração` e `Ração Úmida`, "Nome da Ração" abre com a parte fixa do nome atual, sem peso, porte, sabor, espécie e fase
- O nome só é remontado depois que algum campo da composição muda; abrir e salvar sem mexer na composição não altera o nome
- Quando o nome salvo difere do nome montado com os campos atuais, o cadastro mostra o nome montado e o botão "Usar nome montado"
- Migração: as rações RAC-0175, RAC-0055, RAC-0054, RAC-0053, RAC-0051, RAC-0052 e RAC-0131 passam para `Ração Úmida`, com SKU novo da sequência `RUM-…`, na ordem do SKU antigo (pedido do usuário)

## critérios de aceitação

- [ ] Editar o sabor de uma ração com nome composto atualiza o nome ao salvar
- [ ] Abrir e salvar uma ração sem mexer na composição mantém o nome
- [ ] Ração com nome desatualizado mostra o nome montado e o botão que o aplica
- [ ] Os sete SKUs listados viram `RUM-…` e ficam em `Ração Úmida`; vendas, orçamentos e estoque continuam ligados ao produto
