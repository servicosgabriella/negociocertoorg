---
task: Montar Arquivo do Artigo
responsavel: "@copywriter-seo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - slug: Slug validado do artigo (obrigatório)
  - titulo: Título completo do artigo (obrigatório)
  - descricao: Descrição curta em 1 frase, até 160 chars (obrigatório)
  - layout: bloglayout | reviewlayout | contentlayout (obrigatório)
  - conteudo: Texto do artigo aprovado pelo @qa-conteudo (obrigatório)
  - data: Data de publicação YYYY-MM-DD (obrigatório)
  - categoria: Categoria/subcategoria para menu (obrigatório se layout != bloglayout)
  - cover_gerado: Confirmar que gerar-capa.md foi executado (obrigatório para bloglayout e contentlayout)
Saida: |
  - arquivo: Arquivo criado no diretório correto para o layout
  - gabriella-fernandes.astro: Atualizado (se layout != bloglayout)
  - estrutura.ts: Atualizado (se layout != bloglayout)
Checklist:
  - "[ ] Slug validado conforme config/slug-rules.md"
  - "[ ] Caminho da capa adicionado ao frontmatter (bloglayout e contentlayout)"
  - "[ ] Arquivo criado no diretório correto para o layout"
  - "[ ] Frontmatter completo e válido"
  - "[ ] gabriella-fernandes.astro atualizado (se reviewlayout ou contentlayout)"
  - "[ ] estrutura.ts atualizado na subcategoria correta (se reviewlayout ou contentlayout)"
  - "[ ] href idêntico nos dois arquivos e no nome do arquivo"
---

# *montar-arquivo

Cria o arquivo do artigo no diretório correto e atualiza referências de navegação.

Task atômica — parte da sequência de publicação:
1. `gerar-capa.md` → 2. **`montar-arquivo.md`** → 3. `git-publicar.md`

## Uso

```
@copywriter-seo

*montar-arquivo --slug "como-abrir-um-mei" --layout bloglayout --data 2026-03-15
```

## Passo 1 — Preparar Frontmatter por Layout

### `bloglayout.astro` → `src/content/blog/{slug}.md`

```yaml
---
title: "{titulo}"
description: "{descricao}"
pubDate: {data}
updatedDate: {data}
authorName: "Gabriella Fernandes"
authorRole: "Especialista em Negócios"
authorImage: "/images/perfil.jpg"
coverImage: "/images/{slug}.png"
authorHref: "/autor/gabriella-fernandes"
coverAlt: "{Descrição visual da capa}"
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Blog"
    href: "/blog/"
  - label: "{titulo}"
faq:
  - question: "Pergunta?"
    answer: "Resposta."
---

{conteudo do artigo}
```

### `contentlayout.astro` → `src/pages/{slug}.astro`

```astro
---
import ContentLayout from '../layouts/ContentLayout.astro';
import { getBreadcrumb, getSubcategoria } from '../data/estrutura';

const subcategoria = getSubcategoria('{categoria}', '{subcategoria_key}');
const breadcrumb = getBreadcrumb('{categoria}', '{titulo_pagina}', subcategoria);
---

<ContentLayout
  title="{titulo}"
  description="{descricao}"
  publishDate="{data}"
  authorName="Gabriella Fernandes"
  authorRole="Especialista em Negócios"
  authorImage="/images/perfil.jpg"
  authorHref="/autor/gabriella-fernandes/"
  category="{Label da categoria}"
  subcategory="{Label da subcategoria}"
  coverImage="/images/{slug}.png"
  coverAlt="{Descrição da imagem}"
  faq={[
    { question: "Pergunta?", answer: "Resposta." }
  ]}
>
  <p>{conteudo do artigo em HTML/JSX}</p>
</ContentLayout>
```

### `reviewlayout.astro` → `src/pages/{slug}.astro`

```astro
---
import ReviewLayout from '../layouts/ReviewLayout.astro';
import { getBreadcrumb, getSubcategoria } from '../data/estrutura';

const subcategoria = getSubcategoria('{categoria}', '{subcategoria_key}');
const breadcrumb = getBreadcrumb('{categoria}', '{titulo_pagina}', subcategoria);
---

<ReviewLayout
  title="{titulo}"
  description="{descricao}"
  publishDate="{data}"
  updatedDate="{data}"
  authorName="Gabriella Fernandes"
  authorHref="/autor/gabriella-fernandes/"
  authorRole="Analista Sênior"
  authorImage="/images/perfil.jpg"
  breadcrumb={breadcrumb}
  ranking={[
    { position: 1, name: "{Nome}", url: "{URL afiliado}" },
    { position: 2, name: "{Nome}", url: "{URL afiliado}" },
  ]}
>
  <div slot="ranking">
    <!-- conteúdo da review -->
  </div>
</ReviewLayout>
```

## Passo 2 — Atualizar gabriella-fernandes.astro (APENAS para reviewlayout e contentlayout)

**Arquivo:** `src/pages/autor/gabriella-fernandes.astro`

Adicionar novo objeto **no topo** do array `articles`:

```ts
{
  title: "{titulo}",
  description: "{descricao}",
  href: "{slug}",
  date: "{data}",
},
```

**Validações:**
- ✅ `href` idêntico ao slug
- ✅ Novo artigo no topo (mais recente primeiro)

**Se layout = bloglayout: PULAR este passo.**

## Passo 3 — Atualizar estrutura.ts (APENAS para reviewlayout e contentlayout)

**Arquivo:** `src/data/estrutura.ts`

Adicionar na subcategoria correspondente:

```ts
{ label: "{label curto}", href: "{slug}" }
```

**Determinação do label:**
- Remover "Como" ou "Guia" do título se presente
- Máximo 40 caracteres
- Exemplo: "Como Abrir MEI" → `"Abrir MEI"`

**Validações:**
- ✅ `href` idêntico ao slug
- ✅ Categoria existe em `estrutura.ts`
- ✅ `href` único dentro da subcategoria

**Se layout = bloglayout: PULAR este passo.**
