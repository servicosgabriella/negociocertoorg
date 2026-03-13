---
task: Pesquisar Pauta
responsavel: "@pesquisador-seo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - keyword: Palavra-chave principal (obrigatório)
  - intencao: Tipo de intenção classificado pelo @head-de-conteudo (obrigatório)
Saida: |
  - h2s: Lista de H2s validados com fonte indicada
  - gaps: Oportunidades identificadas nos concorrentes
  - keyword_confirmada: Keyword principal confirmada ou ajustada
Checklist:
  - "[ ] Keyword recebida"
  - "[ ] Busca realizada no Google"
  - "[ ] PAA extraído (fonte primária)"
  - "[ ] Buscas relacionadas extraídas"
  - "[ ] Autocomplete analisado"
  - "[ ] Top 3 resultados orgânicos analisados (H2s)"
  - "[ ] Gaps identificados nos top 2 resultados"
  - "[ ] H2s transformados (pergunta → H2 no tom do artigo)"
  - "[ ] Cada H2 validado contra a Regra de Ouro"
  - "[ ] Nenhum H2 genérico proibido na lista final"
  - "[ ] Lista entregue para @head-de-conteudo"
---

# *pesquisar-pauta

Pesquisa e valida H2s baseados em fontes reais do Google para uma keyword específica.

## Uso

```
@pesquisador-seo

*pesquisar-pauta "maquininha para MEI" --intencao comercial
*pesquisar-pauta "como abrir empresa" --intencao informacional
```

## Regra de Ouro — Validação Obrigatória

Antes de incluir qualquer H2 na lista final:

> "Essa pergunta aparece no Google quando alguém busca o tema do artigo?"

Se NÃO → H2 vetado.

## H2s Genéricos Proibidos (nunca incluir)

- "O que é [tema]"
- "Benefícios de [tema]"
- "Como funciona [tema]"
- "Vantagens e desvantagens"
- "Dicas para [tema]"
- "Conclusão"

## Formato de Entrega

```
PESQUISA — [keyword]

Keyword confirmada: [keyword]
Intenção: [tipo]

H2s Validados:
1. [H2] — Fonte: PAA
2. [H2] — Fonte: PAA
3. [H2] — Fonte: buscas relacionadas
4. [H2] — Fonte: autocomplete
5. [H2] — Fonte: gap concorrente

Gaps identificados nos concorrentes:
- [Pergunta/tema que top 1 e top 2 não respondem]

Variações semânticas identificadas:
- [termo relacionado 1]
- [termo relacionado 2]
```
