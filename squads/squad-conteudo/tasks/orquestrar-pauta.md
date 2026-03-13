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

*orquestrar-pauta melhores maquininhas para MEI
*orquestrar-pauta "como abrir MEI" --contexto "público iniciante, nunca formalizou"
```

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

`@head-de-conteudo` → `@pesquisador-seo`:
- Keyword principal
- Tipo de intenção classificada

### Passo 3 — Validar H2s

`@pesquisador-seo` → `@head-de-conteudo`:
- Lista de H2s com fonte (PAA / relacionadas / autocomplete / concorrentes)
- `@head-de-conteudo` valida: todos têm fonte real? Nenhum genérico proibido?

### Passo 4 — Criar Briefing e Delegar Redação

`@head-de-conteudo` → `@copywriter-seo`:
- Keyword + variações semânticas
- Intenção classificada
- **Layout Astro obrigatório** (`bloglayout.astro` | `reviewlayout.astro` | `contentlayout.astro`)
- Estrutura de introdução recomendada
- H2s em ordem
- Tamanho alvo
- Pontos obrigatórios

### Passo 5 — Auditoria

`@copywriter-seo` → `@qa-conteudo`:
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

`@head-de-conteudo` executa `*atualizar-pos-publicacao`:

**8a. `src/pages/autor/gabriella-fernandes.astro`**
Adicionar novo objeto no array `articles` (mais recente no topo):
```ts
{
  title: "[título completo]",
  description: "[descrição curta — 1 frase]",
  href: "[slug exato]",
  date: "[YYYY-MM-DD]",
},
```

**8b. `src/data/estrutura.ts`**
Adicionar no array `paginas` da subcategoria correta:
```ts
{ label: "[label curto para o menu]", href: "[slug exato]" }
```

O `href` deve ser **idêntico** nos dois arquivos e no nome do arquivo em `src/pages/`.

## Limites de Iteração

Máximo 3 ciclos de revisão. Após 3 vetos consecutivos, escalar para o usuário com relatório de problemas recorrentes.
