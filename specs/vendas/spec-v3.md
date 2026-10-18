# feature: Vendas — v3 (recibo em impressora térmica 80 mm)

Revisão da [spec-v2](spec-v2.md). Define o layout de impressão do **recibo de venda** (botão "Imprimir Recibo" em `/vendas/[id]`) para a impressora térmica da loja: **ZATEL Q85-1**, driver **POS80**, USB, Windows 10.

## requisitos

- O recibo é impresso como cupom térmico de bobina 80 mm, nunca como página A4/Carta
- Largura útil do conteúdo: **72 mm** (área imprimível da cabeça de 80 mm)
- Margens da página: **0**. O respiro fica só no padding interno do cupom (≤ 2 mm)
- Orientação retrato
- Comprimento variável: a página tem a altura do conteúdo do recibo, sem sobra em branco no fim
- Só o recibo é impresso. Sidebar, topbar, cabeçalho e demais partes da tela ficam fora da impressão
- Impressão em preto puro (sem tons de cinza, que a cabeça térmica imprime pontilhados)

## regras de negócio

- O tamanho da página (`@page`) é calculado na hora de imprimir, a partir da altura real do recibo (px → mm a 96 dpi), mais 2 mm de folga
- O `@page` dinâmico vale só para essa impressão e é removido depois (`afterprint`), sem afetar outras impressões do sistema
- **Corte automático não é feito pelo sistema.** O navegador não envia comandos ESC/POS; o corte é configurado no driver POS80 (ver abaixo)

## configuração da estação (fora do código)

No Windows, em **Impressoras > POS80 > Preferências de impressão**:
- Tamanho do papel: `80(72.1) x 3276 mm` (rolo), orientação Retrato
- Corte de papel: **cortar ao final do documento** (o nome exato muda conforme a versão do driver, por exemplo "Paper Cut" / "Cut at end of doc")

No diálogo de impressão do Chrome/Edge (o navegador lembra a escolha):
- Destino: POS80 · Margens: **Nenhuma** · Escala: **100%** (ou Padrão) · **Desmarcar** "Cabeçalhos e rodapés"

## critérios de aceitação

- [ ] Ao imprimir, a página fica com `size: 72mm <altura do recibo + 2>mm` e `margin: 0`
- [ ] A regra `@page` é removida após o evento `afterprint`
- [ ] O recibo tem largura de 72 mm
- [ ] Sidebar e topbar do layout não aparecem na impressão, e o layout não corta o conteúdo na impressão (sem `h-screen`/`overflow-hidden`)
- [ ] O recibo não usa cor cinza (texto todo em preto)

## fora de escopo

- Envio de comandos ESC/POS / impressão RAW (exigiria um agente local na máquina)
- Impressão silenciosa sem diálogo (pode ser feita na estação com o Chrome em `--kiosk-printing`, sem mudança no código)
- Outros documentos (orçamento, relatórios)
