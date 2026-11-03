# Regras de Negócio — Catálogo público

- Entra no catálogo: `deletedAt IS NULL`, `ocultarCatalogo = false` e `categoria <> 'Serviço'`
- Estoque não influencia o catálogo e não é mostrado ao cliente; a mensagem pede a confirmação da disponibilidade
- O preço do catálogo é o `valorVenda` atual e é uma estimativa: a loja confirma o pedido na conversa
- Alterações no sistema aparecem no site em até 5 minutos
- No filtro de espécie, `Cão e Gato` e produto sem espécie cadastrada aparecem em qualquer opção, para nenhum produto sumir
- WhatsApp oficial: (92) 98470-3686
- Entrega grátis a partir de R$ 80 no total dos produtos. Abaixo disso, a taxa é combinada na conversa
- Campos obrigatórios do pedido:
  - Nome do cliente
  - Telefone com DDD (10 ou 11 dígitos)
  - Pet: Cão, Gato ou Ambos
  - Endereço
  - Forma de pagamento: PIX, Dinheiro, Débito, Crédito 1x, Crédito 2x ou Crédito 3x
- Os dados do cliente vão apenas na mensagem do WhatsApp: não são gravados no servidor nem no navegador
- O percentual de taxa de cartão não aparece para o cliente

## Modelo da mensagem

```
Olá! Vim pelo site da BEEZ PET

*Pedido*
2x Ração X Cão Adulto 15kg — R$ 379,80
1x Petisco Y — R$ 24,90
*Total estimado:* R$ 404,70

*Meus dados*
Nome: Maria Silva
Telefone: (92) 99999-0000
Pet: Cão
Endereço: Rua A, 123 - Centro
Pagamento: PIX

Pode confirmar a disponibilidade?
```
