# Diagnóstico — Squad de Conteúdo SEO
**Data:** 2026-03-15
**Agente:** Craft (squad-creator)
**Status:** CRÍTICO — Refatoração recomendada antes da próxima pauta

---

## Resumo Executivo

O squad está funcional mas possui **4 problemas estruturais graves** que comprometem automação, manutenção e consistência. A causa raiz é a ausência de um "single source of truth": regras críticas estão espalhadas e duplicadas por múltiplos arquivos, criando inconsistências silenciosas e overhead operacional.

---

## Problema 1 — Duplicação Massiva de Regras

### Gravidade: 🔴 CRÍTICA

A mesma informação existe em múltiplos arquivos sem referência cruzada. Quando uma regra muda, precisa ser atualizada em vários lugares — e raramente é.

### Ocorrências mapeadas

**Blacklist de linguagem (conectores e clichês):**
| Arquivo | Localização |
|---|---|
| `config/coding-standards.md` | Seção "Proibições Absolutas" |
| `agents/copywriter-seo.md` | Regra #5 |
| `agents/qa-conteudo.md` | Regra #3 (Rule #3) |
| `tasks/auditar-artigo.md` | Seção de audit |
| `checklists/checklist-pre-publicacao.md` | Seção "Estilo — Blacklist" |

**→ A mesma lista de 11 conectores + 7 clichês aparece 5 vezes.**

**Checklist de 14 pontos:**
| Arquivo | Localização |
|---|---|
| `agents/qa-conteudo.md` | Rule #11 |
| `tasks/auditar-artigo.md` | Seção principal |
| `checklists/checklist-pre-publicacao.md` | Arquivo inteiro |

**→ O mesmo checklist existe em 3 arquivos.**

**Regras de slug/URL:**
| Arquivo | Localização |
|---|---|
| `agents/qa-conteudo.md` | Rule #10 |
| `agents/copywriter-seo.md` | Rule #10 |
| `tasks/redigir-artigo.md` | Seção "Definição do Slug" |
| `tasks/auditar-artigo.md` | Primeiro item do audit |
| `checklists/checklist-pre-publicacao.md` | Seção "URL/Slug" |

**→ A mesma regra de slug aparece 5 vezes.**

**Pipeline de orquestração:**
| Arquivo | Conteúdo |
|---|---|
| `tasks/orquestrar-pauta.md` | Pipeline de 8 passos |
| `workflows/pipeline-conteudo.md` | O mesmo pipeline de 8 passos |

**→ Dois arquivos descrevem o mesmo fluxo sem distinção clara.**

---

## Problema 2 — Checklists Desorganizados

### Gravidade: 🔴 CRÍTICA

O checklist de pré-publicação mistura responsabilidades de diferentes agentes sem separação clara de **quando** e **por quem** cada item é executado.

### Issues identificados

**Mistura de responsabilidades no `checklist-pre-publicacao.md`:**
- Itens de QA (blacklist, ritmo) → responsabilidade do `@qa-conteudo`
- Itens de SEO (slug, meta description) → responsabilidade do `@copywriter-seo`
- Itens de publicação (commit, push) → responsabilidade do `@devops`
- Itens pós-publicação (atualizar gabriella-fernandes.astro) → responsabilidade do `@head-de-conteudo`
- Tudo numa lista única sem separação de agente/fase

**Checklist não é referenciado pela task — é duplicado:**
- `tasks/auditar-artigo.md` não importa `checklist-pre-publicacao.md`
- Reescreve o conteúdo inline
- Divergências silenciosas podem (e vão) acontecer

**Ausência de checklist de research:**
- Não há checklist validando se os H2s vieram de fontes reais do Google
- O `@pesquisador-seo` não tem checklist de entrega definido

---

## Problema 3 — Pipeline Não é Totalmente Automático

### Gravidade: 🟠 ALTA

O pipeline foi desenhado como uma sequência de delegações manuais. Não há handoff estruturado de contexto entre agentes, nem comandos que disparam a cadeia completa.

### Gaps de automação

**Sem handoff de output entre tasks:**
- `pesquisar-pauta.md` produz um output (H2s, gaps, variações semânticas)
- `redigir-artigo.md` espera um "briefing" como input
- Não há formato padronizado de transição — o `@head-de-conteudo` precisa traduzir manualmente

**Comando `*nova-pauta` não dispara a cadeia:**
- O `@head-de-conteudo` tem `*nova-pauta` mas o agente precisa manualmente chamar cada step
- Não existe um modo YOLO equivalente para o pipeline completo

**`publicar-artigo.md` faz 6 coisas diferentes:**
1. Gera capa (lógica de imagem)
2. Prepara frontmatter (lógica de conteúdo)
3. Cria/atualiza o arquivo .md
4. Atualiza `gabriella-fernandes.astro` (lógica de layout)
5. Atualiza `estrutura.ts` (lógica de navegação)
6. Faz git add/commit e delega push

**→ Uma task monolítica com 6 responsabilidades distintas.**

**`atualizar-pos-publicacao.md` existe como task separada mas também está em `publicar-artigo.md`:**
- Duplicação de lógica de atualização de arquivos `.astro` e `.ts`
- Quando executar uma vs. a outra não é claro

**Iterações de revisão sem estado:**
- O pipeline define "max 3 ciclos de revisão"
- Não há mecanismo para rastrear em qual ciclo está
- Não há formato de feedback estruturado do `@qa-conteudo` para o `@copywriter-seo`

---

## Problema 4 — Estilo de Linguagem Fragmentado

### Gravidade: 🟠 ALTA

As regras de estilo estão fragmentadas entre `estilo-blog.md` e `coding-standards.md`, sem hierarquia clara. Os agentes absorvem partes diferentes, criando inconsistências.

### Fragmentação mapeada

| Regra | `estilo-blog.md` | `coding-standards.md` | Agente |
|---|---|---|---|
| Proibição de travessão | ✅ | ✅ | ✅ (copywriter + qa) |
| Tom 80/20 | ❌ | ✅ | ✅ (copywriter) |
| Pronome "você" | ❌ | ✅ | ✅ (copywriter) |
| H2s do Google | ❌ | ✅ | ✅ (pesquisador) |
| Ritmo anti-escada | ✅ | ❌ | ✅ (copywriter) |
| Conectores banidos | ❌ | ✅ | ✅ (qa + copywriter) |
| Estrutura de parágrafos | ✅ | ❌ | ❌ (não injetado) |

**Problemas derivados:**
- `estilo-blog.md` foca em estrutura do artigo; `coding-standards.md` foca em linguagem — mas há overlap
- Regras de estrutura de parágrafo existem em `estilo-blog.md` mas não são injetadas em nenhum agente de forma explícita
- O `@copywriter-seo` recebe instrução para ler `estilo-blog.md` antes de escrever — mas isso é instrução manual, não automática

### Ausência de vocabulário positivo
- O estilo define muito o que **não fazer** (blacklist)
- Não define o que **fazer**: exemplos de abertura, estruturas de frase aprovadas, modelos de parágrafo "certo"

---

## Problema 5 — Agentes com Regras Hardcoded

### Gravidade: 🟡 MÉDIA

Cada agente carrega suas próprias cópias de regras críticas no corpo do arquivo. Isso cria agentes pesados e dificulta atualizações.

### Exemplos

**`@head-de-conteudo.md`** tem:
- Tabela de seleção de layout (3 linhas) — também está em `orquestrar-pauta.md`
- Template de briefing inline — não está em nenhum template separado
- Lista de responsabilidades exclusivas que overlapa com `orquestrar-pauta.md`

**`@qa-conteudo.md`** tem:
- Regra #11 com 14 itens inline — duplica `checklist-pre-publicacao.md`
- Regra #3 com blacklist inline — duplica `coding-standards.md`
- Protocolo de veto inline — não referencia nenhum template

**`@copywriter-seo.md`** tem:
- 3 estruturas de introdução com exemplos inline — duplica `redigir-artigo.md`
- Regras de slug inline — duplica `auditar-artigo.md`
- Regra de destino de arquivo por layout — duplica `publicar-artigo.md`

---

## Mapa de Dependências (estado atual)

```
estilo-blog.md ──────────────────────────────────────┐
coding-standards.md ──────────────────────────────── │ (sem refs cruzadas)
                                                      ↓
copywriter-seo.md ──── regras hardcoded ────────────────────────────────────┐
qa-conteudo.md ──────── regras hardcoded ────────────────────────────────── │
head-de-conteudo.md ─── regras hardcoded ────────────────────────────────── │
pesquisador-seo.md ──── regras hardcoded ────────────────────────────────── │
                                                                             │
orquestrar-pauta.md ─────────────────────────────────────────────────────── │
pipeline-conteudo.md ─── (mesmo conteúdo) ───────────────────────────────── │
                                                                             ↓
auditar-artigo.md ───── 14-point checklist ──────────────────────────────────┐
checklist-pre-publicacao.md ── 14-point checklist ───────────────────────── │ (duplicados)
                                                                             ↘
                                                              múltiplos pontos de falha
```

---

## Recomendações de Refatoração

### Prioridade 1 — Criar Single Sources of Truth

| Arquivo a criar | Consolida |
|---|---|
| `config/style-guide.md` | `estilo-blog.md` + partes de `coding-standards.md` |
| `config/blacklist.md` | Todos os conectores/clichês banidos (único lugar) |
| `config/slug-rules.md` | Todas as regras de URL (único lugar) |
| `templates/briefing-tmpl.md` | Template de briefing do head para copywriter |
| `templates/feedback-qa-tmpl.md` | Template de veto/aprovação do qa |

### Prioridade 2 — Unificar Pipeline

| Ação | Detalhe |
|---|---|
| Remover `workflows/pipeline-conteudo.md` | `orquestrar-pauta.md` é o canonical |
| Quebrar `publicar-artigo.md` em 3 tasks | `gerar-capa.md` (já existe) + `montar-arquivo.md` + `git-publicar.md` |
| Definir formato de handoff entre tasks | Output de `pesquisar-pauta.md` → input de `redigir-artigo.md` |

### Prioridade 3 — Refatorar Checklists

| Ação | Detalhe |
|---|---|
| `auditar-artigo.md` deve referenciar `checklist-pre-publicacao.md` | Não duplicar |
| Separar checklist por agente/fase | QA checklist ≠ publicação checklist ≠ SEO checklist |
| Criar `checklists/checklist-research.md` | Validação de entrega do pesquisador |

### Prioridade 4 — Limpar Agentes

| Ação | Detalhe |
|---|---|
| Remover blacklist inline dos agentes | Referenciar `config/blacklist.md` |
| Remover checklist inline de `@qa-conteudo` | Referenciar `checklist-pre-publicacao.md` |
| Remover regras de slug dos agentes | Referenciar `config/slug-rules.md` |
| Adicionar vocabulário positivo ao style-guide | Exemplos do que fazer, não só do que evitar |

---

## Score de Saúde Atual

| Dimensão | Score | Observação |
|---|---|---|
| Automação | 4/10 | Pipeline manual, sem handoffs estruturados |
| Organização | 3/10 | Duplicação em 5+ lugares por regra |
| Estilo de linguagem | 5/10 | Regras existem mas fragmentadas e sem exemplos positivos |
| Manutenibilidade | 2/10 | Mudar 1 regra requer editar 5 arquivos |
| Clareza de responsabilidades | 6/10 | Agentes têm escopo definido, mas tasks se sobrepõem |
| **TOTAL** | **4/10** | Funcional mas frágil |

---

## Próximos Passos

1. `*extend-squad squad-conteudo` — adicionar templates de handoff e feedback
2. Consolidar regras de estilo em `config/style-guide.md`
3. Criar `config/blacklist.md` como single source of truth
4. Refatorar `auditar-artigo.md` para referenciar checklist (não duplicar)
5. Quebrar `publicar-artigo.md` em tasks atômicas
6. Adicionar vocabulário positivo e exemplos aprovados ao style-guide

---

*Diagnóstico gerado por Craft (squad-creator) — 2026-03-15*
