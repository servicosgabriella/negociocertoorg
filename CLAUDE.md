# Negócio Certo — Contexto do Projeto

## Identidade
- **Site:** negociocerto.org
- **Missão:** Reviews, comparativos e guias sobre ferramentas para empresas brasileiras (maquininhas, contabilidade online, CRM, RH, gestão, planilhas)
- **Público:** Empreendedores brasileiros — do iniciante ao avançado
- **Monetização:** Links de afiliado em reviews e comparativos

## Stack
- **Framework:** Astro
- **Deploy:** Cloudflare Pages
- **Repo:** GitHub (branch main)

## Regra Crítica de Arquivos

| Tipo de conteúdo | Extensão | Layout | Pasta |
|---|---|---|---|
| Blog post | `.md` | `BlogLayout.astro` | `src/content/blog/` |
| Artigo de categoria/SEO | `.astro` | `ContentLayout.astro` | `src/pages/` (raiz) |
| Review / Comparativo | `.astro` | `ReviewLayout.astro` | `src/pages/` (raiz) |

**NUNCA** crie posts de blog como `.astro`. **NUNCA** crie artigos de categoria como `.md`.

## Layouts Disponíveis

### BlogLayout.astro — Posts do Blog
Frontmatter obrigatório (`.md`):
```yaml
title: "Título"
description: "Descrição SEO (máx 160 chars)"
pubDate: 2026-01-01
updatedDate: 2026-01-01
authorName: "Nome do Autor"
authorRole: "Cargo"
authorImage: "/images/foto-autor.webp"
authorHref: "/autor/slug/"
coverImage: "/images/capa.webp"
coverAlt: "Descrição da imagem"
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Blog"
    href: "/blog/"
  - label: "Título do post"
faq:
  - question: "Pergunta?"
    answer: "Resposta."
```

### ContentLayout.astro — Artigos de Categoria/SEO
Props obrigatórias (`.astro`):
```
title, description, publishDate, updatedDate
authorName, authorRole, authorImage, authorHref
category, subcategory
coverImage, coverAlt
faq (array opcional)
```
- Breadcrumb gerado automaticamente via `category` + `subcategory`
- Conteúdo em HTML dentro do `<ContentLayout>`
- Usar `<h2>` e `<h3>` — nunca `<h1>`

### ReviewLayout.astro — Reviews e Comparativos
Props obrigatórias (`.astro`):
```
title, description, publishDate, updatedDate
authorName, authorRole, authorImage, authorHref
breadcrumb (array manual)
ranking (array: position, name, url) — para ItemList schema
faq (array opcional)
```
- Slot `name="ranking"` → cards do ranking
- Slot padrão → artigo com reviews detalhados
- Accordions: `onclick="toggleAccordion(this)"`
- FAQ inline: `onclick="toggleFaq(this)"`
- **NUNCA** adicionar `<style>` ou `<script>` — já estão no layout

## Estrutura de Pastas
```
src/
  content/blog/     → posts .md
  pages/            → artigos .astro (raiz, sem subpastas)
  layouts/
    BlogLayout.astro
    ContentLayout.astro
    ReviewLayout.astro
  components/
    Header.astro
    Footer.astro
  data/
    estrutura.ts    → categorias e subcategorias do nav
    afiliados.ts    → links de afiliado
  styles/
    global.css
```

## Autor Padrão
```
authorName: "Gabriella Fernandes"
authorRole: "Especialista em Negócios"
authorImage: "/images/perfil.jpg"
authorHref: "/autor/gabriela.fernandes/"
```

## Categorias Disponíveis
`Finanças` | `Gestão` | `RH` | `Planejamento`

## Regras de SEO
- Slug = nome do arquivo (sem acentos, minúsculo, hífens)
- Slug na raiz: `src/pages/nome-do-artigo.astro` → URL `/nome-do-artigo/`
- `description` máx 160 caracteres
- FAQ obrigatório em todo artigo (mín 3 perguntas)
- Linkagem interna: sempre que citar tema coberto em outro artigo do site

## Informações Negativas de Produtos Afiliados
Mencionar de forma equilibrada e suavizada. Nunca omitir totalmente, nunca sensacionalizar.

## Após Criar Qualquer Artigo
Atualizar obrigatoriamente:
1. `src/components/Header.astro` — link no submenu correto
2. `src/data/estrutura.ts` — artigo na categoria/subcategoria
3. Confirmar URL final