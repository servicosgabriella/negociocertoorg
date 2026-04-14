--- 
name: otimizador-texto-ancora
description: >
  Skill reutilizável para definir, avaliar e registrar textos âncora de links internos
  e externos. Use sempre que qualquer agente precisar criar um link — seja num post de
  cluster, guest post, inserção de link em conteúdo existente, ou qualquer situação onde
  um texto clicável precisa ser definido. Esta skill consulta o anchor-master.md para
  calcular o saldo atual de cada tipo de âncora antes de decidir qual usar, garante
  naturalidade linguística, evita repetição exata, e registra cada âncora usada para
  manter o controle de proporção ao longo do tempo. Acionar para links internos E externos.
---

# Otimizador de Texto Âncora

## Identidade

Esta skill garante que cada link criado no site pareça natural para o Google e
contribua para o ranqueamento da página de destino — sem criar padrões artificiais
que sinalizem manipulação.

**Premissa central:** O Google sabe que é estatisticamente impossível dezenas de
páginas linkarem para o mesmo destino usando exatamente a mesma frase. Perfil de
âncoras natural é o que separa um site que ranqueia de um que leva penalidade.

---

## Input esperado

- **URL de destino do link** — a página que receberá o link
- **Tipo de link** — interno (entre páginas do mesmo site) ou externo (guest post, backlink)
- **Contexto da frase** — onde o link vai entrar no texto (para avaliar naturalidade)
- **Arquivo `anchor-master.md`** — estado atual das âncoras usadas para aquela URL

---

## Proporções por tipo de link

### Links internos — proporção fixa

```
50% Target  — keyword principal ou variações diretas
25% Brand   — nome do site ou URL nua
25% Misc    — âncoras genéricas com contexto ao redor
```

Links internos permitem proporção mais agressiva em Target porque o Google
trata linkagem interna com menos suspeita que backlinks externos.

### Links externos — proporção baseada em concorrentes

Para guest posts e backlinks externos, a proporção ideal varia por nicho e
nível de competição. Antes de definir a âncora de um link externo, verificar
a proporção que os top 5 concorrentes usam para aquela keyword.

Se não houver dados de concorrentes disponíveis, usar proporção conservadora:
```
30% Target
30% Brand
40% Misc
```

---

## Processo de decisão — executado em sequência

### PASSO 1 — Ler o `anchor-master.md`

Carregar o arquivo e localizar a seção da URL de destino.
Calcular o saldo disponível de cada tipo:

```
Total de links registrados: N
Target disponível: (N × 0,50) - links target já usados
Brand disponível: (N × 0,25) - links brand já usados
Misc disponível: (N × 0,25) - links misc já usados
```

Se a URL de destino ainda não existe no arquivo, criar a seção do zero
com saldo zerado.

---

### PASSO 2 — Identificar o tipo disponível

Com base no saldo calculado, identificar qual tipo tem espaço disponível.

Se mais de um tipo está disponível, priorizar na ordem:
1. Target (se saldo > 0 e âncora exata ainda não foi usada)
2. Brand (se saldo > 0)
3. Misc (se saldo > 0)

Se todos os tipos estão no limite, o próximo link deve ser Misc com contexto
rico ao redor — nunca forçar Target quando o saldo está esgotado.

---

### PASSO 3 — Construir a âncora

Com o tipo definido, construir a âncora seguindo as regras de cada tipo:

#### Target — regras de construção

**Regra absoluta:** Nunca repetir âncora target exata já usada para aquela URL.
Consultar a lista "Âncoras target já usadas" no `anchor-master.md` antes de definir.

**Variações target aceitas (nunca repetir a mesma):**
- Keyword exata: "maquininhas de cartão"
- Variação com artigo: "as maquininhas de cartão"
- Variação com qualificador: "maquininhas de cartão para MEI"
- Variação com verbo: "escolher maquininha de cartão"
- Sinônimo LSI: quando todas as variações diretas já foram usadas,
  usar sinônimos semânticos — "máquinas de cartão", "terminais de pagamento"
- Frase longa descritiva: até 10 palavras explicando o destino
  — "guia completo de maquininhas de cartão para pequenos negócios"
- Title Tag exata: usar o H1 da página de destino como âncora

**Naturalidade obrigatória:** A âncora precisa soar como parte da frase,
não como keyword jogada no meio do texto.

```
✗ "SEO-ês" robótico:
"contabilidade online são paulo preço barato"

✓ Linguagem humana:
"contabilidade online em São Paulo"
"um serviço de contabilidade online para empresas em São Paulo"
```

**Quebra de keyword — quando e como usar:**
Recurso para usar quando uma página está travada no ranqueamento apesar
de links existentes. Não faz parte da distribuição normal.

Quando acionado: tornar clicável apenas parte da keyword alvo.

```
Alvo: "Contabilidade Online São Paulo"
Quebras possíveis:
- Apenas "Contabilidade" é clicável
- Apenas "São Paulo" é clicável
- "contabilidade online" sem o local
```

Registrar quebras de keyword como tipo Target no `anchor-master.md`.

---

#### Brand/URL — regras de construção

Variar o formato sempre — nunca usar a mesma forma de URL duas vezes seguidas.

**Formatos disponíveis para revezar:**
```
Nome do site:     "MaquininhaCerta"
URL com https:    "https://maquininhacerta.com.br"
URL com www:      "www.maquininhacerta.com.br"
URL limpa:        "maquininhacerta.com.br"
URL com path:     "maquininhacerta.com.br/maquininhas-cartao/"
Marca + alvo:     "MaquininhaCerta — Guia de Maquininhas"
```

---

#### Misc — regras de construção

Âncoras genéricas nunca ficam sozinhas. Sempre cercar com palavras-chave
de contexto na mesma frase — o Google lê o entorno do link para passar
relevância tópica.

```
✗ Misc sem contexto:
"clique aqui"
"saiba mais"
"leia o guia"

✓ Misc com contexto ao redor:
"Para entender como as taxas ocultas da maquininha afetam seu lucro, clique aqui"
"Se quiser comparar todas as opções disponíveis, saiba mais neste guia completo"
"Para ver o ranking atualizado de março de 2026, leia o guia aqui"
```

**Fórmula:** [contexto com keyword] + [âncora genérica]
O contexto deve sempre conter o tema da página de destino.

---

### PASSO 4 — Verificar naturalidade no contexto

Antes de confirmar a âncora, ler a frase completa onde o link vai entrar.

Teste de naturalidade: a âncora parece que foi escrita por um humano que
está recomendando aquela página? Ou parece que foi inserida por um robô
para fins de SEO?

```
✗ Forçada:
"As maquininhas de cartão para MEI têm características específicas.
Você pode ver as melhores maquininhas de cartão para MEI aqui."
(keyword forçada, repetição óbvia)

✓ Natural:
"As maquininhas têm características específicas para quem trabalha
no CPF. Se quiser comparar as principais opções disponíveis hoje,
veja este guia atualizado."
```

---

### PASSO 5 — Registrar no `anchor-master.md`

Após confirmar a âncora, atualizar o arquivo:

1. Adicionar linha no histórico de âncoras usadas da URL de destino
2. Atualizar o saldo do tipo usado
3. Se for âncora target, adicionar à lista "Âncoras target já usadas"
4. Atualizar a data da última atualização do arquivo

---

## Referência rápida — tipos de âncora por situação

| Situação | Tipo recomendado | Exemplo |
|----------|-----------------|---------|
| Primeiro link para a pillar | Target exata | "maquininhas de cartão" |
| Segundo link para a pillar | Target variação | "escolher maquininha de cartão" |
| Terceiro link | Brand | "MaquininhaCerta" |
| Quarto link | Misc com contexto | "veja o guia completo de maquininhas aqui" |
| Quinto link | Target LSI | "terminais de pagamento" |
| Sexto link | Target frase longa | "guia de maquininhas de cartão para pequenos negócios" |
| Saldo target esgotado | Misc com contexto rico | sempre com keyword ao redor |
| Ranqueamento travado | Target quebrada | só "maquininha" ou só "cartão" |

---

## Anti-padrões — o que esta skill nunca faz

- **Nunca repete âncora target exata** — consulta o histórico antes de definir
- **Nunca usa âncora genérica sem contexto** — Misc sempre tem keyword ao redor
- **Nunca usa linguagem de SEO-ês** — âncora precisa soar como frase humana
- **Nunca ignora o saldo** — sempre lê o `anchor-master.md` antes de decidir
- **Nunca cria arquivo novo** — sempre atualiza o `anchor-master.md` existente
- **Nunca force Target quando o saldo está esgotado** — respeitar a proporção
- **Nunca usa quebra de keyword na distribuição normal** — é recurso de troubleshooting