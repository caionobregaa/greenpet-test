# feature: Site público BEEZ PET — v1

Landing page da loja em `beezpet.com.br`, para tutores de cães e gatos. App próprio em `site/`, separado do sistema interno (`app.beezpet.com.br`). Catálogo e carrinho seguem [specs/catalogo/spec-v1.md](../catalogo/spec-v1.md).

## estrutura da página

1. Topo: logo, Ver catálogo e WhatsApp
2. Primeira dobra: fundo vinho, título em amarelo com Fraunces, mascote com as caixas, botão principal **Ver catálogo** e secundário **Chamar no WhatsApp**
3. Como funciona: escolha os itens, envie pelo WhatsApp, a loja confirma
4. Produtos da loja: vitrine por categoria com produtos reais, foto, nome, preço e **Adicionar**
5. Diferenciais: entrega grátis acima de R$ 80, lembrete de recompra e atendimento pelo WhatsApp
6. A loja: Avenida Duque de Caxias, 1225, Praça 14 de Janeiro, Manaus-AM, com link para o mapa
7. Rodapé: contato, Instagram @beezpetbr e CNPJ

## regras

- Identidade visual de [specs/identidade-visual/spec-v1.md](../identidade-visual/spec-v1.md); o mascote com as caixas fica sempre sobre `#641d3f`
- Vitrine com até 8 produtos por categoria, priorizando os que têm foto, e link **Ver todos** para `/catalogo?categoria=...`
- Só fatos confirmados: sem depoimentos, notas ou números inventados
- Horário de funcionamento fica fora até ser informado
- `greenpet.am@gmail.com` não aparece, por trazer a marca antiga
- Nenhum link público para o sistema interno
- Páginas renderizadas no servidor com cache de 5 minutos dos produtos, usando `BACKEND_URL` em tempo de execução; o build não depende do backend

## critérios de aceitação

- [ ] `/` e `/catalogo` mostram produtos reais da API
- [ ] O carrinho é o mesmo na landing page e no catálogo
- [ ] Nada de login ou gestão no código do site
- [ ] Sem rolagem horizontal em celular e desktop; barra do carrinho não cobre conteúdo
- [ ] Respeita `prefers-reduced-motion`
- [ ] Título, descrição, Open Graph, `sitemap`, `robots` e JSON-LD de `PetStore` só com dados confirmados
- [ ] Fotos servidas pelo próprio domínio do site
