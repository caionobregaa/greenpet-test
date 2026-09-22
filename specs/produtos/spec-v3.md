# feature: Produtos (v3 — Código de Barras)

## contexto

Estende [spec-v1.md](spec-v1.md) e [spec-v2.md](spec-v2.md). Documenta 2 campos novos no
Produto: `codigoBarras` e `semCodigoBarras`. O código de barras é um atributo do PRODUTO (o
mesmo em toda reposição de estoque), não do lote/entrada de estoque — mas o ponto de captura
principal na UI é o fluxo de "Adicionar ao Estoque", por pedido explícito do usuário.

## requisitos

- Produto ganha 2 campos novos, persistidos, opcionais: `codigoBarras` (string, nullable) e
  `semCodigoBarras` (boolean, default `false`).
- Estado é tri-valorado: `codigoBarras` preenchido (tem código); `semCodigoBarras = true` e
  `codigoBarras = null` (confirmado que não tem); ambos vazios/`false` (ainda não informado —
  pendente).
- Os dois campos são mutuamente exclusivos na UI: marcar "Sem código de barras" limpa/desabilita
  o campo de texto, e digitar um código desmarca a caixa.
- No formulário de cadastro/edição de produto (`produto-form.tsx`), os dois campos ficam
  editáveis diretamente, junto dos outros campos de identificação do produto.
- No fluxo de "Adicionar ao Estoque" (`AdicionarLoteDialog`) e "Editar Lote"
  (`EditarLoteDialog`), quando o produto selecionado ainda está pendente (nem `codigoBarras`
  nem `semCodigoBarras` preenchidos), aparece um bloco pedindo o código de barras ou a
  confirmação de que não tem — ao salvar, isso é persistido no PRODUTO (via update), não no
  item de estoque. Se o produto já tem a informação registrada, o bloco não aparece de novo.
- A listagem de estoque (`estoque/page.tsx`) mostra um indicador visual nos produtos que ainda
  estão pendentes (nem código nem "sem código" confirmados), para facilitar identificar o que
  falta completar.

## endpoints (delta sobre v1/v2)

### POST/PUT /produtos — campos novos aceitos

```json
{ "codigoBarras": "7891234567890", "semCodigoBarras": false }
```

### GET /produtos — response (delta)

Cada item ganha `"codigoBarras"` (string ou `null`) e `"semCodigoBarras"` (boolean).

## critérios de aceitação

- [ ] Backend aceita/persiste `codigoBarras`/`semCodigoBarras` para qualquer categoria
- [ ] GET /produtos e GET /produtos/:id retornam os 2 campos
- [ ] Marcar "Sem código de barras" no formulário limpa o campo de texto
- [ ] Digitar um código de barras desmarca "Sem código de barras", se estivesse marcado
- [ ] Ao adicionar/editar lote de um produto sem info de código de barras ainda registrada, o
      bloco de captura aparece; ao salvar, o produto é atualizado com o valor informado
- [ ] Ao adicionar/editar lote de um produto que já tem código de barras (ou "sem código de
      barras" confirmado) registrado, o bloco não aparece
- [ ] Produtos pendentes (nem código nem confirmação) mostram um indicador na listagem de
      estoque

## casos de erro

Sem casos novos — campos opcionais, sem validação de formato/unicidade do código de barras
nesta versão.

## fora de escopo (v3)

- Validação de formato (EAN-13/UPC) ou unicidade do código de barras
- Leitura via câmera/scanner de código de barras
- Código de barras por lote (sempre por produto, nesta versão)
