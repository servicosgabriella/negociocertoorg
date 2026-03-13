---
task: Atualizar Pós-Publicação
responsavel: "@head-de-conteudo"
responsavel_type: agent
atomic_layer: task
aplicavel_quando: Layout é reviewlayout.astro ou contentlayout.astro (NÃO se aplica ao bloglayout.astro)
Entrada: |
  - titulo: Título do artigo publicado (obrigatório)
  - descricao: Descrição curta do artigo — usada na página de autor (obrigatório)
  - href: Slug do artigo, ex: "/melhores-maquininhas-mei" (obrigatório)
  - data: Data de publicação no formato YYYY-MM-DD (obrigatório)
  - categoria: Chave da categoria em estrutura.ts, ex: "financas" (obrigatório)
  - subcategoria: Chave da subcategoria em estrutura.ts, ex: "maquininhas" (obrigatório)
  - label_estrutura: Label curto para o menu do header (obrigatório)
Saida: |
  - gabriella-fernandes.astro: atualizado com novo artigo no array articles
  - estrutura.ts: atualizado com nova entrada no array paginas da subcategoria correta
Checklist:
  - "[ ] Confirmar que o layout é reviewlayout.astro ou contentlayout.astro"
  - "[ ] Identificar categoria e subcategoria correta em estrutura.ts"
  - "[ ] Adicionar entrada em gabriella-fernandes.astro (array articles)"
  - "[ ] Adicionar entrada em estrutura.ts (array paginas da subcategoria)"
  - "[ ] Verificar que o href é idêntico nos dois arquivos e no arquivo de página"
---

# *atualizar-pos-publicacao

Atualiza a página de autor e o header do site após publicação de artigos com `reviewlayout.astro` ou `contentlayout.astro`.

> **Não se aplica** a artigos com `bloglayout.astro` — conteúdos informacionais e navegacionais não entram na estrutura de categorias do header nem na lista de artigos da autora.

## Uso

```
@head-de-conteudo

*atualizar-pos-publicacao
  --titulo "Melhores Maquininhas para MEI em 2026"
  --descricao "Comparação das 5 melhores maquininhas para MEI com taxas reais."
  --href "/melhores-maquininhas-mei"
  --data "2026-03-12"
  --categoria financas
  --subcategoria maquininhas
  --label "Melhores Maquininhas para MEI"
```

---

## Arquivo 1 — `src/pages/autor/gabriella-fernandes.astro`

Adicionar novo objeto no array `articles` dentro do frontmatter (bloco `---`):

```ts
// Padrão de entrada — adicionar ANTES do último item da lista (ordem cronológica inversa)
{
  title: "[título completo do artigo]",
  description: "[descrição curta — 1 frase que resume o valor do artigo]",
  href: "[slug exato, ex: /melhores-maquininhas-mei]",
  date: "[YYYY-MM-DD]",
},
```

### Exemplo prático

Antes:
```ts
const articles = [
  {
    title: "Melhores Contabilidades Online (Atualizado 2026)",
    description: "Comparação completa das 6 melhores contabilidades online do Brasil.",
    href: "/financas/contabilidade-online/melhores-contabilidades-online/",
    date: "2026-02-21",
  },
  // ...
];
```

Depois (novo artigo no topo, por ser mais recente):
```ts
const articles = [
  {
    title: "Melhores Maquininhas para MEI em 2026",
    description: "Comparação das 5 melhores maquininhas para MEI com taxas reais.",
    href: "/melhores-maquininhas-mei",
    date: "2026-03-12",
  },
  {
    title: "Melhores Contabilidades Online (Atualizado 2026)",
    // ...
  },
];
```

---

## Arquivo 2 — `src/data/estrutura.ts`

Adicionar novo objeto no array `paginas` da subcategoria correta.

### Estrutura de categorias disponíveis

```
financas
  ├── contabilidade    → /financas/contabilidade/
  ├── maquininhas      → /financas/maquininhas/
  └── erp              → /financas/erp/

planejamento
  ├── plano_negocios   → /planejamento/plano-de-negocios/
  └── registro_marca   → /planejamento/registro-de-marca/

gestao
  ├── pdv              → /gestao/sistema-pdv/
  └── nfe              → /gestao/nota-fiscal-eletronica/

rh
  ├── recrutamento     → /rh/plataforma-de-recrutamento/
  └── folha_pagamento  → /rh/folha-de-pagamento-online/
```

### Padrão de entrada

```ts
// Dentro do array paginas da subcategoria correspondente:
{ label: "[label curto para o menu]", href: "[slug exato]" }
```

### Exemplo prático

Adicionar maquininha na subcategoria `maquininhas` de `financas`:

Antes:
```ts
maquininhas: {
  label: "Maquininhas de Cartão",
  href: "/financas/maquininhas/",
  paginas: [] as Pagina[]
},
```

Depois:
```ts
maquininhas: {
  label: "Maquininhas de Cartão",
  href: "/financas/maquininhas/",
  paginas: [
    { label: "Melhores Maquininhas para MEI", href: "/melhores-maquininhas-mei" }
  ] as Pagina[]
},
```

---

## Regra de Consistência de href

O `href` usado nos dois arquivos **deve ser idêntico** ao nome do arquivo criado em `src/pages/`.

| Arquivo | Valor |
|---------|-------|
| `src/pages/melhores-maquininhas-mei.astro` | — |
| `gabriella-fernandes.astro` → `href` | `/melhores-maquininhas-mei` |
| `estrutura.ts` → `href` | `/melhores-maquininhas-mei` |

Qualquer divergência quebra os links do site.

---

## Quando NÃO executar esta task

| Layout | Arquivo criado em | Atualizar gabriella-fernandes.astro | Atualizar estrutura.ts |
|--------|-------------------|-------------------------------------|------------------------|
| `bloglayout.astro` | `src/content/blog/{slug}.md` | ❌ Não | ❌ Não |
| `contentlayout.astro` | `src/pages/{slug}.astro` | ✅ Sim | ✅ Sim |
| `reviewlayout.astro` | `src/pages/{slug}.astro` | ✅ Sim | ✅ Sim |
