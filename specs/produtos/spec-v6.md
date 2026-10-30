# feature: Produtos — v6 (Market/Prime é MARKET)

Revisão da [spec-v5](spec-v5.md). Tudo da v5 continua valendo. A lista oficial não muda.

## regras de negócio

- `Market/Prime` é a distribuidora `MARKET` (usuário, 30/10/2026). A comparação segue a v5: ignora maiúscula, acento, espaço e pontuação (`Market Prime`, `MARKET / PRIME`)
- Nada mudou para `PRIME` nem para `MARKET`, que continuam separadas

## critérios de aceitação

- [ ] Ao salvar produto ou compra `Produtos Pets` com `Market/Prime`, grava `MARKET`
- [ ] Migração passa `Market/Prime` para `MARKET` em produtos (inclusive excluídos) e compras `Produtos Pets`, sem mexer em outras categorias
- [ ] `Market/Prime` salva no navegador não gera opção na lista
