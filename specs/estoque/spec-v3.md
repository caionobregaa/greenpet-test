# feature: Estoque — v3 (lote sem validade)

Revisão da [spec-v2](spec-v2.md). Tudo da v2 continua valendo.

## problema

Ao adicionar um lote sem preencher a validade, o sistema enviava `validade: null` e o servidor recusava o pedido ("Erro ao adicionar lote").

## regras de negócio

- Validade continua opcional: vazia ou `null` salva o lote sem validade

## critérios de aceitação

- [ ] Adicionar lote sem validade salva
- [ ] Adicionar lote com validade continua salvando a data
