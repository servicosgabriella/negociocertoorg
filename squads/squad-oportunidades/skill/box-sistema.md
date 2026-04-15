---
name: box-sistema.md
description: >
  Skill de estrutura visual dos cards de produto para artigos comparativos de software
  e sistemas (emissores NF-e, ERP, PDV, contabilidade online, etc.). Usar sempre que
  o layout for ReviewLayout e o nicho não for maquininha. Mesma estrutura HTML do
  contabilidade-container — só os ícones e o conteúdo mudam.
---

# Estrutura Visual — Box de Sistema/Software

## Premissa

O empresário que chega em um comparativo de software quer ver preço, plano e o que
diferencia cada opção antes de ler a análise. Se o box aparecer depois de dois
parágrafos, ele já foi embora para o concorrente.

**Regra de posicionamento:** O box aparece **antes** do primeiro parágrafo de análise
do produto. Não depois. Não no meio. Antes.

---

## Quando usar esta skill

Acionar sempre que o artigo usar `reviewlayout` e o nicho for:
- Emissor de nota fiscal eletrônica (NF-e, NFS-e, NFC-e)
- Sistema ERP / gestão empresarial
- Sistema PDV (ponto de venda)
- Contabilidade online (se o artigo for comparativo com cards, não ranking de escritórios)
- Qualquer software com planos e link de afiliado

---

## Estrutura do box — padrão obrigatório

Usa o mesmo `contabilidade-container` do projeto:

```html
<div class="contabilidade-container">
  <div class="contabilidade-grid">

    <!-- COLUNA 1: Logo e nome -->
    <div class="logo-column">
      <a href="{link-afiliado}" class="logo-link" target="_blank" rel="sponsored noopener">
        <img src="{logo-do-sistema}" alt="{Nome}" class="logo-image" width="120" height="48" loading="lazy">
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

    <!-- COLUNA 3: Preço + diferenciais -->
    <div class="info-column">
      <h3 class="info-title">{Posicionamento em uma frase — ex: "Gratuito para MEI"}</h3>
      <ul class="info-list">
        <li>💰 {preço do plano de entrada — ex: "Grátis" ou "A partir de R$ 49/mês"}</li>
        <li>{ícone} {Diferencial 1 em linguagem de empresário}</li>
        <li>{ícone} {Diferencial 2 em linguagem de empresário}</li>
      </ul>
    </div>

    <!-- COLUNA 4: Botão de afiliado -->
    <div class="button-column">
      <a href="{link-afiliado}" class="visit-button" target="_blank" rel="sponsored noopener">Ver plano</a>
      <div class="button-caption">{Chamada curta — ex: "Teste grátis por 30 dias" ou "Plano gratuito disponível"}</div>
    </div>

  </div>
</div>
```

---

## Conteúdo do info-column — regras obrigatórias

### Primeiro item: sempre o preço do plano de entrada

```
💰 Grátis (plano MEI)
💰 A partir de R$ 49/mês (plano Básico)
💰 R$ 0 na emissão + R$ 0,50 por NF-e acima de 50/mês
```

Nunca:
```
✗ "Preço acessível para pequenas empresas" — proibido, sem valor real
✗ "Planos a partir de valores competitivos" — proibido
```

### Segundo e terceiro itens: diferenciais com ícone

**Ícones padrão por categoria de sistema:**

| Categoria | Ícone | Exemplo |
|-----------|-------|---------|
| Nota fiscal / emissão | 📄 | 📄 Emite NF-e, NFS-e e NFC-e |
| Plano gratuito | 🆓 | 🆓 Plano gratuito até 50 NF-e/mês |
| Integração / API | 🔌 | 🔌 Integra com ERP e e-commerce |
| Usuários / equipe | 👥 | 👥 Multiusuário incluso no plano |
| Relatórios / gestão | 📊 | 📊 Dashboard de faturamento em tempo real |
| Suporte | 🎧 | 🎧 Suporte por chat e e-mail |
| Certificado digital | 🔐 | 🔐 Funciona com qualquer certificado A1/A3 |
| App mobile | 📱 | 📱 App iOS e Android incluso |
| Automação | ⚡ | ⚡ Emissão automática via API |
| Sem fidelidade | 🚫 | 🚫 Sem contrato de fidelidade |
| Reforma tributária | 🏛️ | 🏛️ Atualizado para Reforma Tributária 2026 |

**Regras:**
- Um ícone por item — nunca dois no mesmo `<li>`
- Texto máximo de uma linha em mobile (~40 caracteres)
- Escolher os 2 diferenciais mais relevantes para o posicionamento do produto

---

## Posicionamento no artigo

### Em ranking (lista dos melhores sistemas)

```
H2: [Nome do Sistema] — [Posicionamento]
[box do sistema]
[parágrafo de análise]
[tabela de planos/preços se houver]
[para quem faz sentido]
```

### Em comparativo (dois sistemas frente a frente)

```
H2: [Sistema A] vs [Sistema B]
[box Sistema A]
[box Sistema B]
[tabela comparativa — modelo-html.md]
[análise textual]
```

---

## Posicionamento do info-title — regra de diferenciação

Posicionar o produto, não repetir o nome:

```
✗ "Bling" — repete o nome
✗ "Ótimo para pequenas empresas" — genérico
✓ "Gratuito para MEI até 50 notas/mês" — concreto
✓ "Melhor custo para quem emite NFC-e no PDV" — perfil + diferencial
✓ "API mais completa do mercado" — posicionamento técnico
✓ "Atualizado para o padrão 2026 da Reforma Tributária" — urgência editorial
```

---

## Dados dos afiliados — consultar handoff-ativo.md

Os links de afiliado, logos e destaques estão em `file/handoff-ativo.md`
na seção `afiliados_disponiveis`. Usar os dados de lá — não inventar links.

---

## Checklist antes de publicar

- [ ] Box aparece antes da análise de texto do produto?
- [ ] Primeiro item é o preço com valor real (não genérico)?
- [ ] Diferenciais usam ícone + texto (não texto puro)?
- [ ] Cada item cabe em uma linha no mobile (~40 caracteres)?
- [ ] `info-title` posiciona sem repetir o nome do produto?
- [ ] Link de afiliado tem `rel="sponsored noopener"` e `target="_blank"`?
- [ ] Primeiro logo usa `loading="eager"`, demais usam `loading="lazy"`?
- [ ] Dados de logo e link vieram do `handoff-ativo.md`, não inventados?
