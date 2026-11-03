# feature: Catálogo público — v1

Vitrine dos produtos do sistema para os clientes da loja, em `beezpet.com.br`. O cliente monta o carrinho e envia o pedido pelo WhatsApp oficial, onde o atendimento é finalizado.

## requisitos funcionais

- Todo produto ativo cadastrado no sistema aparece no catálogo sem passo extra de publicação
- Cada produto mostra foto, nome e preço
- Produtos agrupados pela `categoria` do banco
- Busca por nome e filtros por categoria e espécie
- Carrinho com quantidades, total estimado e envio pelo WhatsApp
- Dados básicos do cliente enviados junto com o pedido

## API

### `GET /api/v1/catalogo/produtos` (pública, sem login)

```json
{ "data": [{ "id": "uuid", "nome": "Ração X 15kg", "categoria": "Ração", "especie": "Cão", "valorVenda": 189.9, "imagemUrl": "/api/v1/catalogo/produtos/uuid/imagem?v=1793664000000" }] }
```

`imagemUrl` é `null` em produto sem foto. A lista não traz a foto em si: `produtos.imagemUrl` guarda a imagem em base64 no banco, e isso tornaria a resposta enorme.

### `GET /api/v1/catalogo/produtos/:id/imagem` (pública, sem login)

- Foto em base64: devolve o arquivo, com cache longo (a URL muda quando o produto muda)
- Foto em URL `http(s)`: redireciona para ela
- Foto em caminho relativo (`/uploads/...`, de cadastros antigos): redireciona para `https://app.beezpet.com.br`
- `404` se o produto não estiver no catálogo, não tiver foto ou a foto não for JPEG, PNG, WebP ou GIF

## critérios de aceitação

- [ ] As duas rotas respondem sem login
- [ ] A lista não expõe custo, margens, fornecedor, estoque, SKU, código de barras nem outros campos internos
- [ ] Ocultos, excluídos e categoria `Serviço` ficam fora da lista, e as fotos deles respondem `404`
- [ ] Produto sem estoque aparece normalmente
- [ ] A lista não carrega a foto em base64
- [ ] Seções na ordem Ração, Petisco, Medicamento, Acessório, Higiene; categoria não prevista vem depois, sem perder produto
- [ ] Busca ignora maiúsculas e acentos; filtros combinam com a busca
- [ ] Produto sem foto mostra a arte do mascote
- [ ] Carrinho guarda só id e quantidade no navegador; preços sempre vêm do catálogo atual
- [ ] Item que saiu do catálogo é removido do carrinho, com aviso; falha da API não apaga o carrinho
- [ ] Total estimado e aviso de entrega grátis a partir de R$ 80
- [ ] Item de `Medicamento` mostra aviso de que a loja confirma na conversa se exige receita
- [ ] Só envia com carrinho preenchido e os cinco campos válidos; campo com erro mostra o aviso ao lado
- [ ] Mensagem segue o modelo das regras, sem emoji, e abre `wa.me/5592984703686`
- [ ] Se a API falhar, a página mostra um aviso e o botão do WhatsApp

## fora de escopo

- Pedido gravado no sistema ou convertido em orçamento
- Cliente cadastrado a partir do formulário
- Retirada na loja, pagamento online e conta de cliente
- Página própria para cada produto
