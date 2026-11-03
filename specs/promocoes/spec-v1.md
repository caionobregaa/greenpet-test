# feature: Promoções — v1

Campanhas de preço promocional com data de início e fim. Os produtos são escolhidos no sistema. Durante a campanha, o preço promocional vale no site e nas vendas e orçamentos do sistema. Ao fim do período, o produto volta sozinho ao preço normal, sem nenhuma ação manual.

## requisitos funcionais

- Nova aba **Promoções** no sistema, com a lista de campanhas e a situação de cada uma: Agendada, Ativa ou Encerrada
- Criar e editar campanha: nome, data de início, data de fim e produtos, cada um com o preço promocional
- Ao incluir um produto, mostrar o preço normal, o custo, o desconto em % e a margem com o preço promocional
- Encerrar uma campanha antes do prazo e excluir uma campanha
- **Site:**
  - seção "Promoções" na página inicial, com os produtos em campanha ativa
  - filtro "Promoções" no catálogo
  - cartão com o preço normal riscado, o preço promocional e o selo de desconto
- **Sistema:**
  - Nova Venda e Orçamento sugerem o preço promocional enquanto a campanha está ativa
  - selo "Promoção" na busca de produtos e na lista de Produtos

## API

- `GET/POST /api/v1/promocoes`, `GET/PUT/DELETE /api/v1/promocoes/:id`, `POST /api/v1/promocoes/:id/encerrar` (com login)
- Respostas de produto (`/produtos`, `/produtos/:id`) ganham `promocao: { campanhaId, nome, valorPromocional, fim } | null`. Só vem preenchido com campanha ativa
- O catálogo público (`/catalogo/produtos`) ganha `valorOriginal` e `promocaoFim`. Com campanha ativa, `valorVenda` é o preço promocional; sem campanha, `valorOriginal` é `null`

## critérios de aceitação

- [ ] Campanha agendada não muda nenhum preço até a data de início
- [ ] No dia do início, o produto passa a mostrar o preço promocional no site e no sistema, e o selo aparece
- [ ] Depois do fim, o produto volta ao preço normal e sai da seção e do filtro de promoções, sem ação manual
- [ ] Nova Venda e Orçamento usam o preço promocional durante a campanha; o valor continua editável
- [ ] Vendas e orçamentos já registrados não mudam quando a campanha começa ou termina
- [ ] Um produto não pode estar em duas campanhas com períodos sobrepostos: o sistema recusa e diz qual campanha conflita
- [ ] Preço promocional maior ou igual ao preço normal é recusado
- [ ] Preço abaixo do custo é aceito, com aviso de margem negativa
- [ ] Encerrar agora tira os produtos da promoção na hora, no sistema, e em até 5 minutos no site
- [ ] Mensagem do WhatsApp do site leva o preço promocional
- [ ] Carrinho do site recalcula o total quando a promoção acaba

## fora de escopo

- Desconto por quantidade ("leve 3, pague 2"), cupons e frete promocional
- Promoção por categoria inteira ou por marca
- Agendar a mesma campanha para repetir sozinha
