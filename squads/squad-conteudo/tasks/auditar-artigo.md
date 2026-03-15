---
task: Auditar Artigo
responsavel: "@qa-conteudo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - artigo: Artigo completo em Markdown do @copywriter-seo (obrigatório)
  - keyword: Keyword principal (obrigatório)
  - h2s_aprovados: Lista de H2s que deveriam estar no artigo (obrigatório)
Saida: |
  - veredicto: APROVADO ou VETADO
  - relatorio: Checklist completo com resultados por item
  - feedback: Lista de correções necessárias (se VETADO)
Checklist:
  - "[ ] Executar checklists/checklist-pre-publicacao.md integralmente"
  - "[ ] Emitir veredicto usando templates/feedback-qa-tmpl.md"
referencias:
  - checklists/checklist-pre-publicacao.md
  - config/blacklist.md
  - config/slug-rules.md
  - templates/feedback-qa-tmpl.md
---

# *auditar-artigo

Executa auditoria completa antes da publicação, aplicando o checklist de pré-publicação.

## Uso

```
@qa-conteudo

*auditar-artigo artigo-maquininha-mei.md --keyword "maquininha para MEI"
*auditar artigo-draft.md
```

## Sequência de Auditoria

1. **Checar slug** — aplicar `config/slug-rules.md` (VETO IMEDIATO se inválido, antes de revisar conteúdo)
2. **Executar checklist completo** — aplicar `checklists/checklist-pre-publicacao.md` integralmente
3. **Emitir veredicto** — usar templates de `templates/feedback-qa-tmpl.md`

## Política de Zero Tolerância

Qualquer item da Lista Negra (`config/blacklist.md`) resulta em VETO imediato, independente da qualidade geral do artigo. Não existe "aprovado com ressalvas" para itens da Lista Negra.
