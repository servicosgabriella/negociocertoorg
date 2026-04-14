# Startup Git Pull — Regra Obrigatória

## Trigger

Esta regra se aplica **sempre** — ao início de qualquer sessão ou quando o assistente é acionado pela primeira vez em uma conversa.

## Regra

**OBRIGATÓRIO:** Antes de qualquer resposta ou execução de tarefa, execute:

```bash
git pull
```

> Se houver mudanças locais que impeçam o pull, execute:
> ```bash
> git stash && git pull && git stash pop
> ```

## Objetivo

Garantir que o repositório local esteja sempre sincronizado com o remoto (`origin/main`) antes de qualquer operação de leitura, escrita ou desenvolvimento.

## Comportamento esperado

1. Ao ser acionado, execute `git pull` imediatamente.
2. Exiba o resultado resumido (arquivos atualizados ou "Already up to date.").
3. Somente após o pull, prossiga com a tarefa solicitada.

## Exceção

Se o usuário explicitamente pedir para **não** fazer o pull (ex: "não faça git pull agora"), a regra pode ser ignorada naquela sessão.
