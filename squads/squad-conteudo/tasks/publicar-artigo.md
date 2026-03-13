---
task: Publicar Artigo
responsavel: "@copywriter-seo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - slug: Slug validado do artigo (ex: como-abrir-um-mei) (obrigatório)
  - titulo: Título completo do artigo (obrigatório)
  - descricao: Descrição curta em 1 frase (obrigatório)
  - layout: Layout Astro usado (bloglayout | reviewlayout | contentlayout) (obrigatório)
  - topico_visual: Descrição visual para geração de capa (obrigatório para blog e content layouts)
  - data: Data de publicação YYYY-MM-DD (obrigatório)
  - categoria: Categoria/subcategoria para menu (obrigatório se layout != bloglayout)
Saida: |
  - artigo: Arquivo do artigo em src/content/blog/ ou src/pages/ com capa e metadados
  - gabriella-fernandes.astro: Atualizado com novo artigo (se layout != bloglayout)
  - estrutura.ts: Atualizado com nova entrada no menu (se layout != bloglayout)
  - commit: Commit local criado, aguardando push por @devops
Checklist:
  - "[ ] Slug validado (sem números, anos ou datas)"
  - "[ ] Capa gerada: npm run gerar-imagem -- --slug ... --topico ..."
  - "[ ] Caminho da capa adicionado ao frontmatter"
  - "[ ] gabriella-fernandes.astro atualizado (se reviewlayout ou contentlayout)"
  - "[ ] estrutura.ts atualizado na subcategoria correta (se reviewlayout ou contentlayout)"
  - "[ ] Arquivo do artigo criado/atualizado no diretório correto"
  - "[ ] Frontmatter completo (title, description, date, layout, coverImage)"
  - "[ ] Git status verificado: sem conflitos"
  - "[ ] Git commit criado com mensagem descritiva"
  - "[ ] Delegação para @devops para git push"
---

# *publicar-artigo

Publica o artigo aprovado no site, gerando capa, atualizando referências e criando commit pronto para push.

## Pré-requisitos

- Artigo já foi aprovado pelo @qa-conteudo
- GOOGLE_API_KEY configurada no .env (para geração de capa)
- Slug, título, descrição e data validados
- Layout Astro determinado (bloglayout | reviewlayout | contentlayout)

## Entrada Obrigatória

| Campo | Tipo | Exemplo | Notas |
|-------|------|---------|-------|
| `slug` | String | `como-abrir-um-mei` | Sem números, anos ou datas |
| `titulo` | String | `Como Abrir um MEI: Guia Completo 2024` | Completo do artigo |
| `descricao` | String | `Aprenda todos os passos para formalizar seu negócio como MEI.` | 1 frase, até 160 chars |
| `layout` | String | `bloglayout` \| `reviewlayout` \| `contentlayout` | Determinado em orquestrar-pauta |
| `topico_visual` | String | `empreendedor abrindo empresa no computador` | Descrição para Gemini |
| `data` | String | `2024-03-13` | YYYY-MM-DD |
| `categoria` | String | `MEI/Como Abrir` | Obrigatório se layout != bloglayout |

## Sequência de Execução

### Passo 1 — Gerar Capa (para bloglayout e contentlayout)

Se o layout for `bloglayout.astro` ou `contentlayout.astro`, executar:

```bash
npm run gerar-imagem -- --slug "{slug}" --topico "{topico_visual}"
```

**Verificações:**
- ✅ Arquivo `public/images/{slug}.png` foi criado
- ✅ Imagem tem proporção 16:9
- ✅ Imagem segue estilo editorial (blocos geométricos, P&B com bordas brancas)

**Se layout = reviewlayout:** PULAR geração de capa (reviews não usam capa).

### Passo 2 — Preparar Frontmatter

Frontmatter final depende do layout:

**Para `bloglayout.astro` (blog):**
```yaml
---
title: "{titulo}"
description: "{descricao}"
date: {data}
layout: bloglayout.astro
coverImage: "/images/{slug}.png"
---
```

**Para `reviewlayout.astro` (review/comparativo):**
```yaml
---
title: "{titulo}"
description: "{descricao}"
date: {data}
layout: reviewlayout.astro
---
```

**Para `contentlayout.astro` (conteúdo comercial):**
```astro
---
const meta = {
  title: "{titulo}",
  description: "{descricao}",
  date: "{data}",
  layout: "contentlayout",
  coverImage: "/images/{slug}.png",
};
---

<Layout meta={meta}>
  <!-- conteúdo do artigo -->
</Layout>
```

### Passo 3 — Criar/Atualizar Arquivo do Artigo

**Se layout = `bloglayout.astro`:**
- Caminho: `src/content/blog/{slug}.md`
- Formato: Markdown com frontmatter YAML
- Salvar com conteúdo do artigo + frontmatter do Passo 2

**Se layout = `reviewlayout.astro` ou `contentlayout.astro`:**
- Caminho: `src/pages/{slug}.astro`
- Formato: Astro com frontmatter YAML
- Salvar com conteúdo do artigo + frontmatter do Passo 2

### Passo 4 — Atualizar gabriella-fernandes.astro (APENAS para reviewlayout e contentlayout)

**Arquivo:** `src/pages/autor/gabriella-fernandes.astro`

Localizar o array `articles` e adicionar novo objeto **no topo** (mais recente primeiro):

```ts
{
  title: "{titulo}",
  description: "{descricao}",
  href: "{slug}",
  date: "{data}",
},
```

**Validações:**
- ✅ `href` é idêntico ao slug
- ✅ Novo artigo está no topo do array (mais recente)
- ✅ Formatação mantém consistência com outros objetos

**Se layout = `bloglayout.astro`: PULAR este passo.**

### Passo 5 — Atualizar estrutura.ts (APENAS para reviewlayout e contentlayout)

**Arquivo:** `src/data/estrutura.ts`

Localizar a subcategoria correspondente (ex: `"MEI/Como Abrir"`) no array `paginas` e adicionar:

```ts
{ label: "{label curto}", href: "{slug}" }
```

**Determinação do `label`:**
- Remover "Como" ou "Guia" do título se presente
- Manter em português
- Máximo 40 caracteres
- Exemplo: "Como Abrir MEI" → label: "Abrir MEI"

**Validações:**
- ✅ `href` é idêntico ao slug
- ✅ Categoria existe em `estrutura.ts`
- ✅ `href` é único dentro da subcategoria

**Se layout = `bloglayout.astro`: PULAR este passo.**

### Passo 6 — Verificar Git Status

```bash
git status
```

**Deve mostrar:**
- Arquivo novo ou modificado: `src/content/blog/{slug}.md` ou `src/pages/{slug}.astro`
- Arquivo modificado (se layout != bloglayout): `src/pages/autor/gabriella-fernandes.astro`
- Arquivo modificado (se layout != bloglayout): `src/data/estrutura.ts`
- Arquivo novo (se criado): `public/images/{slug}.png`

**❌ BLOQUEADOR:** Se houver conflitos ou alterações não esperadas, HALT e investigar.

### Passo 7 — Git Add e Commit

```bash
git add src/content/blog/{slug}.md src/pages/autor/gabriella-fernandes.astro src/data/estrutura.ts public/images/{slug}.png
git commit -m "feat: publica artigo '{titulo}' [{slug}]"
```

**Mensagem de commit:**
```
feat: publica artigo '{titulo}' [{slug}]

- Capa gerada com estilo editorial
- Referência adicionada em gabriella-fernandes.astro
- Menu atualizado em estrutura.ts
- Layout: {layout}
- Data: {data}
```

### Passo 8 — Delegação para @devops (git push)

Após commit bem-sucedido:

**Mensagem:**
```
✅ Artigo pronto para publicação!

Slug: {slug}
Layout: {layout}
Commit: [hash curto do commit]

Próximo: Ativar @devops para executar:
@devops
*push
```

**NÃO execute `git push` aqui.** Isso é responsabilidade **EXCLUSIVA** de @devops.

## Solução de Problemas

| Erro | Causa | Solução |
|------|-------|--------|
| `GOOGLE_API_KEY não encontrada` | .env sem a chave | Adicionar `GOOGLE_API_KEY=...` ao .env |
| `Arquivo já existe` | Slug duplicado | Usar slug único, verificar `src/content/blog/` |
| `Categoria não existe em estrutura.ts` | Categoria errada | Verificar categorias válidas em `src/data/estrutura.ts` |
| `Git merge conflict` | Alterações simultâneas | Resolver conflitos com editor, depois commit |
| `href não corresponde ao slug` | Inconsistência no Passo 4 ou 5 | Certificar que `href` == `slug` exatamente |

## Validações Finais

Antes de delegar para @devops:

- [ ] `git status` mostra apenas arquivos esperados
- [ ] Todos os arquivos foram criados/modificados corretamente
- [ ] Frontmatter é válido YAML (sem indentação errada)
- [ ] `coverImage` path é correto (ex: `/images/{slug}.png`)
- [ ] `href` em gabriella-fernandes.astro e estrutura.ts é idêntico ao slug
- [ ] Commit foi criado com sucesso (`git log -1`)
- [ ] Nenhum erro no terminal (check `npm run build` se necessário validar)

## Exemplo de Execução Completa

```bash
# 1. Gerar capa
npm run gerar-imagem -- --slug "como-abrir-um-mei" --topico "empreendedor abrindo empresa no computador"

# 2. Criar/atualizar arquivo em src/content/blog/como-abrir-um-mei.md
# (com frontmatter + conteúdo)

# 3. Atualizar gabriella-fernandes.astro e estrutura.ts
# (se layout != bloglayout)

# 4. Verificar status
git status

# 5. Commit
git add .
git commit -m "feat: publica artigo 'Como Abrir um MEI' [como-abrir-um-mei]"

# 6. Pronto para push
# → Ativar @devops para push
```

## Notas

- **Nenhum conflito esperado** se pipeline foi executado em ordem (pesquisa → redação → auditoria → publicação)
- **Capa é obrigatória** para bloglayout e contentlayout, opcional para reviewlayout
- **Layout é imutável** após orquestração — não alterar
- **Slug deve ser único** no projeto — verificar antes de começar
