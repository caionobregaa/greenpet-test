# feature: Controle de Recompra

## requisitos

- Listar alertas de recompra calculados a partir do histórico de vendas
- Filtrar alertas por cliente, urgência e produto
- Não há CRUD — é um endpoint somente leitura

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /recompra/alertas

**Query params:** `clienteId`, `urgencia` (`vencido`, `urgente`, `proximo`, `ok`), `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "clienteId": "uuid",
      "clienteNome": "Maria Silva",
      "animalNome": "Thor",
      "produtoNome": "Royal Canin Mini Adult 2,5kg",
      "ultimaCompra": "2026-04-01",
      "diasRecompra": 45,
      "dataPrevista": "2026-05-16",
      "diasRestantes": -2,
      "urgencia": "vencido"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 7 }
}
```

## critérios de aceitação

- [ ] Retorna apenas produtos com `diasRecompra` definido
- [ ] `diasRestantes` negativo indica alerta vencido
- [ ] Urgência `vencido` quando `dataPrevista < hoje`
- [ ] Urgência `urgente` quando `dataPrevista <= hoje + 3`
- [ ] Urgência `proximo` quando `dataPrevista <= hoje + 7`
- [ ] Filtrar por `urgencia=vencido` retorna apenas vencidos
- [ ] Filtrar por `clienteId` retorna apenas alertas daquele cliente
- [ ] Clientes deletados não aparecem nos alertas
- [ ] Considera apenas a **última** venda do produto por cliente

## fora de escopo (v1)

- Envio automático de notificação ao cliente
- Configuração de `diasRecompra` por cliente individualmente
- Histórico de alertas disparados
