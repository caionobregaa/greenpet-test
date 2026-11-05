# feature: Site público BEEZ PET — v5 (vitrine em faixas que deslizam)

Revisão da [spec-v4](spec-v4.md). Tudo da v4 continua valendo, com as mudanças abaixo (usuário, 04/11/2026).

## vitrine da página inicial

- Cada categoria vira uma **faixa horizontal** que o cliente arrasta para o lado (no computador, também com botões de seta)
- No máximo **7 produtos por categoria**, escolhidos ao acaso a cada visita
- A seleção mistura os mais baratos e os mais caros da categoria, alternando entre as duas metades da faixa de preço
- A seleção prioriza **marcas diferentes**; só repete marca quando não há mais marcas disponíveis
- Produtos com foto têm prioridade, quando há o bastante para preencher a faixa
- "Ver todos" continua levando ao catálogo filtrado pela categoria, que segue em grade com todos os produtos

## critérios de aceitação

- [ ] Até 7 produtos por categoria na página inicial
- [ ] Na mesma faixa, metade dos produtos vem da metade mais barata e metade da mais cara (diferença de no máximo 1)
- [ ] Marcas não se repetem enquanto houver marca diferente disponível
- [ ] A faixa rola para o lado sem criar rolagem lateral na página
- [ ] A seleção muda entre visitas
