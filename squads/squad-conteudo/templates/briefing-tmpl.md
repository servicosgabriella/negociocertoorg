---
template: briefing
title: Template de Briefing — Head para Copywriter
version: 1.0.0
squad: squad-conteudo
emitido_por: "@head-de-conteudo"
recebido_por: "@copywriter-seo"
---

# Template de Briefing

Emitido pelo `@head-de-conteudo` ao delegar redação para o `@copywriter-seo`.

## Formato de Handoff

```
BRIEFING — [keyword]

Intenção de busca: [Informacional | Comercial | Transacional]
É review: [Sim | Não]
Layout Astro: [bloglayout.astro | reviewlayout.astro | contentlayout.astro]
Keyword principal: [keyword]
Variações semânticas sugeridas: [lista separada por vírgula]
Estrutura de introdução: [Ponte | CPP | Pergunta+Dor+Promessa]
Tamanho alvo: [X–Y palavras]

Mapa de Variantes → H2 (obrigatório para review e transacional):
- "[variante principal]" → H1 + H2-[número]
- "[variante 2]"         → H2-[número]
- "[variante 3]"         → H2-[número]
- "[sigla/acrônimo]"     → H2-[número] ou corpo do texto

H2s validados (nesta ordem):
1. [H2 com variante indicada] — Fonte: PAA
2. [H2 com variante indicada] — Fonte: PAA
3. [H2 com variante indicada] — Fonte: buscas relacionadas
4. [H2 com variante indicada] — Fonte: autocomplete
5. [H2 com variante indicada] — Fonte: gap concorrente

Pontos obrigatórios:
- [Ponto que não pode faltar]
- [Contexto específico do público MEI/empreendedor]

Gaps dos concorrentes a explorar:
- [Pergunta que o top 1 e top 2 não respondem]
```

## Critérios de Completude

Antes de enviar o briefing, verificar:

- [ ] Intenção de busca classificada
- [ ] Layout Astro determinado
- [ ] H2s validados (todos com fonte real do Google)
- [ ] Nenhum H2 genérico proibido na lista
- [ ] Estrutura de introdução escolhida
- [ ] Tamanho alvo definido
- [ ] Para review/transacional: mapa de variantes preenchido com ≥3 variantes distribuídas em H2s distintos

## Exemplo Preenchido

```
BRIEFING — melhores maquininhas para MEI

Intenção de busca: Comercial
É review: Sim
Layout Astro: reviewlayout.astro
Keyword principal: melhores maquininhas para MEI
Variações semânticas sugeridas: maquininha MEI, máquina de cartão MEI, maquininha para autônomo
Estrutura de introdução: Ponte
Tamanho alvo: 1.500–2.000 palavras

Mapa de Variantes → H2:
- "melhores maquininhas para MEI" → H1 + H2-1
- "maquininha MEI"                → H2-2
- "máquina de cartão MEI"         → H2-3
- "maquininha para autônomo"      → H2-5 ou corpo do texto

H2s validados (nesta ordem):
1. Qual a melhor maquininha para MEI? — Fonte: PAA
2. Maquininha para MEI tem taxa diferente? — Fonte: PAA
3. Qual a máquina de cartão mais barata para MEI? — Fonte: PAA
4. Maquininha para MEI paga contribuição ao INSS? — Fonte: PAA
5. Vale a pena ter maquininha sendo MEI autônomo? — Fonte: buscas relacionadas
6. Como escolher maquininha para MEI iniciante — Fonte: gap concorrente

Pontos obrigatórios:
- Mencionar que o MEI pode receber via pix sem maquininha
- Comparar no mínimo 3 opções com taxa real (não vaga)

Gaps dos concorrentes a explorar:
- Nenhum artigo compara maquininha física vs. link de pagamento para MEI
```
