# feature: Produtos — v5 (lista oficial de distribuidoras)

Revisão da [spec-v4](spec-v4.md). Tudo da v4 continua valendo. Esta versão define a lista oficial de distribuidoras e une os nomes repetidos em um só, em produtos e em compras.

## lista oficial (usuário, 30/10/2026)

`PRIME` · `ZOOCENTER` · `MARKET` · `PETZ` · `DUNORTE` · `AMAZON` · `BASSO PANCOTTE` · `AGROMINAS` · `LATIDUS` · `CENTRAL PEC`

## requisitos

- A lista de opções de distribuidora (cadastro de produto e filtros de Produtos e Estoque) mostra só um nome para cada distribuidora
- Nomes repetidos já gravados passam para o nome oficial, sem perder produto nem compra
- Ao salvar um produto ou uma compra com uma variação do nome, o sistema grava o nome oficial, para o repetido não voltar

## regras de negócio

- Duas grafias são a mesma distribuidora quando ficam iguais depois de ignorar maiúscula, acento, espaço e pontuação. Mais estas variações:
  - `BASSO PANCOTTE`: também `Basso`, `Basso Pacotte` e `Basso e Pancotte`
  - `DUNORTE`: qualquer nome que contenha `dunort` (regra da migração de 13/06/2026)
- **Só essas variações são unidas.** Nome parecido com outra grafia (ex. `Amazon Prime`, `Zoo Centr`) não é alterado: continua como está e aparece como uma distribuidora própria
- Em **compras**, só a categoria `Produtos Pets` é normalizada: nas outras, o campo é "Fonte / Referência" e não é uma distribuidora ([bi-avancado/spec-v2](../bi-avancado/spec-v2.md))
- Produtos excluídos (soft delete) também são normalizados
- Distribuidora nova adicionada pelo "+" do cadastro continua permitida; se for variação de uma oficial, vira a oficial
- Distribuidoras salvas no navegador (`localStorage`) são normalizadas ao carregar e não geram opção repetida

## critérios de aceitação

- [ ] Backend: `zoo center`, `Zoo Center` e `ZOOCENTER` viram `ZOOCENTER` ao salvar produto (criar e editar) e compra `Produtos Pets` (criar e editar)
- [ ] Compra de outra categoria mantém o texto digitado
- [ ] Nome fora das variações não é alterado
- [ ] Migração une as variações em produtos (inclusive excluídos) e compras `Produtos Pets`, sem mexer em outras categorias nem em nomes desconhecidos
- [ ] Lista de opções mostra as 10 oficiais, sem repetir variações salvas no navegador
- [ ] Cadastro de produto: adicionar variação de uma oficial seleciona a oficial

## fora de escopo

- Trocar o campo de texto de "Fornecedor" da tela de compras por uma lista de seleção
- Unir nomes com erro de digitação fora das variações acima
