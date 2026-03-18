---
config: style-guide
title: Guia de Estilo Completo
version: 1.0.0
squad: squad-conteudo
consolida: estilo-blog.md + coding-standards.md
---

# Guia de Estilo Completo — Squad Conteúdo

**Single source of truth** para estilo editorial. Todos os agentes referenciam este arquivo.

Regras complementares:
- Lista negra de linguagem → `config/blacklist.md`
- Regras de slug/URL → `config/slug-rules.md`


---

## Tom e Voz

- **Público:** MEIs, empreendedores e microempreendedores brasileiros
- **Tom:** 80% técnico direto / 20% personalidade conversacional
- **Pronome:** "você" sempre — nunca "o leitor", "o usuário"
- **Voz:** ativa, presente

### A Proporção 80/20 na Prática

80% do artigo: português direto, limpo, técnico.
20%: um toque de personalidade, coloquialismo, proximidade.

Informalidade é tempero. Não é o prato.

### Use "Você" — Sempre

- "Você vai precisar de..."
- "O que você precisa saber é..."
- "Antes de você decidir..."

### Antecipe Dúvidas

Não espere o leitor ficar confuso. Responda antes:
- "Pode parecer complicado, mas..."
- "Você deve estar pensando: 'e se...'"
- "A pergunta que todo mundo faz aqui é..."

---

## Tom e Voz por Tipo de Página

Cada layout tem uma voz editorial distinta. Antes de escrever, identifique o layout e aplique o perfil correspondente.

### ContentLayout.astro — Artigo Informativo/Educativo

**Quem escreve:** Especialista acessível. Sabe mais que o leitor, mas não é professor.

**Para quem:** MEI ou empreendedor com uma dúvida concreta — veio buscar resposta, não aula.

**Tom:** 80% guia prático, 20% conversa humana. Mesma proporção geral, mas aplicada com foco em resolver, não em impressionar.

**Voz:**
- Explica como se o leitor já tivesse decidido aprender — sem convencer antes de ensinar
- Usa exemplos concretos com valores e datas reais ("R$ 75/mês", "vence dia 20")
- Antecipa a dúvida antes de ela surgir: "Você vai pensar que é complicado. Não é."
- Nunca usa jargão sem explicar na mesma frase

**Estrutura de voz ao longo do artigo:**
1. **Introdução:** Empatia rápida + promessa concreta. Máximo 3-4 frases.
2. **Desenvolvimento:** Uma ideia por parágrafo. Voz firme, sem rodeios.
3. **Conclusão:** Próximo passo real — nunca "esperamos ter ajudado".

**O que evitar:**
- Tom corporativo ("é fundamental ressaltar que...")
- Passiva desnecessária ("é necessário que seja feito...")
- Superlativo vazio ("a melhor solução do mercado")
- Explicar o óbvio ("como todos sabemos...")

---

### ReviewLayout.astro — Review / Ranking ("Melhores X")

**Quem escreve:** Redator sênior de conteúdo de afiliado. Como um amigo que já pesquisou tudo e está contando o que descobriu — com autoridade, sem chute.

**Para quem:** Empreendedor brasileiro, MEI a pequena empresa. Pragmático, desconfiado de propaganda. Toma decisão por preço + facilidade + "não me dê dor de cabeça". Lê no celular, no intervalo, decide rápido.

#### Tom

Segunda pessoa informal ("você"). Conversacional, mas com autoridade. Sem entusiasmo exagerado, sem caps lock, sem exclamações em sequência.

Coloquialismos naturais do brasileiro são bem-vindos: "pois é", "é chato, mas", "tá bombando", "isso aqui é presente". Nunca linguagem corporativa: proibido "solução", "ecossistema robusto", "experiência do usuário".

#### Estrutura obrigatória de cada review

1. **Abertura com dor validada** — 2-3 frases curtas que nomeiam o problema real do leitor antes de mencionar qualquer produto
2. **Posicionamento editorial** — "a gente fez o trabalho por você" / "depois de analisar X opções"
3. **Destaque rápido do vencedor** — uma frase com o resultado, sem suspense desnecessário
4. **Lista de benefícios em bullets curtos** — máximo 6 itens, começando pelo mais importante, sem adjetivos vazios
5. **Taxas/preços com contexto** — sempre com comparativo direto em reais ("no concorrente X custa R$Y, aqui custa R$Z, diferença de R$W por mês")
6. **Detalhamento de funcionalidades** em parágrafos curtos (2-4 linhas cada), uma funcionalidade por parágrafo
7. **Prova social** — nota no Reclame Aqui ou Google com contexto ("não é aquela nota inflada com 50 reviews manipuladas")
8. **O que eu não gostei** — 1-2 críticas reais, minimizadas com contexto ("acontece com qualquer concorrente", "mas funciona muito bem")
9. **Fechamento com CTA suave** — reafirma para quem vale, menciona oferta exclusiva sem pressão excessiva

#### Regras de números

- Sempre converta percentual em impacto real em reais para o leitor médio do nicho
- Use faixas de faturamento realistas para o público ("quem vende entre R$10k e R$15k por mês")
- Mostre o cálculo explícito quando comparar concorrentes

#### Credibilidade editorial

- Sempre mencione data de verificação ("verificado em [mês] de [ano]")
- Inclua a metodologia brevemente: "analisamos X opções" / "consideramos três pilares: A, B e C"
- Inclua pelo menos uma crítica legítima por produto — reviews sem pontos negativos parecem falsos

#### Proibições específicas do ReviewLayout

- Nunca diga "o melhor do mercado" sem provar com dado
- Nunca use "incrível", "surpreendente", "revolucionário"
- Nunca abra com adjetivo: proibido começar com "Excelente opção para..."
- Nunca faça parágrafo com mais de 5 linhas
- Nunca liste mais de 3 pontos sem intercalar com prosa
- Bullets são para listas objetivas (preços, taxas, funcionalidades técnicas) — a maior parte do conteúdo deve ser prosa corrida. Proibido criar bullets para substituir parágrafos ou fragmentar raciocínios que fluiriam melhor em texto
- Nunca use Frases como "O mercado de X no Brasil é grande e fragmentado" ou "O setor
  de Y vive um momento de transformação" são marcadores imediatos de IA.
  Em vez disso, traduza o dado para a consequência real do leitor: o que isso
  significa pra ele, no dia a dia, no bolso, na operação.

---

### Regra: Sem Jargão Técnico — Traduza para o Benefício Real

Nunca escreva para impressionar com vocabulário técnico. Escreva para que o leitor entenda na primeira leitura e saia sabendo o que fazer.

**Princípio:** Cada dado técnico precisa ter a consequência prática para o leitor logo em seguida.

| Em vez de escrever | Escreva assim |
|--------------------|---------------|
| "Tecnologia NFC com protocolo ISO/IEC 14443" | "Aceita pagamento por aproximação, sem precisar inserir o cartão" |
| "Liquidação D+1 para débito e D+30 para crédito à vista" | "O dinheiro do débito cai na sua conta no dia seguinte. O crédito à vista cai em 30 dias." |
| "Taxas MDR de 0,75% a 3,99% dependendo da bandeira" | "Você paga entre 0,75% e 3,99% por venda, dependendo do cartão do cliente" |
| "Integração com ERP via API REST" | "Conecta com o sistema de gestão que você já usa" |
| "Criptografia ponta a ponta certificada PCI-DSS" | "Os dados do cartão ficam protegidos — nenhuma informação vaza para fora" |

**Regra de ouro:** Se você usou um termo técnico, a frase seguinte deve explicar o que isso significa na prática para quem tem um bar, mercado ou salão.

**O que é proibido:**
- Listar especificações técnicas sem contexto de uso
- Usar siglas sem explicar (NFC, MDR, PCI, API, etc.) sem parentético
- Falar de "tecnologia X" sem dizer o que a pessoa ganha com isso no dia a dia

---

### Regra: Reviews de Maquininhas — Escreva Como Quem Testou

Para artigos de review de maquininhas, o redator deve escrever como se tivesse **testado pessoalmente cada equipamento**. Isso cria autoridade editorial, aproxima o leitor e diferencia o conteúdo de uma simples comparação de specs.

#### Como aplicar a voz de quem testou

Use expressões que transmitam experiência direta, sem mentir ou inventar:

| Voz técnica/fria | Voz de quem testou |
|------------------|--------------------|
| "A maquininha possui conectividade Wi-Fi e 4G" | "Na prática, conectar no Wi-Fi foi questão de segundos. O 4G entrou sozinho onde não tinha sinal." |
| "O tempo de aprovação é de 3 segundos" | "A transação aprovava rápido, sem aquela demora que constrange o cliente na fila." |
| "Bateria de 5.200 mAh" | "A bateria aguentou o dia inteiro sem precisar carregar no meio do expediente." |
| "Display touchscreen de 5 polegadas" | "A tela é grande o suficiente para o cliente digitar a senha sem ter que inclinar para ver." |
| "Suporta 50 bandeiras de voucher" | "Aceitou Alelo, VR, Sodexo, Ticket e outros que você provavelmente nunca viu aparecer, mas aparecem." |

#### Expressões de voz editorial aprovadas para maquininhas

- "No nosso teste..."
- "Na prática..."
- "O que percebemos foi..."
- "Quem usa no dia a dia vai notar..."
- "A gente testou e..."
- "Na hora de usar de verdade..."
- "O que chama atenção quando você pega na mão é..."
- "No balcão do dia a dia..."

#### O que manter mesmo com voz de teste

- Dados objetivos (preços, taxas, prazo de recebimento) sempre com fontes verificáveis
- Críticas reais e proporcionais
- Comparativo com concorrentes usando dados concretos

---

## Estrutura Obrigatória do Artigo

O título no frontmatter `title:` é o H1 da página. **Não repita com `# H1` no corpo do artigo.** O artigo começa com um parágrafo narrativo.

```
[Parágrafo introdutório narrativo — 3-4 frases contextualizando]

---

## H2 #1 [Primeira seção]

Parágrafo explicativo.

Segundo parágrafo se necessário.

## H2 #2 [Segunda seção]

...e assim por diante.
```

### O que NÃO fazer na estrutura:

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
```
*Use apenas quando for realmente uma lista. Parágrafos são preferidos.*

---

## Introdução: Parágrafo Narrativo

- **Comprimento:** 3-4 frases
- **Tom:** Conversacional, não corporativo
- **Objetivo:** Contextualizar o problema/benefício

### Escolha UMA das 3 Estruturas

#### Modelo de Ponte (ideal para intenção comercial)

1. **Situação desejada** — pinte onde o leitor quer chegar (1-2 frases)
2. **Situação atual** — traga de volta para a dor real (1-2 frases)
3. **A ponte** — posicione o artigo como o caminho entre os dois (1 frase)

**Template:**
> Imagine que você pudesse [situação desejada]. [Desenvolva brevemente.]
>
> Mas agora mesmo, aqui está você. [Descreva a dor sem exagerar.]
>
> Não precisa ser assim. Neste artigo você vai [promessa concreta].

#### CPP — Concorde > Prometa > Preveja (ideal para informacional e tutoriais)

1. **Concorde** — reconheça o problema como real e legítimo
2. **Prometa** — diga que tem a solução
3. **Preveja** — dê um gostinho do que vem no artigo

**Template:**
> [Concordar com a dificuldade.] Não é?
>
> [Prometida: isso tem solução.] Não é tão difícil quanto parece.
>
> Neste artigo você vai ver [lista rápida de 2-3 pontos].

#### Pergunta + Dor + Promessa (ideal para intenção informacional clara)

1. **Pergunta** que o leitor já está fazendo mentalmente
2. **Dor** — o que acontece quando a resposta errada é escolhida
3. **Promessa** — o que o artigo entrega

**Template:**
> [Pergunta direta sobre o tema]?
>
> [Consequência de errar ou não saber a resposta.]
>
> Neste guia você vai [promessa específica].

### Regras Universais de Introdução

- **NUNCA** comece com definição ("X é um conjunto de...")
- Keyword principal nos primeiros 100 palavras — natural
- Máximo 4-5 parágrafos curtos
- Termine com promessa clara do que o leitor vai aprender

### Exemplos Aprovados de Abertura (vocabulário positivo)

✅ **Abertura por dor direta:**
> Se você abriu um MEI ou está pensando em se formalizar, a primeira coisa que vai precisar saber é sobre o DAS. Aquele boleto mensal que financia suas contribuições ao INSS e os impostos federais.

✅ **Abertura por pergunta + solução imediata:**
> Quanto custa uma maquininha para MEI? Depende do que você precisa — mas a resposta prática cabe em três categorias. Este guia vai direto ao ponto.

✅ **Abertura por situação + empatia:**
> Você vai ao Google, busca "como abrir MEI", acha 15 artigos diferentes com informações contraditórias. Calma. O processo tem 4 passos, todos gratuitos e online. Aqui vai cada um deles.

---

## H2s: Estrutura e Regras

### Regras

1. **Máximo 8-10 H2s por artigo** (nem poucos, nem muitos)
2. **Ordem lógica:** Responder perguntas progressivas
3. **Títulos descritivos:** "O que é DAS" é melhor que "DAS"
4. **Evite jargão:** "Quando vence o pagamento" é melhor que "Cronograma de vencimento"
5. **Não coloque travessões (linhas cinzas) entre H2s** — a estrutura H2 já provê separação visual

### Todo H2 deve ter fonte real verificável no Google

H2s vêm de: PAA (Pessoas Também Perguntaram), buscas relacionadas, autocomplete ou concorrentes. H2s genéricos são proibidos. Ver `agents/pesquisador-seo.md` para regras completas.

### H2s Genéricos Proibidos

- "O que é [tema]"
- "Benefícios de [tema]"
- "Como funciona [tema]"
- "Vantagens e desvantagens"
- "Dicas para [tema]"
- "Conclusão"

### Exemplo de Sequência Boa

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

❌ **Parágrafo ruim** (tudo em um lugar):
```
O DAS é importante porque cobre INSS, impostos federais e impostos estaduais.
Vence sempre no 15º do mês seguinte, ou seja, janeiro vence em fevereiro.
Custa entre R$ 70-85 mensais dependendo da atividade.
Se atrasar, você paga juros de 0,33% ao dia e multa de 20%.
```

✅ **Parágrafo bom** (ideias separadas):
```
DAS significa Documento de Arrecadação do Simples Nacional.
Basicamente, é o boleto mensal que substitui vários impostos
diferentes em um único pagamento.

O DAS já inclui sua contribuição ao INSS — a mesma que garante
aposentadoria, auxílio-doença e salário-maternidade.
Então não é custo puro, é investimento no seu futuro.
```

### Exemplos Aprovados de Parágrafos de Desenvolvimento (vocabulário positivo)

✅ **Parágrafo explicativo com dado específico:**
> O MEI paga o DAS mensalmente, com vencimento no dia 20 de cada mês. Isso vale para todos, sem exceção. Se o dia 20 cair num sábado, domingo ou feriado, o vencimento passa para o próximo dia útil.

✅ **Parágrafo com comparação clara:**
> Pagar R$ 75 por mês como MEI é diferente de pagar R$ 75 por mês como PJ. O MEI já tem INSS, ISS e ICMS incluídos nesse valor. O PJ paga cada imposto separado — e a conta costuma ser bem mais alta.

---

## Ritmo Visual: Anti-Efeito Escada

### O Problema a Evitar

```
❌ EFEITO ESCADA (PROIBIDO):

Primeiro ponto.

Segundo ponto.

Terceiro ponto.

Quarto ponto.
```

Cansa visualmente e parece lista disfarçada de texto.

### O Padrão Correto

```
✅ RITMO VARIADO (CORRETO):

Aqui vai um bloco de 2-3 linhas desenvolvendo uma ideia com
contexto suficiente para o leitor entender o raciocínio completo.

Frase de impacto curta.

Outro bloco médio continuando o raciocínio e avançando para o
próximo ponto, com conexão clara do que veio antes.
```

### Regras de Ritmo

- Máximo 3-4 linhas por bloco
- Nunca mais de 2 frases de impacto (1 linha) seguidas
- Intercale: bloco → impacto → bloco → impacto
- Linha em branco entre todos os parágrafos

---

## Pontuação: Travessão Proibido

**NÃO USE travessão (—) para quebrar frases.** Isso quebra o ritmo visual e pode não renderizar corretamente em navegadores.

| Cenário | Use isso | Exemplo |
|---------|----------|---------|
| Complemento ou nota | **Parênteses** | "O DAS (Documento de Arrecadação) é obrigatório." |
| Separação natural | **Vírgula** | "O DAS, um documento de arrecadação, é obrigatório." |
| Quebra clara de ideia | **Ponto + nova frase** | "O DAS é obrigatório. Você deve pagar todo mês." |
| Lista de items | **Bullets (`-` no Markdown)** | `- Item um` |
| Intervalo de datas/números | **Travessão (ok)** | "2024–2025" ou "páginas 15–20" |

```
❌ PROIBIDO:
O DAS — Documento de Arrecadação — é obrigatório.

✅ CORRETO (opção 1 - parênteses):
O DAS (Documento de Arrecadação) é obrigatório.

✅ CORRETO (opção 2 - vírgula):
O DAS, um documento de arrecadação, é obrigatório.
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

---

## Tabelas: Quando Usar

Use tabelas para **comparação de valores/opções**. Não para listas simples.

---

## Conclusão

- **Parágrafo de encerramento** (1-2 frases) resumindo a ação principal
- **Call-to-action** (CTA) relacionado (ex: link para artigo complementar)
- **Não use "Conclusão" como H2** — apenas um parágrafo narrativo no final

### NUNCA termine com:
- "Esperamos ter ajudado!"
- "Agora você sabe tudo sobre..."
- "Como você pode ver..."
- "Em conclusão..."
- "Gostou? Compartilhe!"

### Termine com:
- Um próximo passo concreto
- Uma pergunta que provoque reflexão
- Uma ressalva importante
- Um link interno relevante com contexto real

### Exemplo Aprovado de Conclusão (vocabulário positivo)

✅ **Conclusão com próximo passo concreto:**
> Se você ainda não é MEI, o primeiro lugar para começar é o [guia completo sobre como abrir um MEI](/blog/como-abrir-um-mei/). O processo é rápido, gratuito e online. Depois que tiver o CNPJ, o DAS é automático — é só configurar o débito e pronto.

✅ **Conclusão com ressalva importante:**
> Uma última coisa: se você tiver dívidas de DAS em atraso, regularize antes de tentar qualquer financiamento ou benefício. O CNPJ irregular bloqueia tudo. O [parcelamento de débitos MEI](/blog/parcelamento-debitos-mei/) explica como fazer isso sem complicação.

---

## Intenção de Busca

Classificar antes de produzir qualquer conteúdo. Ver `agents/head-de-conteudo.md` para tabela de classificação completa.

| Tipo | O Que o Usuário Quer | Formato Ideal |
|------|---------------------|---------------|
| **Informacional** | Aprender algo | Guia, explicação, tutorial |
| **Comercial** | Comparar antes de comprar | Comparativo, reviews, top X |
| **Transacional** | Comprar agora | Produto, preços, onde comprar |
| **Navegacional** | Encontrar um site/marca | Sobre, home, landing page |

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
- **Use link em parágrafo natural**, não forçado

✅ Correto:
```
Se você ainda não é MEI, veja nosso [guia completo sobre como abrir um MEI](/blog/como-abrir-um-mei/).
```

❌ Errado:
```
- [Como abrir MEI](/blog/como-abrir-um-mei/)
```
