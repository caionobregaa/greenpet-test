# feature: Estoque — v2 (baixa pelas vendas, avisos, diagnóstico e correção retroativa)

Revisão da [spec-v1](spec-v1.md). Tudo da v1 continua valendo. A v1 deixava "movimentação automática de estoque pelas vendas" fora de escopo; a baixa na criação da venda já existe no código desde 25/06/2026 e esta versão a especifica, fecha as brechas encontradas e corrige o histórico.

## decisões (usuário, 27/10/2026)

1. **Estoque insuficiente:** avisar ("Só há N em estoque"), **deixar vender** e tirar o que existe
2. **Vendas antigas:** **correção automática**
3. **Levantamento nos dados:** sim (tela de diagnóstico)

## requisitos

- Venda nova tira do estoque a quantidade de cada item ligado a um produto (lotes com validade mais próxima primeiro; lote zerado é removido), inclusive brinde e orçamento convertido
- Quando o estoque não basta, a venda é registrada mesmo assim, tirando só o que existe, e o sistema **avisa**:
  - na tela da venda, ao escolher o produto ou mudar a quantidade: "Só há N em estoque" / "Sem estoque"
  - depois de salvar: aviso com os itens que não tinham estoque suficiente
- Item sem produto cadastrado (descrição digitada ou "SEM REGISTRO") mostra o aviso "não sai do estoque"
- **Editar** a venda ajusta o estoque pela diferença de quantidade de cada produto
- **Excluir** a venda devolve ao estoque o que ela tinha tirado
- A tela de Estoque e a de Produtos se atualizam depois de criar, editar ou excluir uma venda
- Tela **Diagnóstico do estoque** (`/estoque/diagnostico`), só leitura, com:
  - vendas com itens sem produto cadastrado
  - itens com baixa incompleta (vendidos com estoque insuficiente)
  - produtos com nome repetido (possível cadastro duplicado) e o estoque de cada um
  - vendas antigas pendentes de correção
- **Correção retroativa** na mesma tela: botão **Simular** (mostra o que vai mudar, sem mudar nada) e **Aplicar** (com confirmação)

## regras de negócio

- Cada item de venda guarda `qtdBaixada`: quanto ele realmente tirou do estoque. Vazio (`null`) = venda antiga que nunca teve baixa, pendente de correção
- Itens existentes ao implantar esta versão:
  - vendas registradas a partir de 26/06/2026 02:43 UTC (25/06 22:43 em Manaus, quando a baixa automática entrou), com produto: `qtdBaixada = qtd` (a baixa já tinha sido feita)
  - itens sem produto: `qtdBaixada = 0`
  - vendas anteriores, com produto: `qtdBaixada = null` (pendente)
- **Edição**, por produto: `delta = qtd nova − qtd antiga`. `delta > 0` tira `delta` (o que existir); `delta < 0` devolve até o que tinha sido tirado. Mudar só observação, data, pagamento etc. não mexe no estoque. Produto com item pendente (`null`) não é ajustado na edição (fica para a correção retroativa)
- **Exclusão:** devolve a soma de `qtdBaixada` de cada produto (pendente devolve nada)
- **Devolução ao estoque** cria um lote novo do produto, sem validade, com a observação "Estorno da venda Vxxxxx"
- **Correção retroativa:** para cada item pendente, da venda mais antiga para a mais nova, tira a quantidade dos lotes do produto que **já existiam na hora da venda** (lote criado antes ou junto da venda), validade mais próxima primeiro, só o que existir, e grava `qtdBaixada`. Lotes lançados depois da venda (compras ou contagens posteriores) não são mexidos
- A correção só processa itens pendentes, então rodar de novo não desconta duas vezes
- Simular não grava nada; Aplicar roda tudo numa transação

## endpoints

- `POST /api/v1/vendas` e `PATCH /api/v1/vendas/:id`: a resposta traz `avisosEstoque: [{ produtoId, nome, qtd, qtdBaixada }]` (itens desta venda com baixa incompleta)
- `POST /api/v1/orcamentos/:id/converter`: a resposta traz `{ vendaId, avisosEstoque }`
- `GET /api/v1/estoque/diagnostico` → `{ itensSemProduto, baixasIncompletas, produtosDuplicados, pendentesCorrecao }`
- `POST /api/v1/estoque/correcao-retroativa` — body `{ aplicar: boolean }` → `{ aplicado, itens: [{ vendaId, vendaNumero, vendaData, produtoId, produtoNome, qtd, qtdBaixada }], totalItens, totalUnidades }`

## critérios de aceitação

- [ ] Venda nova com estoque suficiente tira a quantidade e grava `qtdBaixada = qtd`
- [ ] Venda nova com estoque insuficiente é registrada, tira só o que existe, grava `qtdBaixada` menor que `qtd` e retorna `avisosEstoque`
- [ ] Editar aumentando a quantidade tira a diferença; diminuindo devolve; editar sem mudar quantidade não mexe no estoque
- [ ] Excluir a venda devolve o que foi tirado (lote "Estorno da venda")
- [ ] Item pendente (`null`) não é ajustado na edição nem devolvido na exclusão
- [ ] Tela da venda avisa "Só há N em estoque" / "Sem estoque" e "não sai do estoque" para item sem produto
- [ ] Depois de salvar, mostra aviso com os itens sem estoque suficiente
- [ ] Diagnóstico lista itens sem produto, baixas incompletas, produtos repetidos e pendentes de correção
- [ ] Simular correção não muda nada e mostra o que mudaria
- [ ] Aplicar correção tira dos lotes que existiam na hora da venda e marca os itens; rodar de novo não desconta de novo

## fora de escopo

- Bloquear venda sem estoque (decisão 1)
- Ajustar estoque por perda/vencimento (continua manual na tela de Estoque)
- Unir cadastros duplicados de produto automaticamente (o diagnóstico só aponta)
