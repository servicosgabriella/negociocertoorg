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
  - "[ ] Variantes semânticas identificadas (mínimo 2)"
  - "[ ] Cada variante pesquisada individualmente no Google (PAA próprio)"
  - "[ ] Cada variante mapeada em pelo menos 1 H2 da lista final"
  - "[ ] H2s transformados (pergunta → H2 no tom do artigo)"
  - "[ ] Cada H2 validado contra a Regra de Ouro"
  - "[ ] Nenhum H2 genérico proibido na lista final"
  - "[ ] Nenhuma variante semântica ausente do mapa de entrega"
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
1. [H2 usando variante principal] — Fonte: PAA
2. [H2 usando variante 2]        — Fonte: PAA
3. [H2 usando variante 3]        — Fonte: buscas relacionadas
4. [H2 usando variante principal] — Fonte: autocomplete
5. [H2 usando sigla/acrônimo]    — Fonte: gap concorrente

Gaps identificados nos concorrentes:
- [Pergunta/tema que top 1 e top 2 não respondem]

Mapa de Variantes → H2:
- "[variante principal]" → H1 + H2-1 (keyword principal)
- "[variante 2]"         → H2-2 (descrever o H2 que a usa)
- "[variante 3]"         → H2-3 (descrever o H2 que a usa)
- "[sigla/acrônimo]"     → H2-5 ou corpo do texto (menção explícita)
```

### Regra de Distribuição de Variantes

Para artigos de review ou intenção transacional/comercial, cada variante semântica relevante **deve estar atribuída a pelo menos um H2** ou ao corpo de uma seção específica. Não agrupe todas as variantes no mesmo H2.

Exemplo correto para "maquininha voucher refeição":
- "voucher refeição" → H1 e H2-1
- "vale refeição" → H2-2 ("Maquininha que aceita vale refeição tem taxa diferente?")
- "vale alimentação" → H2-3 ("Vale alimentação e VR funcionam na mesma maquininha?")
- "VR" / "VA" → H2-4 ou menção explícita no corpo
