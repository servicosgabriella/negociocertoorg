---
template: feedback-qa
title: Templates de Veto e Aprovação — QA de Conteúdo
version: 1.0.0
squad: squad-conteudo
emitido_por: "@qa-conteudo"
---

# Templates de Feedback — QA de Conteúdo

## Veto por Slug Inválido

Use quando o slug viola `config/slug-rules.md`. VETO antes de revisar o conteúdo.

```
🚫 ARTIGO VETADO — @copywriter-seo

Motivo: URL/slug inválido
Slug recebido: "{slug-com-problema}"
Violação: [número/ano | data | palavras demais | palavras de menos | muito longo]

Corrija o slug para: "{slug-sugerido}"
Reenvie após correção.
```

## Veto por Conteúdo

Use quando o artigo falha em um ou mais itens do checklist.

```
🚫 ARTIGO VETADO — @copywriter-seo

Motivo(s):
1. [Regra violada + linha/trecho específico do artigo]
2. [Regra violada + linha/trecho específico do artigo]

Ações necessárias:
- [Instrução específica de correção — o que fazer, não só o que está errado]
- [Instrução específica de correção]

Checklist: {X}/14 itens aprovados
Reenvie após correções para nova auditoria.
```

## Aprovação

Use quando o artigo passa em todos os itens do checklist.

```
✅ ARTIGO APROVADO — @head-de-conteudo

Checklist: 14/14 itens aprovados
Artigo pronto para publicação.

Slug: {slug}
Layout: {layout}
```

## Regras de Veto

- **Zero tolerância** para itens da Lista Negra (`config/blacklist.md`) — qualquer ocorrência = VETO imediato
- **Sem "aprovado com ressalvas"** — ou passa em tudo ou é VETADO
- **Feedback sempre específico** — citar o trecho exato, não a regra genérica
- **Instrução acionável** — dizer o que fazer, não só o que está errado
