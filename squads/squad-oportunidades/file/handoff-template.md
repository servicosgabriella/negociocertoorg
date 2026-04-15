---
type: handoff-template
title: Template de Handoff entre Fases
description: >
  Formato padrão para transferência de contexto entre fases do pipeline.
  Cada fase grava seu output neste formato. A fase seguinte carrega APENAS
  este arquivo — não o contexto completo da fase anterior.
---

# Handoff — Pipeline Pillar Page

## Como usar

Ao final de cada fase, o agente responsável preenche a seção correspondente
abaixo e salva em `squads/squad-oportunidades/file/handoff-ativo.md`.

A fase seguinte abre uma **nova sessão** e carrega apenas:
- Seu próprio agente
- Suas skills necessárias
- Este arquivo de handoff (substituído pelo `handoff-ativo.md`)

---

## HANDOFF FASE 1 → FASE 2

> Preenchido pelo `@estrategista-buscas` ao finalizar `search-oportunidade`

```yaml
fase: 1→2
oportunidade_aprovada:
  keyword: ""
  score: ""
  angulo_sugerido: ""
  nicho: ""           # maquininha | contabilidade | outro
urls_concorrentes:
  - url: ""
    posicao_serp: ""
  - url: ""
    posicao_serp: ""
  - url: ""
    posicao_serp: ""
notas_estrategista: ""
```

---

## HANDOFF FASE 2 → FASE 3

> Preenchido pelo `@arquiteto-pilarpage` ao finalizar os 4 tasks

```yaml
fase: 2→3
keyword: ""
nicho: ""             # maquininha | contabilidade | outro
h1: ""
title_tag: ""
slug: ""
layout: ""            # contentlayout | reviewlayout
variacoes_semanticas:
  - ""
h2s:
  - titulo: ""
    tipo: ""          # informacional | comparativo | tutorial | faq
    h3s:
      - ""
gaps_prioritarios:
  - ""
links_internos_sugeridos:
  - anchor_type: ""
    destino: ""
notas_arquiteto: ""
```

---

## HANDOFF FASE 3 → FASE 3.5

> Preenchido pelo `@copywriter-pilarpage` ao finalizar `redigir-artigo`

```yaml
fase: 3→3.5
arquivo_gerado: "src/pages/[slug].astro"
tem_tabela_html: false
tem_grid_comparativo: false
tem_box_produto: false
precisa_revisao_design: false   # true se qualquer campo acima for true
elementos_visuais:
  - tipo: ""          # table | contabilidade-container | box-maquininha
    localizacao: ""   # "H2: Nome do H2 onde aparece"
notas_copywriter: ""
```

---

## Instruções de uso por fase

### Para iniciar Fase 2 (nova sessão)
Carregar apenas:
- `squads/squad-oportunidades/agents/@arquiteto-pilarpage.md`
- `squads/squad-oportunidades/skill/otimizador-h1.md`
- `squads/squad-oportunidades/skill/qualificador-h2.md`
- `squads/squad-oportunidades/skill/construtor-slug.md`
- `squads/squad-oportunidades/file/handoff-ativo.md` (seção FASE 1→2)

**NÃO carregar:** pipeline-pilarpage.md, @estrategista-buscas.md, google-search.md

---

### Para iniciar Fase 3 (nova sessão)
Carregar apenas:
- `squads/squad-oportunidades/agents/@copywriter-pilarpage.md`
- `squads/squad-oportunidades/skill/copy-[NICHO].md` (escolher UM baseado no nicho do handoff)
- `squads/squad-oportunidades/skill/introdução.md`
- `squads/squad-oportunidades/skill/texto-ancora.md`
- `squads/squad-oportunidades/file/anchor-master.md`
- `squads/squad-oportunidades/file/handoff-ativo.md` (seção FASE 2→3)

**Carregar condicionalmente:**
- `box-maquininha.md` → apenas se nicho=maquininha
- `erp-afiliados.md` → apenas se nicho=contabilidade ou outro com ERP

**NÃO carregar:** @arquiteto, @estrategista, otimizador-h1, qualificador-h2, construtor-slug, modelo-html (antes de saber se há tabelas)

---

### Para iniciar Fase 3.5 (nova sessão)
Condição: `precisa_revisao_design: true` no handoff da Fase 3

Carregar apenas:
- `squads/squad-oportunidades/agents/@revisor-design.md`
- `squads/squad-oportunidades/skill/tabela-responsiva.md`
- `squads/squad-oportunidades/data/modelo-html.md`
- `squads/squad-oportunidades/file/handoff-ativo.md` (seção FASE 3→3.5)
- O arquivo `.astro` gerado pela Fase 3

**NÃO carregar:** Nenhum agente anterior
