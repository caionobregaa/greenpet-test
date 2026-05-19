# Regras de Negócio — Controle de Recompra

- Recompra é um dado **calculado** — não existe tabela de recompra; é derivado das vendas
- Cada produto tem um campo `diasRecompra` (tempo estimado de duração em dias)
- O alerta de recompra é gerado quando: `data_ultima_compra + diasRecompra <= hoje + 7 dias`
- Alertas são classificados por urgência:
  - 🔴 Vencido: `data_prevista < hoje`
  - 🟡 Urgente: `data_prevista <= hoje + 3 dias`
  - 🟠 Próximo: `data_prevista <= hoje + 7 dias`
  - 🟢 OK: `data_prevista > hoje + 7 dias`
- Apenas a última compra de cada produto por cliente é considerada
- Produtos sem `diasRecompra` definido são excluídos do controle
- Clientes inativos (soft-deleted) são excluídos dos alertas
