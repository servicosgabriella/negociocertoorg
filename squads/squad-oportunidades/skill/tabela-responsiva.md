---
name: tabela-responsiva
description: >
  Padrão de tabela HTML responsiva para desktop e mobile. Usar sempre que um artigo
  precisar de tabela com 3 ou mais colunas. No desktop renderiza como tabela normal.
  No mobile cada linha colapsa em bloco empilhado com label acima de cada valor,
  eliminando scroll horizontal e texto cortado. Acionar quando o @copywriter criar
  uma tabela comparativa de atributos.
---

# Tabela Responsiva — Padrão Stacked

## Quando usar

Qualquer tabela com **3 ou mais colunas** em artigo do negociocerto.org.

Com 2 colunas a tabela geralmente cabe no mobile sem intervenção.
Com 3+ colunas e conteúdo textual médio/longo, o padrão stacked é obrigatório.

---

## Padrão HTML — estrutura obrigatória

```html
<!-- Wrapper externo: border-radius e shadow aqui, não na <table> -->
<div style="margin: 24px 0; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
  <!-- Segundo wrapper: overflow-x só aqui, garante que o shadow não seja cortado -->
  <div style="overflow-x:auto;">
    <table class="table-responsive" style="width:100%; border-collapse:collapse; font-size:0.95rem;">
      <thead>
        <tr style="background: linear-gradient(to right, #1a3a5c, #2d6a9f); color:#ffffff; text-align:left;">
          <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Coluna A</th>
          <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Coluna B</th>
          <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Coluna C</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <!-- Primeira célula (logo/nome): sem data-label -->
          <td style="padding:12px 16px;">
            [logo ou nome do produto]
          </td>
          <!-- Demais células: data-label obrigatório, valor exato do <th> correspondente -->
          <td style="padding:12px 16px;" data-label="Coluna B">Valor</td>
          <td style="padding:12px 16px;" data-label="Coluna C">Valor</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Regras do HTML

- `class="table-responsive"` obrigatório no `<table>` — é o que ativa o CSS stacked no mobile
- `data-label` em **todos** os `<td>` exceto o primeiro (logo/nome) — o valor deve ser **exatamente igual** ao texto do `<th>` correspondente
- `border-radius` e `box-shadow` sempre no `<div>` externo, **nunca** no `<table>` — não funciona corretamente em Firefox quando aplicado diretamente na tabela
- Dois wrappers aninhados: o externo tem `border-radius + overflow:hidden`, o interno tem `overflow-x:auto` — essa separação evita que o shadow seja cortado pelo overflow

---

## Links de afiliado dentro de células (logo)

Quando a primeira coluna contém logo de afiliado com link, a área de toque precisa ter mínimo de 44px:

```html
<td style="padding:12px 16px;">
  <a href={afiliados.produto.link} target="_blank" rel="sponsored noopener"
     style="display:block; padding:12px 0;">
    <img src={afiliados.produto.logo} alt="Nome" style="height:20px; display:block;" loading="lazy">
  </a>
</td>
```

- `display:block; padding:12px 0` — cria área de toque de ~44px (12px + 20px logo + 12px) **sem** usar flexbox
- Sem `data-label` nessa célula — no mobile a logo já identifica o produto visualmente

> ⚠️ **NUNCA usar `display:flex; min-height:44px` em logos dentro de tabelas.**
> O algoritmo de largura de colunas das tabelas HTML varia por linha. Com `display:flex`, o `max-width:100%` do CSS global redimensiona cada logo de forma diferente — a primeira logo fica grande (coluna mais larga por causa de badge/texto extra) e as seguintes ficam progressivamente menores. `display:block; padding` resolve sem esse efeito colateral.

---

## CSS — adicionar em `src/styles/global.css`

O CSS já está no `global.css` do projeto. Verificar antes de adicionar novamente.

```css
/* Tabela responsiva — stacked layout no mobile */
@media (max-width: 640px) {
  .table-responsive thead {
    display: none;
  }

  .table-responsive tbody tr {
    display: block;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 16px;
    padding: 4px 0;
    background: inherit;
  }

  .table-responsive tbody td {
    display: block;
    padding: 10px 16px;
    border: none;
    border-bottom: 1px solid #f3f4f6;
    text-align: left;
  }

  .table-responsive tbody td:last-child {
    border-bottom: none;
  }

  /* Label acima do valor via data-label */
  .table-responsive tbody td[data-label]::before {
    content: attr(data-label);
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #9ca3af;
    margin-bottom: 4px;
  }
}
```

---

## Resultado no mobile

Cada linha da tabela se transforma em um bloco empilhado:

```
┌─────────────────────────────┐
│ [logo / nome do produto]    │
│                             │
│ COLUNA B                    │  ← label em cinza pequeno (via data-label)
│ Valor da célula B           │
│                             │
│ COLUNA C                    │
│ Valor da célula C           │
└─────────────────────────────┘
```

---

---

## Botão "Visitar site" no mobile (para tabelas com afiliados)

Quando a tabela lista produtos com link de afiliado, adicionar um botão CTA no final de cada bloco mobile. No desktop o botão fica oculto — o logo já é clicável.

**Adicionar `<th>` e `<td>` extras:**

```html
<!-- No <thead>: coluna invisível -->
<th class="col-visitar"></th>

<!-- Em cada <tr> do <tbody>: botão com link do afiliado correspondente -->
<td class="col-visitar">
  <a href={afiliados.produto.link} target="_blank" rel="sponsored noopener" class="btn-visitar">
    Visitar site →
  </a>
</td>
```

**CSS já no `global.css`:**

```css
/* Desktop: oculta a coluna inteira */
.table-responsive th.col-visitar,
.table-responsive td.col-visitar {
  display: none;
}

/* Mobile: mostra o botão no final de cada bloco */
@media (max-width: 640px) {
  .table-responsive td.col-visitar {
    display: block;
    padding: 12px 16px 16px;
    border-bottom: none;
  }

  .btn-visitar {
    display: block;
    text-align: center;
    padding: 11px 16px;
    background: #1a3a5c;
    color: #ffffff !important;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
  }

  .btn-visitar:hover {
    background: #2d6a9f;
  }
}
```

**Resultado no mobile:**
```
┌─────────────────────────────┐
│ [logo]                      │
│ [badge Recomendado]         │
│                             │
│ PREÇO MEI/MÊS               │
│ A partir de R$29,90         │
│                             │
│ O QUE INCLUI                │
│ DAS, DASN-SIMEI...          │
│                             │
│ IDEAL PARA                  │
│ MEI sem funcionário         │
│                             │
│ [  Visitar site →  ]        │  ← botão CTA
└─────────────────────────────┘
```

---

## Checklist antes de usar

- [ ] `class="table-responsive"` no `<table>`
- [ ] Dois wrappers aninhados: externo (border-radius) + interno (overflow-x:auto)
- [ ] `data-label` em todos os `<td>` exceto o primeiro e o `col-visitar`
- [ ] Texto do `data-label` igual ao texto do `<th>` correspondente
- [ ] Links de logo com `min-height:44px` e `display:flex; align-items:center`
- [ ] `<th class="col-visitar">` e `<td class="col-visitar">` adicionados (tabelas com afiliados)
- [ ] CSS `.table-responsive`, `.col-visitar` e `.btn-visitar` já presentes no `global.css` (não duplicar)
