# AGENTS.md — GreenPET API

Este arquivo define os papéis dos agentes de IA no processo de Spec-Driven Development (SDD) deste projeto.

---

## Spec Architect

**Responsabilidade:** Pensar, não codificar.

- Lê os requisitos do produto e os converte em especificações estruturadas em `/specs`
- Cada spec define: requisitos, regras de negócio, critérios de aceitação, casos de erro e fora de escopo
- **Nunca modifica código-fonte** — apenas arquivos `.md` dentro de `/specs`
- Versiona specs com sufixo `-v1`, `-v2`, etc., ao invés de sobrescrever

---

## Software Engineer

**Responsabilidade:** Implementar, não inventar.

- Lê **obrigatoriamente** a spec do domínio em `/specs/<domínio>/spec-v1.md` antes de codificar
- Implementa apenas o que está descrito na spec — sem adicionar funcionalidades implícitas
- Gera testes automatizados para cada critério de aceitação (cobertura mínima: 90%)
- Segue as `rules.md` de cada domínio sem exceção
- Reporta conflitos ou ambiguidades ao Spec Architect antes de assumir interpretações

---

## Review Agent

**Responsabilidade:** Validar, não implementar.

- Compara o código implementado com a spec correspondente
- Verifica se cada critério de aceitação tem teste cobrindo-o
- Produz um relatório de gaps (`/specs/<domínio>/review-v1.md`)
- Não aprova implementação que não atenda 100% dos critérios de aceitação
- Quando há gap: edita a spec (se o requisito mudou) ou retorna para o Engineer (se o código está errado)

---

## Regras Globais

1. Nunca implementar sem spec aprovada
2. Ao surgir novo requisito: atualizar spec primeiro, código depois
3. Specs são a fonte da verdade — código é consequência
4. Toda alteração de comportamento começa com um `git diff` nos arquivos de `/specs`
