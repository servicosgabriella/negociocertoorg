---
workflow: pipeline-pilarpage-gemini
title: Pipeline Pillar Page — Variante Gemini
squad: squad-oportunidades
description: >
  Variante do pipeline principal que usa Gemini 2.0 Flash nas fases analíticas
  (1, 2 e 3.5) para reduzir custo. Fase 3 (redação) permanece no Claude Sonnet.
  Para reverter: usar workflow/pipeline-pilarpage.md (original intacto).
modelo_por_fase:
  fase_1: gemini-2.5-flash
  fase_2: gemini-2.5-flash
  fase_3: claude-sonnet-4-6  # não muda
  fase_35: gemini-2.5-flash
---

# Pipeline Gemini — Pillar Page Monetizável

## Como funciona

Claude atua como **orquestrador**:
1. Lê as definições dos agentes e skills
2. Monta o prompt completo para o Gemini
3. Chama a API via `skill/api-gemini.md`
4. Recebe o output estruturado
5. Grava em `file/handoff-ativo.md`

A Fase 3 (redação) é aberta em sessão separada no Claude Sonnet — igual ao pipeline original.

---

## FASE 1 — Descoberta via Gemini

**Executor:** Claude (orquestrador) → Gemini 2.0 Flash (processamento)

### Passo 1 — Verificar chave

```bash
echo $GOOGLE_API_KEY | cut -c1-8
```

Se vazia: parar e pedir ao usuário para configurar `GOOGLE_API_KEY`.

### Passo 2 — Executar buscas reais (ValueSERP)

Antes de chamar o Gemini, executar as buscas de SERP normalmente via `skill/google-search.md`.
O Gemini fará a análise dos dados — não as buscas. Buscas sempre via ValueSERP.

```bash
# Coletar dados da SERP conforme skill/google-search.md
# Salvar os resultados em variável SERP_DATA
```

### Passo 3 — Montar prompt e chamar Gemini

```bash
# Ler definição do agente e task
AGENT=$(cat squads/squad-oportunidades/agents/@estrategista-buscas.md)
TASK=$(cat squads/squad-oportunidades/task/search-oportunidade.md)

# Montar prompt completo
PROMPT="$AGENT

---

$TASK

---

## Dados da SERP coletados via ValueSERP

$SERP_DATA

---

## Instrução de execução

Execute a metodologia completa de score (Passos 2, 3 e 4 da sua definição).
Retorne as 3 melhores oportunidades no formato estruturado exato definido no Passo 4.
Use APENAS os dados da SERP fornecidos acima — não invente URLs ou posições."

# Chamar Gemini
RESPONSE=$(curl -s \
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{\"parts\": [{\"text\": $(echo "$PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}]}],
    \"generationConfig\": {\"temperature\": 0.1, \"maxOutputTokens\": 4096}
  }")

# Extrair output
echo "$RESPONSE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'candidates' in d:
    print(d['candidates'][0]['content']['parts'][0]['text'])
else:
    print('ERRO:', json.dumps(d, indent=2))
"
```

### Passo 4 — Gravar handoff após aprovação do Gate 1

Após o dono do projeto aprovar a oportunidade, gravar em `file/handoff-ativo.md`:

```yaml
fase: 1→2
oportunidade_aprovada:
  keyword: ""
  score: ""
  angulo_sugerido: ""
  nicho: ""
urls_concorrentes:
  - url: ""
    posicao_serp: ""
  - url: ""
    posicao_serp: ""
  - url: ""
    posicao_serp: ""
notas_estrategista: ""
gerado_por: gemini-2.5-flash
```

---

## FASE 2 — Arquitetura via Gemini

**Executor:** Claude (orquestrador) → Gemini 2.0 Flash (processamento)

### Passo 1 — Ler handoff da Fase 1

```bash
cat squads/squad-oportunidades/file/handoff-ativo.md
```

### Passo 2 — Acessar URLs dos concorrentes

Claude acessa as URLs da SERP via WebFetch/playwright para extrair H1s, H2s, H3s, termos em negrito e anchor texts. Salvar os dados em `COMPETITOR_DATA`.

### Passo 3 — Montar prompt e chamar Gemini

```bash
# Ler definição do agente e skills
AGENT=$(cat squads/squad-oportunidades/agents/@arquiteto-pilarpage.md)
SKILL_H1=$(cat squads/squad-oportunidades/skill/otimizador-h1.md)
SKILL_H2=$(cat squads/squad-oportunidades/skill/qualificador-h2.md)
SKILL_SLUG=$(cat squads/squad-oportunidades/skill/construtor-slug.md)
HANDOFF=$(cat squads/squad-oportunidades/file/handoff-ativo.md)

# Montar prompt completo
PROMPT="$AGENT

---

## Skills disponíveis

### otimizador-h1.md
$SKILL_H1

### qualificador-h2.md
$SKILL_H2

### construtor-slug.md
$SKILL_SLUG

---

## Handoff da Fase 1

$HANDOFF

---

## Dados dos concorrentes (extraídos das URLs)

$COMPETITOR_DATA

---

## Instrução de execução

Execute as 4 tasks em sequência:
1. Mapeamento semântico (tabela de gaps)
2. H1 + Title Tag usando otimizador-h1.md
3. Slug usando construtor-slug.md
4. Estrutura de H2s usando qualificador-h2.md

Retorne o briefing completo no formato YAML definido no output da Fase 2
do pipeline-pilarpage.md (keyword, h1, title_tag, slug, layout, variacoes_semanticas, h2s, gaps_prioritarios)."

# Chamar Gemini
RESPONSE=$(curl -s \
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{\"parts\": [{\"text\": $(echo "$PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}]}],
    \"generationConfig\": {\"temperature\": 0.2, \"maxOutputTokens\": 6144}
  }")

# Extrair output
echo "$RESPONSE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'candidates' in d:
    print(d['candidates'][0]['content']['parts'][0]['text'])
else:
    print('ERRO:', json.dumps(d, indent=2))
"
```

### Passo 4 — Gravar handoff após aprovação do Gate 2

```yaml
fase: 2→3
keyword: ""
nicho: ""
h1: ""
title_tag: ""
slug: ""
layout: ""
variacoes_semanticas:
  - ""
h2s:
  - titulo: ""
    tipo: ""
    h3s:
      - ""
gaps_prioritarios:
  - ""
links_internos_sugeridos:
  - anchor_type: ""
    destino: ""
notas_arquiteto: ""
gerado_por: gemini-2.5-flash
```

---

## FASE 3 — Redação (Claude Sonnet — sem mudança)

**Esta fase é idêntica ao `pipeline-pilarpage.md` original.**

Abrir nova sessão no Claude Sonnet. Carregar:

```
squads/squad-oportunidades/agents/@copywriter-pilarpage.md
squads/squad-oportunidades/skill/copy-[NICHO].md   ← 1 skill pelo nicho do handoff
squads/squad-oportunidades/skill/introdução.md
squads/squad-oportunidades/skill/texto-ancora.md
squads/squad-oportunidades/file/anchor-master.md
squads/squad-oportunidades/file/handoff-ativo.md   ← briefing completo da Fase 2
```

Ver instruções completas em `workflow/pipeline-pilarpage.md` — seção FASE 3.

---

## FASE 3.5 — Revisão de Design via Gemini (condicional)

**Condição:** `precisa_revisao_design: true` no handoff da Fase 3
**Executor:** Claude (orquestrador) → Gemini 2.0 Flash (validação)

### Passo 1 — Ler artigo gerado e handoff

```bash
HANDOFF=$(cat squads/squad-oportunidades/file/handoff-ativo.md)
ARTIGO=$(cat src/pages/[slug].astro)   # substituir [slug] pelo valor real
```

### Passo 2 — Montar prompt e chamar Gemini

```bash
AGENT=$(cat squads/squad-oportunidades/agents/@revisor-design.md)
SKILL_TABELA=$(cat squads/squad-oportunidades/skill/tabela-responsiva.md)
MODELO_HTML=$(cat squads/squad-oportunidades/data/modelo-html.md)

PROMPT="$AGENT

---

## Skills de referência

### tabela-responsiva.md
$SKILL_TABELA

### modelo-html.md
$MODELO_HTML

---

## Handoff da Fase 3

$HANDOFF

---

## Artigo a revisar

$ARTIGO

---

## Instrução de execução

Execute a revisão completa conforme sua metodologia:
1. Identificar todos os elementos visuais
2. Classificar tipo (A = table HTML | B = contabilidade-container)
3. Verificar checklist de responsividade e estrutura
4. Emitir veredicto: APROVADO | AJUSTE NECESSÁRIO | BLOQUEADO

Para cada problema encontrado: localização exata + correção específica."

# Chamar Gemini (temperatura 0 — checklist binário)
RESPONSE=$(curl -s \
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{\"parts\": [{\"text\": $(echo "$PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}]}],
    \"generationConfig\": {\"temperature\": 0.0, \"maxOutputTokens\": 2048}
  }")

echo "$RESPONSE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'candidates' in d:
    print(d['candidates'][0]['content']['parts'][0]['text'])
else:
    print('ERRO:', json.dumps(d, indent=2))
"
```

### Veredictos
- **APROVADO** → Fase 4
- **AJUSTE NECESSÁRIO** → aplicar correções e re-executar Fase 3.5 (máx 2x)
- **BLOQUEADO** → escalar para dono do projeto

---

## FASE 4 — Publicação

Idêntica ao pipeline original. Ver `configuracoes/checklistfinal.md`.

---

## Como reverter para o pipeline original

```
Simplesmente usar workflow/pipeline-pilarpage.md em vez deste arquivo.
Nenhum arquivo original foi modificado.
```

Para remover esta variante completamente:
```bash
rm squads/squad-oportunidades/workflow/pipeline-pilarpage-gemini.md
rm squads/squad-oportunidades/skill/api-gemini.md
```

---

## Custo estimado por artigo completo

| Fase | Modelo | Tokens aprox. | Custo estimado |
|------|--------|---------------|----------------|
| Fase 1 | Gemini 2.0 Flash | ~7.500 | ~$0,001 |
| Fase 2 | Gemini 2.0 Flash | ~17.000 | ~$0,003 |
| Fase 3 | Claude Sonnet 4.6 | ~28.000 | ~$0,084 |
| Fase 3.5 | Gemini 2.0 Flash | ~15.000 | ~$0,002 |
| **Total** | — | **~67.500** | **~$0,090** |

Comparado com pipeline monolítico no Sonnet (~65K tokens): **~$0,200 → $0,090 = -55% de custo**
