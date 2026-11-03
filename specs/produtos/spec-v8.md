# feature: Produtos — v8 (peso e estoque mínimo opcionais de verdade)

Revisão da [spec-v7](spec-v7.md). Tudo da v7 continua valendo.

## problema

Com "Quantidade / Peso da Embalagem" ou "Estoque Mínimo" vazios, o formulário não salvava e não mostrava nenhum erro. Os dois campos são opcionais.

## regras de negócio

- Campo vazio salva o produto normalmente
- Limpar um valor já salvo apaga o valor no banco, em vez de manter o antigo

## critérios de aceitação

- [ ] Cadastrar produto com peso e estoque mínimo vazios salva
- [ ] Editar produto que já tinha esses campos vazios salva
- [ ] Limpar peso ou estoque mínimo de um produto envia `null`, e o valor é apagado
- [ ] Preencher os campos continua enviando números
