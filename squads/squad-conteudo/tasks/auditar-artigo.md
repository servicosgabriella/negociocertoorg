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
  - "[ ] Checar Lista Negra completa (conectivos + clichês + palavras proibidas)"
  - "[ ] Checar vocabulário corporativo proibido"
  - "[ ] Checar H1 com keyword e intenção"
  - "[ ] Checar keyword nos primeiros 100 palavras"
  - "[ ] Checar H2s: nenhum genérico proibido"
  - "[ ] Checar links internos: âncoras descritivas"
  - "[ ] Checar intenção alinhada com formato"
  - "[ ] Checar tom: conversa humana ou robótico?"
  - "[ ] Checar 'você' com frequência adequada"
  - "[ ] Checar dados: específicos ou vagos?"
  - "[ ] Checar ritmo: efeito escada ausente?"
  - "[ ] Checar intercalação bloco/impacto"
  - "[ ] Checar introdução: gancho (não definição)"
  - "[ ] Checar conclusão: próximo passo (não 'esperamos ter ajudado')"
  - "[ ] Teste final: soa como humano em voz alta?"
  - "[ ] Emitir veredicto: APROVADO (14/14) ou VETADO (lista de falhas)"
---

# *auditar-artigo

Executa auditoria completa em 14 pontos antes da publicação.

## Uso

```
@qa-conteudo

*auditar-artigo artigo-maquininha-mei.md --keyword "maquininha para MEI"
*auditar artigo-draft.md
```

## Veredicto APROVADO

```
✅ ARTIGO APROVADO — @head-de-conteudo

Checklist: 14/14 itens aprovados
Artigo pronto para publicação.
```

## Veredicto VETADO

```
🚫 ARTIGO VETADO — @copywriter-seo

Motivo(s):
1. [Regra violada + trecho específico]
2. [Regra violada + trecho específico]

Ações necessárias:
- [Instrução específica]
- [Instrução específica]

Reenvie após correções.
```

## Política de Zero Tolerância

Qualquer item da Lista Negra (Regra #3) resulta em VETO imediato, independente da qualidade geral do artigo. Não existe "aprovado com ressalvas" para itens da Lista Negra.
