---
workflow: pipeline-pilarpage
title: Pipeline Completo de Pillar Page
squad: squad-oportunidades
description: >
  Orquestra o ciclo completo de criação de uma pillar page monetizável — da descoberta
  de oportunidade até a publicação. Cada fase é uma sessão independente. O handoff
  entre fases é feito via arquivo estruturado, não acúmulo de contexto.
agents:
  - "@estrategista-buscas"
  - "@arquiteto-pilarpage"
  - "@copywriter-pilarpage"
  - "@revisor-design"
---

# Pipeline — Pillar Page Monetizável

## Visão geral

```
FASE 1            FASE 2              FASE 3             FASE 3.5*      FASE 4
@estrategista  →  @arquiteto      →   @copywriter    →   @revisor   →   publicação
[sessão A]        [sessão B]          [sessão C]         [sessão D]

handoff-ativo.md (seção 1→2)    handoff-ativo.md (seção 2→3)
```

**Princípio de isolamento:** cada fase é uma nova sessão. O agente grava o
output em `file/handoff-ativo.md` antes de encerrar. A fase seguinte carrega
apenas esse arquivo + seus próprios agentes e skills.

**Gates humanos:**
- Gate 1 (após Fase 1): dono aprova oportunidade antes de abrir Fase 2
- Gate 2 (após Fase 2): dono aprova estrutura antes de abrir Fase 3

---

## FASE 1 — Descoberta

**Sessão A | Modelo recomendado: Claude Haiku 4.5 (pesquisa e scoring)**

### Carregar nesta sessão
```
squads/squad-oportunidades/agents/@estrategista-buscas.md
squads/squad-oportunidades/skill/google-search.md
```

### O que acontece

O `@estrategista-buscas` executa `task/search-oportunidade.md`: pesquisa multi-fonte,
score 5 dimensões, retorna 3 oportunidades com top 3 URLs da SERP.

### Output — gravar em `file/handoff-ativo.md`

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

### Gate 1 — Aprovação humana

```
[ ] Dono aprovou a oportunidade e o nicho identificado
[ ] URLs dos concorrentes confirmadas
```

Após aprovação → iniciar Fase 2 em nova sessão.

---

## FASE 2 — Arquitetura

**Sessão B | Modelo recomendado: Claude Haiku 4.5 (decisões estruturais)**

### Carregar nesta sessão
```
squads/squad-oportunidades/agents/@arquiteto-pilarpage.md
squads/squad-oportunidades/skill/otimizador-h1.md
squads/squad-oportunidades/skill/qualificador-h2.md
squads/squad-oportunidades/skill/construtor-slug.md
squads/squad-oportunidades/file/handoff-ativo.md   ← output da Fase 1
```

**NÃO carregar:** pipeline-pilarpage.md completo, @estrategista, google-search

### O que acontece

O `@arquiteto-pilarpage` executa 4 tasks em sequência usando o handoff da Fase 1:
1. `mapeamentosematico.md` — analisa as 3 URLs do handoff
2. `criar-h1.md` — usa `otimizador-h1.md`
3. `criar-url.md` — usa `construtor-slug.md`
4. `construcao-h2.md` — usa `qualificador-h2.md`

### Output — atualizar `file/handoff-ativo.md`

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
  - anchor_type: ""   # target | brand | misc
    destino: ""
notas_arquiteto: ""
```

### Gate 2 — Aprovação humana

```
[ ] H1 aprovado
[ ] Slug aprovado
[ ] Estrutura de H2s aprovada (com possíveis ajustes)
[ ] Layout confirmado
```

Após aprovação → iniciar Fase 3 em nova sessão.

---

## FASE 3 — Redação

**Sessão C | Modelo recomendado: Claude Sonnet 4.6 (escrita criativa e qualidade)**

### Carregar nesta sessão

Obrigatórios:
```
squads/squad-oportunidades/agents/@copywriter-pilarpage.md
squads/squad-oportunidades/skill/introdução.md
squads/squad-oportunidades/skill/texto-ancora.md
squads/squad-oportunidades/file/anchor-master.md
squads/squad-oportunidades/file/handoff-ativo.md   ← output da Fase 2
```

Condicional por nicho (carregar apenas 1):
```
SE nicho=maquininha  → skill/copy-maquininha.md + skill/box-maquininha.md
SE nicho=contabilidade → skill/copy-contabilidade.md + data/erp-afiliados.md
SE nicho=outro       → skill/copy-negociocerto.md
```

**NÃO carregar:** @arquiteto, @estrategista, otimizador-h1, qualificador-h2,
construtor-slug, modelo-html (só carregar se confirmar tabelas no artigo)

### O que acontece

O `@copywriter-pilarpage` executa `task/redigir-artigo.md` usando o briefing completo
do handoff da Fase 2. Segue regras mecânicas do agente + skill de nicho.

### Output — atualizar `file/handoff-ativo.md`

```yaml
fase: 3→3.5
arquivo_gerado: "src/pages/[slug].astro"
tem_tabela_html: false
tem_grid_comparativo: false
tem_box_produto: false
precisa_revisao_design: false
elementos_visuais:
  - tipo: ""          # table | contabilidade-container | box-maquininha
    localizacao: ""
notas_copywriter: ""
```

**Se `precisa_revisao_design: false` → pular para Fase 4 diretamente.**

---

## FASE 3.5 — Revisão de Design (condicional)

**Sessão D | Condição: `precisa_revisao_design: true` no handoff**
**Modelo recomendado: Claude Haiku 4.5 (validação de checklist)**

### Carregar nesta sessão
```
squads/squad-oportunidades/agents/@revisor-design.md
squads/squad-oportunidades/skill/tabela-responsiva.md
squads/squad-oportunidades/data/modelo-html.md
squads/squad-oportunidades/file/handoff-ativo.md   ← output da Fase 3
src/pages/[slug].astro                              ← artigo gerado
```

**NÃO carregar:** Nenhum agente anterior

### Veredictos
- **APROVADO** → Fase 4
- **AJUSTE NECESSÁRIO** → retornar ao copywriter (máx 2 iterações; reabrir Sessão C apenas com o arquivo .astro)
- **BLOQUEADO** → escalar para dono do projeto

---

## FASE 4 — Publicação

Seguir `configuracoes/checklistfinal.md`:

```
[ ] Página do autor atualizada com o novo artigo
[ ] Post adicionado na categoria/subcategoria correta do header
[ ] Imagem de capa criada (contentlayout e bloglayout)
[ ] Artigo acessível na URL /[slug]/
[ ] Title Tag e meta description presentes no frontmatter
```

---

## Economia de tokens por fase

| Fase | Tokens carregados | Redução vs. sessão única |
|------|-------------------|--------------------------|
| Fase 1 (Haiku) | ~7.500 | — |
| Fase 2 (Haiku) | ~17.000 | — |
| Fase 3 (Sonnet) | ~28.000 | — |
| Fase 3.5 (Haiku) | ~15.000 | — |
| **Total acumulado** | **~67.500** | — |
| **Pico por sessão** | **~28.000** | **-57% vs. 65K anterior** |

O modelo caro (Sonnet) só é acionado na Fase 3. Haiku cobre as fases
de pesquisa, estrutura e revisão — reduzindo custo em ~70%.

---

## Notas importantes

- **Cluster não faz parte deste pipeline** — workflow separado sob demanda com `@cluster-pilarpage`
- **Handoff-ativo.md é sobrescrito a cada fase** — manter apenas o output mais recente
- **Links internos** são responsabilidade do copywriter (Fase 3), não do arquiteto
- **Nenhum agente escreve antes do Gate 2** — redação sem estrutura aprovada gera retrabalho
