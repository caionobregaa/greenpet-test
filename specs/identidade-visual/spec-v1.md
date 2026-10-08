# feature: Identidade visual BEEZ PET — v1

Aplicação da nova identidade (out/2026) em todo o sistema: login, navegação, telas, gráficos, selos de status e PDF do orçamento.

## paleta oficial

| Token | Cor | Uso |
|---|---|---|
| Vinho | `#641d3f` | cor primária: sidebar, botões, títulos, destaques |
| Amarelo-manteiga | `#ffed8e` | destaque sobre o vinho (item ativo, CTA, logo) |
| Rosa | `#ffc9d0` | detalhes delicados (hover, fundos de destaque, chips) |
| Creme | `#fffefd` | papel: cartões, superfícies |

Derivados (tons para contraste e estados) ficam em `frontend/src/app/globals.css`. Cores semânticas de status (verde = concluído, âmbar = atenção, vermelho = erro) e o verde do WhatsApp são mantidos por legibilidade.

## tipografia

- Títulos e display: **Fraunces** (serifada suave/retrô, conversa com a palavra "beezpet")
- Texto e interface: **Sora**
- Números/código: **JetBrains Mono**

## assets (`frontend/public/brand`)

- `logo-beezpet.png`: logo redonda (cachorro + palavra) sobre vinho
- `mascote.png`: mascote sentado em círculo vinho (ícone do app, sidebar recolhida)
- `wordmark-amarelo.png` / `wordmark-vinho.png`: palavra "beezpet" transparente
- `mascote-caixas.webp`: mascote com caixas, **sempre sobre fundo `#641d3f`** (as manchas do cachorro têm a mesma cor do fundo da arte)
- `src/app/icon.png` / `apple-icon.png`: favicon e ícone iOS

## critérios de aceitação

- [ ] Nenhuma cor da identidade antiga (verde "Forest Atelier" / teal) nas telas
- [ ] Login com a ilustração do mascote, a palavra "beezpet" e a paleta nova
- [ ] Sidebar vinho com a logo; item ativo em amarelo-manteiga
- [ ] Gráficos e selos nas cores da marca
- [ ] PDF do orçamento com cabeçalho e destaques em vinho
- [ ] Favicon com o mascote
