# Modelo de Tabelas HTML — Negócio Certo

> **Para agentes copywriters:** Use este arquivo como **referência de estilo**, não como template fixo.
> Adapte o número de colunas, linhas, cores de destaque e estrutura conforme o conteúdo do artigo.
> O importante é manter a identidade visual do Negócio Certo.

---

## Identidade Visual — Referência de Cores

| Elemento | Cor | Uso |
|---|---|---|
| Azul escuro | `#1a3a5c` | Cabeçalho de tabela, destaque principal |
| Azul médio | `#2d6a9f` | Gradiente, variação do header |
| Azul vivo | `#007eff` | Links, badges, ícones de check |
| Amarelo | `#facc15` | Destaque especial, badge "recomendado" |
| Quase preto | `#111827` | Títulos e texto forte |
| Cinza corpo | `#374151` | Texto normal das células |
| Borda | `#e5e7eb` | Bordas de tabela e separadores |
| Fundo claro | `#f8fafc` | Linhas alternadas |
| Fundo destaque | `#eff6ff` | Célula ou coluna em evidência |

---

## Modelo 1 — Tabela de Comparação (mais usada)

Ideal para comparar opções, produtos ou serviços lado a lado.

```html
<div style="overflow-x:auto; margin: 24px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:0.95rem; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
    <thead>
      <tr style="background: linear-gradient(to right, #1a3a5c, #2d6a9f); color:#ffffff; text-align:left;">
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Critério</th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Opção A</th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Opção B</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Preço</td>
        <td style="padding:12px 16px; color:#374151;">R$ 100/mês</td>
        <td style="padding:12px 16px; color:#374151;">R$ 200/mês</td>
      </tr>
      <tr style="background:#f8fafc; border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Atendimento</td>
        <td style="padding:12px 16px; color:#374151;">WhatsApp</td>
        <td style="padding:12px 16px; color:#374151;">Telefone</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Contrato</td>
        <td style="padding:12px 16px; color:#374151;">Sem fidelidade</td>
        <td style="padding:12px 16px; color:#374151;">12 meses</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Resultado visual:** Header com gradiente azul escuro → azul médio, linhas alternadas em branco/#f8fafc, bordas sutis.

---

## Modelo 2 — Tabela com Coluna em Destaque

Use quando uma das opções é a **recomendada** pelo artigo. A coluna destacada usa `#eff6ff` de fundo.

```html
<div style="overflow-x:auto; margin: 24px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:0.95rem; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
    <thead>
      <tr style="background: linear-gradient(to right, #1a3a5c, #2d6a9f); color:#ffffff; text-align:left;">
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Critério</th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px; background:#007eff;">
          ⭐ Recomendado
        </th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Outro</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Preço</td>
        <td style="padding:12px 16px; background:#eff6ff; color:#1a3a5c; font-weight:600;">R$ 120/mês</td>
        <td style="padding:12px 16px; color:#374151;">R$ 300/mês</td>
      </tr>
      <tr style="background:#f8fafc; border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Taxa de aprovação</td>
        <td style="padding:12px 16px; background:#eff6ff; color:#1a3a5c; font-weight:600;">98%</td>
        <td style="padding:12px 16px; color:#374151;">85%</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Suporte</td>
        <td style="padding:12px 16px; background:#eff6ff; color:#1a3a5c; font-weight:600;">24h por dia</td>
        <td style="padding:12px 16px; color:#374151;">Horário comercial</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Resultado visual:** A coluna destacada tem header em `#007eff` (azul vivo) e células em `#eff6ff` (azul muito claro) com texto `#1a3a5c`.

---

## Modelo 3 — Tabela com Ícones ✓ / ✗

Use para comparar disponibilidade de recursos/funcionalidades.

```html
<div style="overflow-x:auto; margin: 24px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:0.95rem; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
    <thead>
      <tr style="background: linear-gradient(to right, #1a3a5c, #2d6a9f); color:#ffffff; text-align:left;">
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Recurso</th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px; text-align:center;">Plano Básico</th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px; text-align:center;">Plano Pro</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Emissão de NF</td>
        <td style="padding:12px 16px; text-align:center; color:#007eff; font-size:1.1rem;">✓</td>
        <td style="padding:12px 16px; text-align:center; color:#007eff; font-size:1.1rem;">✓</td>
      </tr>
      <tr style="background:#f8fafc; border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Folha de pagamento</td>
        <td style="padding:12px 16px; text-align:center; color:#d1d5db; font-size:1.1rem;">✗</td>
        <td style="padding:12px 16px; text-align:center; color:#007eff; font-size:1.1rem;">✓</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Consultoria mensal</td>
        <td style="padding:12px 16px; text-align:center; color:#d1d5db; font-size:1.1rem;">✗</td>
        <td style="padding:12px 16px; text-align:center; color:#007eff; font-size:1.1rem;">✓</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Resultado visual:** Ícone ✓ em `#007eff` (azul vivo) para disponível, ✗ em `#d1d5db` (cinza claro) para indisponível.

---

## Modelo 4 — Tabela Simples (sem cabeçalho de gradiente)

Use para listas de dados rápidos, taxas, prazos — sem necessidade de comparação complexa.

```html
<div style="overflow-x:auto; margin: 24px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:0.95rem; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb;">
    <thead>
      <tr style="background:#f1f5f9; text-align:left; border-bottom:2px solid #1a3a5c;">
        <th style="padding:12px 16px; color:#1a3a5c; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Item</th>
        <th style="padding:12px 16px; color:#1a3a5c; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:11px 16px; color:#374151;">Taxa de antecipação</td>
        <td style="padding:11px 16px; color:#111827; font-weight:600;">1,99% a.m.</td>
      </tr>
      <tr style="background:#f8fafc; border-bottom:1px solid #e5e7eb;">
        <td style="padding:11px 16px; color:#374151;">Prazo de recebimento</td>
        <td style="padding:11px 16px; color:#111827; font-weight:600;">1 dia útil</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:11px 16px; color:#374151;">Mensalidade</td>
        <td style="padding:11px 16px; color:#111827; font-weight:600;">Gratuita</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Resultado visual:** Fundo branco com borda-top `#1a3a5c` como linha de ênfase, mais sóbrio que o gradiente.

---

## Modelo 5 — Tabela com Badge "Melhor Custo-Benefício"

Use em artigos de review quando quer destacar um produto com badge amarelo.

```html
<div style="overflow-x:auto; margin: 24px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:0.95rem; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
    <thead>
      <tr style="background: linear-gradient(to right, #1a3a5c, #2d6a9f); color:#ffffff; text-align:left;">
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Produto</th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Taxa Débito</th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Taxa Crédito</th>
        <th style="padding:14px 16px; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Mensalidade</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #e5e7eb; background:#fffbeb;">
        <td style="padding:12px 16px; color:#111827; font-weight:700;">
          Produto X
          <span style="display:inline-block; margin-left:8px; background:#facc15; color:#1a3a5c; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:20px; text-transform:uppercase; letter-spacing:0.3px;">Recomendado</span>
        </td>
        <td style="padding:12px 16px; color:#007eff; font-weight:700;">1,29%</td>
        <td style="padding:12px 16px; color:#007eff; font-weight:700;">2,69%</td>
        <td style="padding:12px 16px; color:#374151;">Grátis</td>
      </tr>
      <tr style="background:#f8fafc; border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Produto Y</td>
        <td style="padding:12px 16px; color:#374151;">1,59%</td>
        <td style="padding:12px 16px; color:#374151;">3,19%</td>
        <td style="padding:12px 16px; color:#374151;">R$ 29,90</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; color:#111827; font-weight:600;">Produto Z</td>
        <td style="padding:12px 16px; color:#374151;">1,89%</td>
        <td style="padding:12px 16px; color:#374151;">3,59%</td>
        <td style="padding:12px 16px; color:#374151;">R$ 49,90</td>
      </tr>
    </tbody>
  </table>
</div>

</body>
</html>