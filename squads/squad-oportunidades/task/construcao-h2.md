construcao-h2.md

---
Agentes: @arquiteto-pilarpage.md
skills: qualificador-h2.md
---

Entrada:
  todos a saída da task mapeamentosemantico.md 
Saida: |
  - todos os h2/h3/h4 estruturados da pagina pilar 

# Obejtivo

Identificar todos os subtópicos que a pillar precisa cobrir, decidir
quais viram H2, e construir cada título de H2 como cauda longa real — não como rótulo genérico.

# Passo 1 — Coletar candidatos de três fontes obrigatórias

* Os H2s não vêm da cabeça do agente. Vêm de onde o Google já mapeou a intenção do usuário.

- Fonta A os h2 extraídos  do mapeamentosemantico.md 

- Fonte B — "As pessoas também perguntaram" (PAA) Buscar o termo principal e extrair todas as perguntas do bloco PAA. Cada pergunta é um subtópico que o Google confirmou ter demanda real. Registrar as perguntas exatas — elas revelam a linguagem do usuário, não do redator.

- Fonte C — Autocomplete do Google
Buscar variações com prefixos: "maquininha que aceita voucher + [letra]" e sufixos comuns.
Também buscar: "como", "qual", "por que", "quando", "quanto" + tema principal.
O autocomplete revela o que o usuário digita antes de apertar enter — é intenção não filtrada.
Consolidar tudo em uma lista bruta de candidatos, sem filtrar ainda.

# Passo 2 — Filtro de viabilidade

Antes de qualquer outra decisão, eliminar candidatos que não têm massa crítica:

Subtópico que gera menos de 2-3 parágrafos de conteúdo útil → não é H2, é menção no corpo
Subtópico que é sinônimo direto do H1 sem diferença de intenção → não é H2
Subtópico que o usuário já resolveu antes de chegar nessa página → não pertence aqui

* utilizar a skill/qualificador-h2.md para decidir quais dos h2 devem ficar 

# Passo 3: O subtópico tem escopo para uma página inteira sozinho?

Sim (tem volume próprio + ângulo suficiente) → post de suporte no cluster (chamar o head-de-conteudo do squad conteudo, e falar para ele escrever o artigo linkando para a url que você vai criar para a pagina pilar)
Não (faz sentido apenas no contexto da pillar) → H2 na pillar

# Passo 4 identificar (só para H2s aprovados): Esse H2 tem gap nos concorrentes ou ângulo diferente?

Gap total ou parcial → H2 prioritário, vai para posição de destaque
Todos cobrem da mesma forma → H2 obrigatório mas sem diferencial competitivo


# Passo 5 — Construção do título de cada H2
H2 genérico não existe nesta estrutura. Cada H2 aprovado recebe um título como cauda longa
que incorpora a pergunta real do usuário e o contexto do nicho.

* Regra de construção:

O título do H2 deve responder uma pergunta específica ou nomear um subtópico com
contexto suficiente para o usuário entender o que vai encontrar ali.

Exemplos de transformação:
✗ "Para quem é indicada?"
✓ "Qual maquininha aceita mais bandeiras de voucher para quem atende empresas com benefícios?"

✗ "Planos e Preços"
✓ "Quanto custa habilitar voucher na maquininha? Taxas por bandeira comparadas"

✗ "Vale-Refeição"
✓ "Maquininhas que aceitam VR (Vale-Refeição): quais bandeiras e como habilitar"

✗ "Dúvidas frequentes"
✓ "Por que minha maquininha não está aceitando voucher? Causas e soluções"

Anti-padrão crítico: H2 que poderia estar em qualquer artigo sobre qualquer produto
é H2 genérico demais. O título precisa ser específico o suficiente para que, fora de
contexto, ainda identifique claramente o tema da página.