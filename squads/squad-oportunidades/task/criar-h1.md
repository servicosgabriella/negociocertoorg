---

agents: @arquiteto-pilarpage.md

Entrada:
  - keyword principal
  - H1s dos concorrentes (extraídos no mapeamento semântico)
  - gaps identificados no mapeamento
Saida: |
  - H1 final com justificativa do ângulo
  - Title Tag separada com avaliação de visibilidade SERP

---

para executar essa tarefa use a skill: otimizador-h1.md

# Objetivo

Definir o H1 exato da pillar page — diferenciado dos concorrentes e calibrado ao nicho.

---

# Protocolo de execução (executar em ordem)

## Passo 1 — Carregar a skill
Ler `skill/otimizador-h1.md` na íntegra antes de qualquer análise.

## Passo 2 — Mapear o padrão dominante da SERP
Com base nos H1s dos concorrentes extraídos no mapeamento semântico:
- Identificar qual estrutura a maioria está usando
- Listar palavras e gatilhos que se repetem
- Identificar o que nenhum concorrente está dizendo

## Passo 3 — Avaliar se o padrão dominante está saturado
- Se 2 ou mais concorrentes usam estrutura idêntica → padrão saturado, diferenciar obrigatório
- Se há ângulo não explorado (tensão, especificidade, perfil do usuário) → usar esse ângulo
- Se o padrão dominante ainda é diferenciado → adaptar, não copiar

## Passo 4 — Gerar o H1
Aplicar os critérios do `otimizador-h1.md`:
- Conter a keyword principal
- **Máximo 60 caracteres** — contar antes de validar. Se ultrapassar, encurtar até caber
- Incluir sinal de atualização ao final: `(Atualizado 2026)`, `(2026)` ou `[2026]`
- Calibrar tom pelo nicho (contabilidade = direto, maquininha = moderado)
- Diferenciação em relação aos concorrentes é desejável mas nunca deve aumentar o tamanho além do limite

## Passo 5 — Gerar a Title Tag separada
- Diferente do H1 (peças distintas com funções distintas)
- Estimar largura em pixels (ver fórmula na skill) — máx 580px
- Se ultrapassar: encurtar preservando keyword e gancho

## Passo 6 — Entregar com justificativa
```
H1: [título final]
Justificativa: [ângulo escolhido e por que se diferencia dos concorrentes]

Title Tag: [título da SERP]
Estimativa de largura: [Xpx] — [VISÍVEL / CORTADO]
```

---

# Critérios de avaliação

* Volume — termo com maior demanda de busca
* Intenção comercial — sinaliza que a página compara/recomenda, não só explica
* Cobertura semântica — pode incluir variação secundária se não pesar o título
* Diferenciação — fugir do H1 idêntico ao dos concorrentes quando há ângulo melhor