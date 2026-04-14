---
name: box-maquininha.md
description: >
  Skill de estrutura visual dos cards/boxes de maquininha em artigos comparativos.
  Use sempre que o artigo listar ou comparar maquininhas de cartão — define ONDE o
  box aparece, O QUE mostrar (preço, funcionalidades com ícone + texto) e COMO
  estruturar o HTML do contabilidade-container para o nicho de maquininha.
  Esta skill governa a estrutura visual; o tom e o copy são definidos por copy-maquininha.md.
---

# Estrutura Visual — Box de Maquininha

## Premissa

O lojista que chega em um artigo de maquininha quer ver o produto na cara dura:
quanto custa, o que faz e onde comprar. Se o box aparecer só depois de três
parágrafos de contexto, ele já foi embora.

**Regra de posicionamento:** O box de maquininha aparece **antes** do primeiro
parágrafo de análise do produto. Não depois. Não no meio. Antes.

---

## Quando usar esta skill

Acionar sempre que o artigo contiver ao menos um dos contextos abaixo:

- Ranking de maquininhas (lista das melhores)
- Comparativo entre maquininhas específicas
- Review individual de uma maquininha com seção de produto
- Seção "Nossa escolha" ou "Recomendado" dentro de um artigo de guia

---

## Estrutura do box — padrão obrigatório

O box usa o padrão `contabilidade-container` já existente no projeto.
Referência de implementação: `src/pages/melhores-maquininhas-cartao-voucher-refeicao.astro`

```html
<div class="contabilidade-container">
  <div class="contabilidade-grid">

    <!-- COLUNA 1: Logo e nome -->
    <div class="logo-column">
      <a href="{link-afiliado}" class="logo-link" target="_blank" rel="sponsored noopener">
        <img src="{logo-da-maquininha}" alt="{Nome}" class="logo-image" width="120" height="48" loading="lazy">
      </a>
      <a href="{link-afiliado}" class="logo-text" target="_blank" rel="sponsored noopener">{Nome}</a>
    </div>

    <!-- COLUNA 2: Avaliação do editor -->
    <div class="rating-column">
      <div class="rating-wrapper">
        <span class="rating-score">{nota}</span>
        <span class="rating-total">/10</span>
      </div>
      <div class="rating-label">Avaliação do editor</div>
    </div>

    <!-- COLUNA 3: Preço + funcionalidades com ícone -->
    <div class="info-column">
      <h3 class="info-title">{Posicionamento em uma frase — ex: "Menor taxa no débito"}</h3>
      <ul class="info-list">
        <li>💰 A partir de R$ {preço} ({modelo})</li>
        <li>{ícone} {Funcionalidade 1 em linguagem de lojista}</li>
        <li>{ícone} {Funcionalidade 2 em linguagem de lojista}</li>
      </ul>
    </div>

    <!-- COLUNA 4: Botão de afiliado -->
    <div class="button-column">
      <a href="{link-afiliado}" class="visit-button" target="_blank" rel="sponsored noopener">Ver oferta</a>
      <div class="button-caption">{Chamada curta — ex: "20% OFF com cupom" ou "Clique para saber mais"}</div>
    </div>

  </div>
</div>
```

---

## Conteúdo do info-column — regras obrigatórias

### Primeiro item: sempre o preço

O primeiro item da lista é sempre o preço. Formato:
```
💰 A partir de R$ {valor} ({modelo específico})
```

Exemplos:
```
✓ 💰 A partir de R$ 51,52 (T2 com cupom)
✓ 💰 A partir de R$ 397,00 (Yelly Pro)
✓ 💰 Grátis (só paga a taxa por transação)
✗ "Preço acessível para todos os negócios" — proibido, sem valor real
```

### Segundo e terceiro itens: funcionalidades com ícone + texto

Cada funcionalidade usa um ícone emoji seguido da descrição em linguagem de lojista.

**Ícones padrão por categoria:**

| Categoria | Ícone | Exemplo de uso |
|-----------|-------|----------------|
| Conectividade / chip | 📶 | 📶 Chip 3G gratuito incluso |
| Bateria / autonomia | 🔋 | 🔋 36h de bateria (sem carregar no dia) |
| Voucher / vale | 🎫 | 🎫 Mais de 50 bandeiras de voucher |
| Recebimento / prazo | ⚡ | ⚡ Receba na hora (D+0 disponível) |
| Aluguel / mensalidade | 🚫 | 🚫 Sem aluguel mensal |
| Garantia | 🛡️ | 🛡️ Garantia vitalícia |
| Bandeiras aceitas | 💳 | 💳 Visa, Master, Elo, Amex, Hipercard |
| Compra da máquina | 🛒 | 🛒 Compra sem fidelidade |
| Recebimento parcelado | 📅 | 📅 Crédito parcelado em até 18x |
| App / gestão | 📱 | 📱 App com relatório de vendas em tempo real |

**Regras dos ícones:**
- Um ícone por item — nunca dois ícones no mesmo `<li>`
- Ícone no início, texto ao lado: `{ícone} {texto}` — nunca ícone isolado
- Texto máximo de uma linha em mobile (~40 caracteres) — cortar o desnecessário
- Escolher as 2 funcionalidades mais relevantes para o posicionamento daquele produto

---

## Regra do posicionamento no artigo

### Em ranking (lista de melhores)

Cada box aparece **imediatamente antes** da análise de texto daquele produto:

```
H2: [Nome da Maquininha] — [Posicionamento]
[box da maquininha]
[parágrafo de análise]
[tabela de taxas se houver]
[para quem faz sentido]
```

Nunca:
```
H2: [Nome da Maquininha]
[parágrafo de introdução]
[parágrafo de análise]
[box da maquininha]  ← errado, chegou tarde
```

### Em comparativo (dois produtos frente a frente)

Os dois boxes aparecem antes de qualquer análise comparativa:

```
H2: [Maquininha A] vs [Maquininha B]
[box Maquininha A]
[box Maquininha B]
[tabela comparativa de atributos — Modelo 1 ou 2 de data/modelo-html.md]
[análise textual]
```

### Em review individual

O box aparece logo após o H1 ou no início da seção de produto, antes da análise:

```
H1: [Nome]: Taxas, Preço e Avaliação em {ano}
[box da maquininha]
[introdução — 4 movimentos]
[H2s de análise]
```

---

## Posicionamento do info-title — regra de diferenciação

O `info-title` é o headline do card. Deve posicionar o produto em uma frase,
não repetir o nome da maquininha.

```
✗ "Ton T2" — repete o nome, não posiciona
✗ "Ótima opção para MEI" — genérico, poderia ser qualquer produto
✓ "Menor taxa de débito do mercado" — posicionamento concreto
✓ "Mais de 50 bandeiras de voucher" — diferencial específico
✓ "Sem aluguel + garantia vitalícia" — dois diferenciais em uma frase
✓ "Melhor custo-benefício para feiras e eventos" — perfil + diferencial
```

---

## Checklist antes de publicar o box

- [ ] Box aparece antes da análise de texto do produto?
- [ ] Primeiro item da lista é o preço com valor real?
- [ ] Funcionalidades usam ícone + texto (não texto puro)?
- [ ] Cada item da lista cabe em uma linha no mobile (~40 caracteres)?
- [ ] `info-title` posiciona o produto sem repetir o nome?
- [ ] Link de afiliado tem `rel="sponsored noopener"` e `target="_blank"`?
- [ ] Imagem do logo usa `loading="eager"` no primeiro card, `loading="lazy"` nos demais?
