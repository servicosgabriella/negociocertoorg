---
workflow: Pipeline de Conteúdo SEO
version: 1.0.0
squad: squad-conteudo
orquestrador: "@head-de-conteudo"
max_iteracoes_revisao: 3
---

# Pipeline de Conteúdo SEO

Workflow completo de produção de artigos SEO para MEIs, empreendedores e microempreendedores brasileiros.

## Diagrama

```
ENTRADA: keyword
    │
    ▼
┌──────────────────────────────────────┐
│  @head-de-conteudo                   │
│  1. Classifica intenção              │◄── OBRIGATÓRIO antes de qualquer delegação
│     Info / Comercial / Trans         │
│  2. Determina layout Astro:          │
│     - Info/Nav   → bloglayout.astro  │
│     - Com/Trans + review             │
│                  → reviewlayout.astro│
│     - Com/Trans + sem review         │
│                  → contentlayout.astro│
└────────────┬─────────────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  @pesquisador-seo           │
│  3. Extrai H2s do PAA       │◄── Nunca inventa H2s
│  4. Valida cada H2          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  @head-de-conteudo          │
│  5. Valida H2s recebidos    │
│  6. Cria briefing completo  │
│     (inclui layout Astro)   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  @copywriter-seo            │
│  7. Redige artigo           │◄── Aplica Regras #2, #4, #6
│     + frontmatter c/ layout │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  @revisor-design  (CONDICIONAL)             │
│  7.5. Revisa tabelas e componentes visuais  │◄── Só executa se artigo tem tabela/grid
│       Desktop (1440px) + Mobile (390px)     │    Se não tem → pular para @qa-conteudo
│       Veredicto: APROVADO / AJUSTE /        │
│       BLOQUEADO (máx 2 iterações)           │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  @qa-conteudo               │
│  8. Audita layout + 14pts   │◄── Aplica Regras #3, #11 + layout check
└────────────┬────────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
APROVADO          VETADO (max 3x)
     │               │
     ▼               └──► @copywriter-seo corrige
     │                    └──► @qa-conteudo reaudita
     ▼
┌────────────────────────────────────────┐
│  Pós-Publicação (condicional)          │
│  SE reviewlayout ou contentlayout:     │
│  9. gabriella-fernandes.astro          │◄── Adicionar no array articles
│     → novo objeto em articles[]        │
│  10. src/data/estrutura.ts             │◄── Registrar no header do site
│      → nova entrada em paginas[]       │
│      da subcategoria correta           │
│                                        │
│  SE bloglayout: PULAR este bloco       │
└────────────────┬───────────────────────┘
                 │
                 ▼
           PUBLICAÇÃO
```

## Agentes e Responsabilidades

| Agente | Heurísticas Injetadas | Responsabilidade |
|--------|----------------------|-----------------|
| `@head-de-conteudo` | Regra #5 (Intenção de Busca) + Layouts Astro | Orquestração + classificação + seleção de layout |
| `@pesquisador-seo` | Regra #1 (H2s do PAA) | Pesquisa + validação de H2s |
| `@copywriter-seo` | Regras #2, #4, #6 (Tom, Estrutura, Ritmo) | Redação + frontmatter com layout |
| `@revisor-design` | Padrões HTML do projeto + responsividade | Revisão visual de tabelas/grids — desktop e mobile (condicional) |
| `@qa-conteudo` | Regras #3, #11 (Lista Negra, Checklist) + Layout check | Auditoria + veto (inclui layout) |

## Regra de Seleção de Layout

| Intenção | É review? | Layout obrigatório |
|----------|-----------|--------------------|
| Informacional | — | `bloglayout.astro` |
| Navegacional | — | `bloglayout.astro` |
| Comercial | Sim | `reviewlayout.astro` |
| Comercial | Não | `contentlayout.astro` |
| Transacional | Sim | `reviewlayout.astro` |
| Transacional | Não | `contentlayout.astro` |

**"É review?"** = keyword indica comparação, ranking ou avaliação de múltiplos itens: "melhores", "top X", "vs", "comparativo", "qual escolher".

## Tasks Envolvidas

> **Este documento é referência visual.** A task executável é `tasks/orquestrar-pauta.md`.

1. `orquestrar-pauta.md` — Orquestrador (task principal, dispara todo o pipeline)
2. `pesquisar-pauta.md` — Pesquisa de H2s no Google
3. `redigir-artigo.md` — Redação do conteúdo
4. `auditar-artigo.md` — Auditoria de qualidade
5. `gerar-capa.md` — Geração de imagem de capa
6. `montar-arquivo.md` — Criação do arquivo com frontmatter correto
7. `git-publicar.md` — Commit e delegação de push para @devops
8. `atualizar-pos-publicacao.md` — Atualiza autor e estrutura (condicional: review e content layouts)

## Acionamento

```
@head-de-conteudo
*nova-pauta "melhores maquininhas para MEI"
```

ou diretamente:

```
@head-de-conteudo
*orquestrar-pauta "melhores maquininhas para MEI"
```
