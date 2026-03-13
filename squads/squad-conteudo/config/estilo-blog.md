# Guia de Estilo — Blog Negócio Certo

## Princípio Fundamental

**O título no frontmatter `title:` é o H1 da página.** Não repita com `# H1` no corpo do artigo. O artigo começa com um parágrafo narrativo.

---

## Estrutura Obrigatória

```
[Parágrafo introdutório narrativo — 3-4 frases contextualizando]

---

## H2 #1 [Primeira seção]

Parágrafo explicativo.

Segundo parágrafo se necessário.

## H2 #2 [Segunda seção]

...e assim por diante.
```

### O que NÃO fazer:

❌ **Não comece com H1:**
```
# Pagamento de DAS do MEI  ← ERRADO
O DAS é...
```

❌ **Não abuse de listas de bullet points:**
```
O DAS cobre:
- INSS
- Impostos federais
- Impostos estaduais
```
*Use apenas quando for realmente uma lista. Parafrafos são preferidos.*

❌ **Não estruture com bullets no lugar de H2s:**
```
Quando pagar:
- Janeiro vence em 15 de fevereiro
- Fevereiro vence em 15 de março
```
*Use H2 + parágrafo em vez disso.*

---

## Parágrafo Narrativo (Introdução)

- **Comprimento:** 3-4 frases
- **Tom:** Conversacional, não corporativo
- **Objetivo:** Contextualizar o problema/benefício
- **Exemplo correto:**

> Se você abriu um MEI ou está pensando em se formalizar, a primeira coisa que vai precisar saber é sobre o DAS — aquele boleto mensal que financia suas contribuições ao INSS e os impostos federais.
>
> A maioria dos MEIs acha que é complicado, mas na verdade é bem direto. O segredo é saber o prazo, o valor exato, e configurar tudo para não esquecer.

---

## H2s: Estrutura Lógica

### Regras:

1. **Máximo 8-10 H2s por artigo** (nem poucos, nem muitos)
2. **Ordem lógica:** Responder perguntas progressivas
3. **Títulos descritivos:** "O que é DAS" é melhor que "DAS"
4. **Evite jargão:** "Quando vence o pagamento" é melhor que "Cronograma de vencimento"

### Exemplo de sequência boa:

1. O que é DAS e por que você tem que pagar
2. Quando vence o pagamento do DAS
3. Quanto custa o DAS em 2026
4. Como pagar o DAS
5. O que acontece se você atrasar
6. MEI obrigação versus opção
7. Como comprovar que pagou

---

## Parágrafos: Construção

### Regra: 1 ideia por parágrafo, 2-4 frases

❌ Parágrafo ruim (tudo em um lugar):
```
O DAS é importante porque cobre INSS, impostos federais e impostos estaduais.
Vence sempre no 15º do mês seguinte, ou seja, janeiro vence em fevereiro.
Custa entre R$ 70-85 mensais dependendo da atividade.
Se atrasar, você paga juros de 0,33% ao dia e multa de 20%.
```

✅ Parágrafo bom (ideias separadas):
```
DAS significa Documento de Arrecadação do Simples Nacional.
Basicamente, é o boleto mensal que substitui vários impostos
diferentes em um único pagamento.
Quando você vira MEI, a Receita Federal cria esse boleto e coloca
no portal para você gerar todo mês.

O DAS já inclui sua contribuição ao INSS — a mesma que garante
aposentadoria, auxílio-doença e salário-maternidade.
Então não é custo puro, é investimento no seu futuro.
```

---

## Listas: Quando Usar

### ✅ Use listas para:
- **3+ items de mesma categoria** (ex: formas de pagamento)
- **Passos sequenciais** (ex: passo a passo)
- **Checklist final** (ex: validação)

### ❌ Evite listas para:
- **Conceitos narrativos** (use parágrafo)
- **Comparações** (use tabela ou parágrafo)
- **Explicações** (use parágrafo)

### Exemplo correto de lista:

```
## Maneiras de pagar o DAS

Você pode pagar de várias formas:

- **Portal do Empreendedor:** Gere o boleto e pague em qualquer banco
- **Internet Banking:** Faça login e busque por "DAS"
- **Débito Automático:** Configure e o banco desconta sozinho
- **App MEI:** Use o app oficial da Receita Federal
```

---

## Tabelas: Quando Usar

Use tabelas para **comparação de valores/opções**:

```
| Atividade | Valor do DAS |
|-----------|-------------|
| Comércio | R$ 70-75 |
| Serviços | R$ 75-80 |
| Comércio + Serviços | R$ 80-85 |
```

❌ Não use tabelas para listas simples — use `<ul>` ou parágrafo.

---

## Frontmatter Completo (Obrigatório)

```yaml
---
title: "Seu Título em Até 60 Caracteres"
description: "Descrição curta para SEO (até 160 chars)"
pubDate: 2026-03-13
updatedDate: 2026-03-13
authorName: "Gabriella Fernandes"
authorRole: "Especialista em Negócios"
authorImage: "/images/perfil.jpg"
coverImage: "/images/seu-slug.png"
authorHref: "/autor/gabriella-fernandes"
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Blog"
    href: "/blog"
  - label: "Seu Artigo"
    href: "/blog/seu-slug"
faq:
  - question: "Pergunta frequente 1?"
    answer: "Resposta em 1-2 frases."
  - question: "Pergunta frequente 2?"
    answer: "Resposta em 1-2 frases."
---
```

---

## Linkagem Interna

- **Mínimo 1-2 links internos** para artigos relacionados
- **Use link em parágrafo natural**, não forçado:

✅ Correto:
```
Se você ainda não é MEI, veja nosso [guia completo sobre como abrir um MEI](/blog/como-abrir-um-mei/).
```

❌ Errado:
```
- [Como abrir MEI](/blog/como-abrir-um-mei/)
```

---

## Conclusão

- **Parágrafo de encerramento** (1-2 frases) resumindo a ação principal
- **Call-to-action** (CTA) relacionado (ex: link para artigo complementar)
- **Não use "Conclusão" como H2** — apenas um parágrafo narrativo no final

### Exemplo:

```
Se você ainda não é MEI, o primeiro lugar para começar é o [guia completo sobre como abrir um MEI](/blog/como-abrir-um-mei/). O processo é rápido, gratuito e online. Depois que tiver o CNPJ, o DAS é automático — é só configurar o débito e pronto.
```

---

## Checklist de Qualidade (para @qa-conteudo)

- [ ] **Sem H1 duplicado** — Apenas title no frontmatter
- [ ] **Começa com parágrafo narrativo** — Não com H2 ou lista
- [ ] **H2s estruturados logicamente** — Máximo 8-10, ordem clara
- [ ] **Parágrafos bem construídos** — 1 ideia por parágrafo, 2-4 frases
- [ ] **Listas usadas corretamente** — Apenas quando necessário (3+ items)
- [ ] **Tabelas claras** — Para comparações, não para listas
- [ ] **Frontmatter completo** — Todos os campos preenchidos
- [ ] **Linkagem interna** — Mínimo 1-2 links naturais
- [ ] **Conclusão forte** — Parágrafo de encerramento + CTA
- [ ] **Tom conversacional** — Sem corporativismo excessivo
- [ ] **Sem bullet points excessivos** — Máximo 2-3 listas por artigo
- [ ] **Sem jargão incompreensível** — Explicar termos técnicos
- [ ] **Sem erros de digitação/gramática** — Revisão final
- [ ] **Imagem/capa referenciada** — coverImage no frontmatter correto
