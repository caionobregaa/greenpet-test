# Regras de Negócio — Promoções

- Uma campanha vale das 00:00 do dia de início às 23:59:59 do dia de fim, no horário de Manaus (UTC−4)
- A situação da campanha é calculada pela data, sem rotina agendada:
  - **Agendada** antes do início
  - **Ativa** dentro do período
  - **Encerrada** depois do fim ou quando encerrada manualmente
- Encerrar agora muda o fim da campanha para o momento atual. A campanha fica registrada como Encerrada, para consulta
- Excluir apaga a campanha e os itens. Só é permitido em campanha Agendada ou Encerrada
- Preço promocional: maior que zero e menor que o `valorVenda` do produto no momento em que é salvo
- Um produto só pode estar em uma campanha por período: não pode haver sobreposição de datas entre campanhas que contenham o mesmo produto
- Produto excluído, oculto no catálogo ou da categoria Serviço pode ficar na campanha, mas só aparece no site se estiver publicado (specs/catalogo/rules.md)
- O preço normal (`valorVenda`) do produto nunca é alterado pela campanha
- Vendas e orçamentos guardam o valor do item no momento do registro; o fim da campanha não altera o que já foi registrado
