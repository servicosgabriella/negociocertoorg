---
agent: estrategista-gemini
title: Estrategista de Buscas — Entrada do Pipeline Gemini
squad: squad-oportunidades
variante_de: "@estrategista-buscas"
proximo_agente: "@arquiteto-gemini"
---

# Estrategista — Entrada Pipeline Gemini

Executa a metodologia completa de `@estrategista-buscas.md` sem nenhuma modificação.
Claude processa tudo diretamente — sem chamada ao Gemini nesta fase.

**A única diferença:** ao finalizar e gravar o handoff, chamar `@arquiteto-gemini`
em vez de `@arquiteto-pilarpage`.

---

## Execução

Seguir integralmente `squads/squad-oportunidades/agents/@estrategista-buscas.md`.

---

## Ao finalizar (após Gate 1 aprovado)

Gravar em `squads/squad-oportunidades/file/handoff-ativo.md`:

```yaml
fase: 1→2
oportunidade_aprovada:
  keyword: ""
  score: ""
  angulo_sugerido: ""
  nicho: ""
urls_concorrentes:
  - url: ""
    posicao_serp: ""
  - url: ""
    posicao_serp: ""
  - url: ""
    posicao_serp: ""
notas_estrategista: ""
```

**Ativar `@arquiteto-gemini` diretamente nesta mesma sessão** — não abrir nova sessão.
O arquiteto delega ao Gemini via API, portanto o acúmulo de contexto é mínimo.
A sessão nova só é necessária na Fase 3 (Claude Sonnet para redação).
