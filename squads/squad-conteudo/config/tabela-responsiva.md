---
name: tabela-responsiva
description: >
  Padrão de tabela HTML responsiva para desktop e mobile. Usar sempre que um artigo
  precisar de tabela com 3 ou mais colunas. No desktop renderiza como tabela normal.
  No mobile cada linha colapsa em bloco empilhado com label acima de cada valor,
  eliminando scroll horizontal e texto cortado.
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
  <!-- Segundo wrapper: overflow-x só aqui -->
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
          <!-- Demais células: data-label obrigatório -->
          <td style="padding:12px 16px;" data-label="Coluna B">Valor</td>
          <td style="padding:12px 16px;" data-label="Coluna C">Valor</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Regras do HTML

- `class="table-responsive"` obrigatório no `<table>`
- `data-label` em todos os `<td>` exceto o primeiro (logo/nome)
- `border-radius` e `box-shadow` no `<div>` externo, **nunca** no `<table>`
- Dois wrappers aninhados: externo (border-radius + overflow:hidden) + interno (overflow-x:auto)

---

## Links de afiliado dentro de células (logo)

```html
<td style="padding:12px 16px;">
  <a href={afiliados.produto.link} target="_blank" rel="sponsored noopener"
     style="display:block; padding:12px 0;">
    <img src={afiliados.produto.logo} alt="Nome" style="height:20px; display:block;" loading="lazy">
  </a>
</td>
```

- `display:block; padding:12px 0` — cria área de toque de ~44px (12px + 20px logo + 12px) sem usar flexbox

> ⚠️ **NUNCA usar `display:flex; min-height:44px` em logos dentro de tabelas.** O algoritmo de colunas HTML varia a largura por linha. Com flex, o `max-width:100%` do CSS global redimensiona logos diferente em cada linha — a primeira logo fica grande e as seguintes progressivamente menores. `display:block; padding` resolve sem esse efeito.

---

## CSS — já presente no `global.css`

O CSS já está no projeto. Verificar antes de adicionar novamente.

```css
@media (max-width: 640px) {
  .table-responsive thead { display: none; }

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

  .table-responsive tbody td:last-child { border-bottom: none; }

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
