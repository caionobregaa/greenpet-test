# feature: Orçamentos — v7 (chave PIX é o CNPJ)

Revisão da [spec-v6](spec-v6.md). Tudo da v6 continua valendo, menos a chave PIX.

## regras de negócio

- A chave PIX da empresa é o CNPJ 65.788.498/0001-44 (usuário, 03/11/2026)
- O PDF mostra a chave formatada e indica que é um CNPJ, no lugar de "(mesmo número do WhatsApp)"

## critérios de aceitação

- [ ] PDF do orçamento mostra a chave PIX 65.788.498/0001-44 com a legenda "(chave CNPJ)"
- [ ] O número de telefone antigo não aparece mais no PDF
