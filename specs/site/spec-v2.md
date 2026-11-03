# feature: Site público BEEZ PET — v2 (loja 100% online e produtos selecionados)

Revisão da [spec-v1](spec-v1.md). Tudo da v1 continua valendo, com as mudanças abaixo (usuário, 03/11/2026).

## posicionamento

- A BEEZ PET é um pet shop 100% online: não existe loja física, e o endereço é só o do contrato social
- Os textos falam de produtos selecionados: as rações passam por um padrão mínimo de qualidade e têm recomendação de veterinários
- Sem frases genéricas como "tudo pro seu pet"

## mudanças na página

- Sai a seção "A loja" ("Passa aqui na loja"), o link para o mapa e qualquer convite para visitar
- Diferenciais ganham "Produtos selecionados" em primeiro lugar
- Vitrine passa a se chamar "Nossa seleção"
- Horário de atendimento: das 8h às 17h, no rodapé e na confirmação do pedido. Os dias da semana não foram informados e não aparecem
- Rodapé mantém os dados da empresa (razão social, CNPJ e endereço do contrato social), como informação legal de quem vende pela internet, sem link para o mapa
- Dados estruturados passam de `PetStore` para `OnlineStore`, sem endereço

## critérios de aceitação

- [ ] Nenhum texto de loja física, visita ou mapa no site
- [ ] Nenhuma ocorrência de "Tudo pro seu pet"
- [ ] Diferencial "Produtos selecionados" citando o padrão mínimo e a recomendação de veterinários
- [ ] Horário "8h às 17h" no rodapé e na confirmação do pedido
- [ ] Rodapé com razão social, CNPJ e endereço como dados da empresa
