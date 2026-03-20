---
task: Orquestrar Pauta
responsavel: "@head-de-conteudo"
responsavel_type: agent
atomic_layer: workflow
Entrada: |
  - keyword: Palavra-chave principal da pauta (obrigatório)
  - contexto: Informações adicionais sobre o público ou ângulo (opcional)
Saida: |
  - artigo: Artigo completo aprovado pelo @qa-conteudo em Markdown
  - metadados: keyword, intenção classificada, layout Astro, H2s, tamanho final
  - gabriella-fernandes.astro: atualizado (se layout != bloglayout.astro)
  - estrutura.ts: atualizado com entrada na subcategoria correta (se layout != bloglayout.astro)
Checklist:
  - "[ ] Keyword recebida e validada"
  - "[ ] Intenção de busca classificada (Informacional/Comercial/Transacional/Navegacional)"
  - "[ ] Layout Astro determinado (bloglayout | reviewlayout | contentlayout)"
  - "[ ] @pesquisador-seo acionado com keyword + tipo de intenção"
  - "[ ] H2s recebidos e validados (todos com fonte real)"
  - "[ ] Briefing completo enviado para @copywriter-seo (inclui layout)"
  - "[ ] Artigo recebido do @copywriter-seo com frontmatter correto"
  - "[ ] Artigo enviado para @qa-conteudo"
  - "[ ] Veredicto recebido: APROVADO ou VETADO"
  - "[ ] Se VETADO: feedback enviado para @copywriter-seo e ciclo reiniciado"
  - "[ ] Artigo final entregue com layout correto"
  - "[ ] Capa gerada: npm run gerar-imagem -- --slug ... --topico ..."
  - "[ ] Caminho da capa adicionado ao frontmatter do artigo"
  - "[ ] Se reviewlayout ou contentlayout: gabriella-fernandes.astro atualizado"
  - "[ ] Se reviewlayout ou contentlayout: estrutura.ts atualizado na subcategoria correta"
---

# *orquestrar-pauta

Executa o pipeline completo de produção de conteúdo para uma keyword, do briefing até a aprovação final.

## Uso

```
@head-de-conteudo

# Modo padrão — Claude executa pesquisa e redação
*orquestrar-pauta melhores maquininhas para MEI
*orquestrar-pauta "como abrir MEI" --contexto "público iniciante, nunca formalizou"

# Modo Gemini — Gemini executa pesquisa e redação, Claude revisa
*orquestrar-pauta melhores maquininhas para MEI --via-gemini
```

### Modo `--via-gemini`

Quando a flag `--via-gemini` for fornecida, o pipeline substitui os Passos 2 e 4 por execução via Gemini API, com revisão obrigatória do Claude antes do QA.

| Passo | Modo padrão | Modo `--via-gemini` |
|-------|-------------|---------------------|
| 2 — Pesquisa | `@pesquisador-seo` → `*pesquisar-pauta` | `*gemini-pesquisar` (script) |
| 3 — Validar H2s | `@head-de-conteudo` valida | `@head-de-conteudo` valida (igual) |
| 4 — Redação | `@copywriter-seo` → `*redigir-artigo` | `*gemini-redigir` (script + revisão Claude) |
| 5 — QA | `@qa-conteudo` → `*auditar-artigo` | `@qa-conteudo` → `*auditar-artigo` (igual) |

**Fallback automático:** se qualquer script Gemini falhar, o @head-de-conteudo executa a task Claude nativa correspondente e o pipeline continua.

## Sequência de Execução

### Passo 1 — Classificar Intenção de Busca e Definir Layout

O `@head-de-conteudo` analisa a keyword e classifica:
- **Informacional** → guia, tutorial, explicação
- **Navegacional** → landing page (não usa este pipeline)
- **Comercial** → comparativo, review, top X
- **Transacional** → produto, preços

Em seguida, determina o layout Astro obrigatório:

| Intenção | É review? | Layout |
|----------|-----------|--------|
| Informacional | — | `bloglayout.astro` |
| Navegacional | — | `bloglayout.astro` |
| Comercial | Sim | `reviewlayout.astro` |
| Comercial | Não | `contentlayout.astro` |
| Transacional | Sim | `reviewlayout.astro` |
| Transacional | Não | `contentlayout.astro` |

**"É review?"** = keyword contém "melhores", "top X", "comparativo", "vs", "qual escolher" ou similar.

### Passo 2 — Delegar Pesquisa

**Modo padrão:** `@head-de-conteudo` → `@pesquisador-seo` → `*pesquisar-pauta`

**Modo `--via-gemini`:** executar `*gemini-pesquisar`:
```bash
node squads/squad-conteudo/tools/gemini-pesquisar.js \
  --keyword "{{keyword}}" \
  --intencao {{intencao}} \
  > /tmp/pesquisa-{{slug}}.md
```
Se exit code 1 → fallback: `@pesquisador-seo` → `*pesquisar-pauta` (continuar normalmente).

Inputs (ambos os modos):
- Keyword principal
- Tipo de intenção classificada

### Passo 3 — Validar H2s

`@pesquisador-seo` → `@head-de-conteudo`:
- Lista de H2s com fonte (PAA / relacionadas / autocomplete / concorrentes)
- `@head-de-conteudo` valida: todos têm fonte real? Nenhum genérico proibido?

### Passo 4 — Criar Briefing e Delegar Redação

`@head-de-conteudo` cria o briefing (usando `templates/briefing-tmpl.md`) com:
- Keyword + variações semânticas
- Intenção classificada
- **Layout Astro obrigatório** (`bloglayout.astro` | `reviewlayout.astro` | `contentlayout.astro`)
- Estrutura de introdução recomendada
- H2s em ordem
- Tamanho alvo
- Pontos obrigatórios

**Modo padrão:** briefing entregue ao `@copywriter-seo` → `*redigir-artigo`

**Modo `--via-gemini`:**
1. Salvar briefing em arquivo temporário: `/tmp/briefing-{{slug}}.md`
2. Executar `*gemini-redigir`:
```bash
node squads/squad-conteudo/tools/gemini-redigir.js \
  --briefing /tmp/briefing-{{slug}}.md \
  > /tmp/artigo-gemini-{{slug}}.md
```
3. Claude lê `/tmp/artigo-gemini-{{slug}}.md` e aplica **revisão editorial** (ver `tasks/gemini-redigir.md` Passo 3):
   - Verificar e corrigir violações da blacklist
   - Remover travessões (—) no meio de frases
   - Corrigir efeito escada no ritmo
   - Validar frontmatter e slug
   - Gerar nota de revisão com total de correções
4. Se exit code 1 → fallback: `@copywriter-seo` → `*redigir-artigo` (continuar normalmente)

### Passo 5 — Auditoria

Artigo completo em Markdown (revisado pelo Claude se modo `--via-gemini`) → `@qa-conteudo`:
- Artigo completo em Markdown

### Passo 6 — Veredicto

**APROVADO** → seguir para Passo 7

**VETADO** → feedback específico volta para `@copywriter-seo`, ciclo reinicia a partir do Passo 4

### Passo 7 — Gerar Capa (bloglayout e contentlayout)

Executar para artigos com `bloglayout.astro` e `contentlayout.astro`.

`@copywriter-seo` executa `*gerar-capa`:

```bash
npm run gerar-imagem -- --slug "{slug}" --topico "{descrição visual do elemento central}"
```

Após gerado, adicionar `coverImage: "/images/{slug}.png"` ao frontmatter do artigo.

### Passo 8 — Pós-Publicação (condicional)

Executar **somente** quando o layout for `reviewlayout.astro` ou `contentlayout.astro`.
Artigos com `bloglayout.astro` **pulam este passo**.

`@head-de-conteudo` executa task `tasks/atualizar-pos-publicacao.md` com os metadados do artigo publicado (título, descrição, href, data, categoria, subcategoria, label).

## Limites de Iteração

Máximo 3 ciclos de revisão. Após 3 vetos consecutivos, escalar para o usuário com relatório de problemas recorrentes.
