# feature: Orçamentos — v6 (novo telefone oficial)

Revisão da [spec-v5](spec-v5.md). Tudo da v5 continua valendo.

## regras de negócio

- O telefone oficial da empresa nos dados do orçamento (`EMPRESA.telefone`) passa a ser (92) 98470-3686 (usuário, 02/11/2026). O PDF não imprime esse campo hoje
- A chave PIX continua (92) 98127-7831 até a loja confirmar a mudança, porque um PIX para a chave errada não se desfaz

## critérios de aceitação

- [ ] `EMPRESA.telefone` em `orcamento-pdf.ts` é (92) 98470-3686
- [ ] PDF do orçamento mantém a chave PIX (92) 98127-7831
