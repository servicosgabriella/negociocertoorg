---
task: Redigir Artigo
responsavel: "@copywriter-seo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - briefing: Documento de briefing do @head-de-conteudo (obrigatório)
  - keyword: Keyword principal (obrigatório)
  - intencao: Tipo de intenção de busca (obrigatório)
  - layout: bloglayout | contentlayout | reviewlayout (obrigatório)
  - h2s: Lista de H2s validados em ordem (obrigatório)
  - estrutura_introducao: ponte | cpp | pdp (obrigatório)
  - tamanho_alvo: Faixa de palavras alvo (obrigatório)
Saida: |
  - slug: URL/slug validado (sem números, anos, datas — 3 a 5 palavras)
  - arquivo: Arquivo do artigo no formato e destino corretos para o layout definido
Checklist:
  - "[ ] Slug definido e validado ANTES de criar o arquivo (sem números, anos, datas)"
  - "[ ] Briefing lido na íntegra"
  - "[ ] Estrutura de introdução selecionada"
  - "[ ] H1 com keyword + intenção clara gerado"
  - "[ ] Introdução: keyword nos primeiros 100 palavras"
  - "[ ] Introdução: sem definição como abertura"
  - "[ ] Introdução: termina com promessa clara"
  - "[ ] Todos os H2s do briefing desenvolvidos"
  - "[ ] Ritmo variado (sem efeito escada)"
  - "[ ] Tom 80/20 (técnico com personalidade)"
  - "[ ] 'Você' usado com frequência"
  - "[ ] Nenhum travessão (—) no meio de frases — use parênteses, vírgulas ou bullets"
  - "[ ] Nenhum conectivo/clichê da Lista Negra"
  - "[ ] Conclusão com próximo passo concreto (não 'esperamos ter ajudado')"
  - "[ ] FAQ incluído se +7 H2s ou artigo review"
  - "[ ] Artigo enviado para @qa-conteudo"
---

# *redigir-artigo

Redige artigo SEO completo seguindo o briefing e as regras do squad.

## Uso

```
@copywriter-seo

*redigir-artigo --briefing briefing-maquininha-mei.md
*redigir-artigo "maquininha para MEI" --intencao comercial --layout reviewlayout --estrutura ponte
```

---

## Destino do Arquivo por Layout (CRÍTICO)

O layout define **onde** o arquivo é criado e **qual formato** usar:

### `bloglayout.astro` → `src/content/blog/{slug}.md`

Arquivo Markdown com frontmatter. O roteador `src/pages/blog/[...slug].astro` aplica o layout automaticamente.

```md
---
title: "Título do artigo"
description: "Descrição para SEO."
pubDate: YYYY-MM-DD
updatedDate: YYYY-MM-DD
authorName: "Gabriella Fernandes"
authorRole: "Especialista em Negócios"
authorImage: "/images/perfil.jpg"
coverImage: "/images/{slug}.png"
authorHref: "/autor/gabriella-fernandes"
coverAlt: "Descrição da imagem de capa."
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Blog"
    href: "/blog/"
  - label: "Título do artigo"
faq:
  - question: "Pergunta?"
    answer: "Resposta."
---

Conteúdo do artigo em Markdown...
```

### `contentlayout.astro` → `src/pages/{slug}.astro`

Arquivo Astro que importa `ContentLayout`. Usa `getBreadcrumb` e `getSubcategoria` de `estrutura.ts`.

```astro
---
import ContentLayout from '../layouts/ContentLayout.astro';
import { getBreadcrumb, getSubcategoria } from '../data/estrutura';

const subcategoria = getSubcategoria('{categoria}', '{subcategoria_key}');
const breadcrumb = getBreadcrumb('{categoria}', '{titulo_pagina}', subcategoria);
---

<ContentLayout
  title="{Título completo}"
  description="{Descrição SEO}"
  publishDate="{YYYY-MM-DD}"
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
  <p>Conteúdo do artigo em HTML/JSX...</p>
</ContentLayout>
```

### `reviewlayout.astro` → `src/pages/{slug}.astro`

Arquivo Astro que importa `ReviewLayout`. Tem prop `ranking` com os itens sendo comparados.

```astro
---
import ReviewLayout from '../layouts/ReviewLayout.astro';
import { getBreadcrumb, getSubcategoria } from '../data/estrutura';

const subcategoria = getSubcategoria('{categoria}', '{subcategoria_key}');
const breadcrumb = getBreadcrumb('{categoria}', '{titulo_pagina}', subcategoria);
---

<ReviewLayout
  title="{Título completo}"
  description="{Descrição SEO}"
  publishDate="{YYYY-MM-DD}"
  updatedDate="{YYYY-MM-DD}"
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
    <!-- Conteúdo da review em HTML/JSX -->
  </div>
</ReviewLayout>
```

## Estruturas de Introdução

### ponte — Modelo de Ponte (comercial)
```
Imagine que você pudesse [situação desejada].
Mas agora mesmo, aqui está você. [dor atual]
Neste artigo você vai [promessa concreta].
```

### cpp — Concorde > Prometa > Preveja (informacional)
```
[Concordar com a dificuldade.] Não é?
[Prometida: tem solução.] Não é tão difícil quanto parece.
Neste artigo você vai ver [2-3 pontos].
```

### pdp — Pergunta + Dor + Promessa (informacional claro)
```
[Pergunta direta sobre o tema]?
[Consequência de errar.]
Neste guia você vai [promessa específica].
```

## Padrão de Ritmo Obrigatório

```
✅ CORRETO:
Bloco de 2-3 linhas desenvolvendo ideia completa.

Frase de impacto curta.

Outro bloco médio avançando o raciocínio.
```

```
❌ PROIBIDO:
Ponto um.

Ponto dois.

Ponto três.
```

---

## Alternativas ao Travessão (—)

**NUNCA use travessão para quebrar frases no meio. Use:**

| Situação | Use isso | Exemplo |
|----------|----------|---------|
| Complemento ou nota | Parênteses | "O DAS (Documento de Arrecadação) é..." |
| Separação natural | Vírgula | "O DAS, um documento de arrecadação, é..." |
| Quebra clara | Ponto + nova frase | "O DAS é obrigatório. Você deve pagar todo mês." |
| Lista de items | Bullets com `-` | `- Item um`<br/>`- Item dois` |
| Intervalo | Travessão (ok) | "2024–2025" ou "páginas 15–20" |
