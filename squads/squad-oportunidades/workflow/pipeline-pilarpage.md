---
workflow: pipeline-pilarpage
title: Pipeline Completo de Pillar Page
squad: squad-oportunidades
description: >
  Orquestra o ciclo completo de criação de uma pillar page monetizável — da descoberta
  de oportunidade até a publicação. Envolve 3 agentes em sequência com handoff estruturado
  entre cada fase. O cluster de suporte é um workflow separado (criar-cluster.md).
agents:
  - "@estrategista-buscas"
  - "@arquiteto-pilarpage"
  - "@copywriter-pilarpage"
  - "@revisor-design"
---

# Pipeline — Pillar Page Monetizável

## Visão geral

```
FASE 1: DESCOBERTA      FASE 2: ARQUITETURA     FASE 3: REDAÇÃO         FASE 3.5: DESIGN*    FASE 4: PUBLICAÇÃO
@estrategista-buscas → @arquiteto-pilarpage → @copywriter-pilarpage → @revisor-design     → checklist final
search-oportunidade    mapeamentosematico       redigir-artigo          revisar-design*
                       criar-h1
                       criar-url
                       construcao-h2

* Fase 3.5 só é executada se o artigo contiver tabela ou componente visual estruturado.
```

**Gate entre fases:** Cada fase precisa de aprovação explícita antes de avançar.
O dono do projeto aprova a oportunidade (Gate 1) e a estrutura (Gate 2) antes de redigir.

---

## FASE 1 — Descoberta de Oportunidade

**Agente:** `@estrategista-buscas`
**Task:** `task/search-oportunidade.md`

### O que acontece nesta fase

O estrategista executa a metodologia completa de pesquisa multi-fonte e retorna
as 3 melhores oportunidades de pillar page monetizável, com score detalhado e
URLs dos concorrentes para análise.

### Input
- Acesso ao `src/data/estrutura.ts` para verificar categorias do header
- Contexto de monetização: maquininhas, contabilidade, planilhas (e outros descobertos)

### Output
- 3 oportunidades no formato estruturado (ver `@estrategista-buscas.md`)
- Para cada oportunidade: keyword, score, top 3 URLs da SERP, ângulo sugerido

### Gate 1 — Aprovação do dono do projeto

```
[ ] Dono aprovou qual(is) oportunidade(s) seguir
[ ] URLs dos concorrentes confirmadas para análise
```

Após aprovação → avançar para Fase 2 com a oportunidade selecionada.

---

## FASE 2 — Arquitetura da Página

**Agente:** `@arquiteto-pilarpage`
**Tasks:** `mapeamentosematico.md` → `criar-h1.md` → `criar-url.md` → `construcao-h2.md`
**Skills:** `otimizador-h1.md`, `qualificador-h2.md`, `construtor-slug.md`

### O que acontece nesta fase

O arquiteto executa as 4 tasks em sequência usando as skills corretas em cada etapa.
A saída é um briefing completo para o copywriter.

### Input recebido da Fase 1
- Keyword principal aprovada
- Top 3 URLs da SERP para análise

### Sequência de execução

**Task 1 — Mapeamento Semântico**
Analisar as URLs dos concorrentes e extrair: H1s, H2s, H3s, termos em negrito,
anchor texts, título e meta. Montar tabela de gaps semânticos.

**Task 2 — H1 + Title Tag**
Usar `otimizador-h1.md`: analisar padrão dominante dos concorrentes, identificar
ângulo não explorado, gerar H1 diferenciado + Title Tag otimizada para 580px.

**Task 3 — Slug**
Usar `construtor-slug.md`: construir slug limpo, sem data, sem preposição, verificar
canibalização com páginas existentes no site.

**Task 4 — Estrutura de H2s**
Coletar candidatos das 3 fontes (mapeamento semântico + PAA + autocomplete).
Aplicar `qualificador-h2.md` para filtrar. Construir títulos em cauda longa real.

### Output — Briefing completo
```
Keyword principal: [keyword]
H1: [h1 definido]
Title Tag: [title tag — máx 580px]
Slug: /[slug]/
Layout: [contentlayout | reviewlayout]
Variações semânticas: [lista]
H2s estruturados: [lista com h3s se houver]
Gaps prioritários: [o que cobrir que os concorrentes não cobrem]
```

### Gate 2 — Aprovação da estrutura

```
[ ] H1 aprovado
[ ] Slug aprovado
[ ] Estrutura de H2s aprovada (com possíveis ajustes)
[ ] Layout confirmado
```

Após aprovação → avançar para Fase 3.

---

## FASE 3 — Redação

**Agente:** `@copywriter-pilarpage`
**Task:** `task/redigir-artigo.md`
**Skills (seleção por nicho):**

| Nicho | Skill de copy | Skill de intro |
|---|---|---|
| Maquininhas | `copy-maquininha.md` | `introdução.md` |
| Contabilidade | `copy-contabilidade.md` | `introdução.md` |
| Outros (planilhas, MEI, gestão) | `copy-negociocerto.md` | `introdução.md` |
| Links internos | `texto-ancora.md` + `file/anchor-master.md` | — |

### O que acontece nesta fase

O copywriter recebe o briefing completo da Fase 2 e redige o artigo seguindo:
1. Estrutura de H2s aprovada (não mudar sem aviso)
2. Skill de copy do nicho para tom e vocabulário
3. `introdução.md` para construir o bloco de introdução
4. Regras mecânicas do próprio agente (parágrafos curtos, voz ativa, dados concretos)
5. `texto-ancora.md` + `anchor-master.md` para todos os links internos inseridos

### Regras de links internos durante a redação
Antes de inserir qualquer link interno, consultar `skill/texto-ancora.md` e
verificar o saldo atual em `file/anchor-master.md`. Registrar cada âncora usada
ao final do artigo para manter o controle de proporção.

### Output
- Artigo completo em formato Astro (`.astro`)
- Destino: `src/pages/[slug].astro`
- Para `contentlayout`: acionar `squads/squad-conteudo/tasks/gerar-capa.md` ao final

### Checklist interno do copywriter antes de entregar
```
[ ] Introdução segue uma das 3 estruturas de introdução.md
[ ] Cada H2 tem dado concreto (número, taxa, prazo, comparação)
[ ] Keyword principal aparece naturalmente no primeiro parágrafo
[ ] FAQ com mínimo 5 perguntas incluído
[ ] Nenhum travessão (—) no meio de parágrafos
[ ] Voz ativa em todo o artigo
[ ] Links internos registrados no anchor-master.md
```

---

## FASE 3.5 — Revisão de Design (condicional)

**Agente:** `@revisor-design`
**Task:** `task/revisar-design.md`
**Condição:** Executar SOMENTE se o artigo contiver tabela, grid comparativo ou componente visual estruturado.

### Verificação do gatilho

Antes de acionar o agente, verificar se o artigo contém:
- `<table>` HTML
- `<div class="contabilidade-container">` ou grid comparativo de produtos
- Box de produto ou card de maquininha
- FAQ em HTML estruturado

**Se nenhum desses elementos estiver presente → pular para Fase 4 diretamente.**

### O que acontece nesta fase

O revisor verifica estrutura HTML, responsividade e renderização em desktop (1440px)
e mobile (390px), emitindo um dos três veredictos:

- **APROVADO** → avança para Fase 4
- **AJUSTE NECESSÁRIO** → retorna ao copywriter (máx 2 iterações)
- **BLOQUEADO** → escalar para dono do projeto

---

## FASE 4 — Publicação

**Responsável:** Seguir `configuracoes/checklistfinal.md`

### Checklist de publicação
```
[ ] Página do autor atualizada com o novo artigo
[ ] Post adicionado na categoria/subcategoria correta do header
     (obrigatório para contentlayout e reviewlayout)
[ ] Imagem de capa criada
     (obrigatório para contentlayout e bloglayout)
[ ] Artigo acessível na URL /[slug]/
[ ] Title Tag e meta description presentes no frontmatter do .astro
```

---

## Handoff entre agentes

Ao trocar de agente, passar explicitamente:

**Fase 1 → Fase 2 (estrategista → arquiteto):**
```
Keyword aprovada: [keyword]
URLs para análise:
- [URL 1]
- [URL 2]
- [URL 3]
Ângulo sugerido pelo estrategista: [ângulo]
```

**Fase 2 → Fase 3 (arquiteto → copywriter):**
```
[Briefing completo conforme formato da Fase 2]
Layout: [contentlayout | reviewlayout]
Nicho: [maquininha | contabilidade | outro] → skill de copy correspondente
```

---

## Notas importantes

- **Cluster não faz parte deste pipeline** — é um workflow separado ativado sob demanda
  com `@cluster-pilarpage` quando o dono do projeto quiser fortalecer uma pillar específica

- **O dono do projeto aprova dois gates** antes da redação acontecer — oportunidade e estrutura

- **Nenhum agente escreve antes da Gate 2 ser aprovada** — redação sem estrutura aprovada
  gera retrabalho

- **Links internos são responsabilidade do copywriter** durante a redação, não do arquiteto
