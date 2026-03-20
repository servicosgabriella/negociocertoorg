---
task: Gemini Pesquisar Pauta
responsavel: "@head-de-conteudo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - keyword: Palavra-chave principal (obrigatório)
  - intencao: Tipo de intenção classificado pelo @head-de-conteudo (obrigatório)
Saida: |
  - h2s: Lista de H2s validados com fonte indicada (mesmo formato de pesquisar-pauta.md)
  - gaps: Oportunidades identificadas nos concorrentes
  - keyword_confirmada: Keyword principal confirmada ou ajustada
  - mapa_variantes: Variantes semânticas mapeadas por H2
Checklist:
  - "[ ] Keyword e intenção recebidas"
  - "[ ] GEMINI_API_KEY disponível no .env"
  - "[ ] Script executado sem erros (exit code 0)"
  - "[ ] Saída no formato padrão de pesquisa"
  - "[ ] H2s validados pelo @head-de-conteudo (todos com fonte plausível)"
  - "[ ] Nenhum H2 genérico proibido na lista final"
  - "[ ] Mapa de variantes presente e completo"
  - "[ ] Entregue para @head-de-conteudo continuar o pipeline"
---

# *gemini-pesquisar

Executa pesquisa de H2s via Gemini API, substituindo `@pesquisador-seo` no modo `--via-gemini`.

A saída é idêntica ao formato de `*pesquisar-pauta` — o restante do pipeline não percebe a diferença.

## Uso

```
@head-de-conteudo

*gemini-pesquisar "maquininha para MEI" --intencao comercial
```

## Passo 1 — Verificar API Key

Confirmar que `GEMINI_API_KEY` está no `.env` antes de executar.

```bash
grep GEMINI_API_KEY .env
```

Se ausente: adicionar a chave e continuar. Se não tiver chave: ir para **Fallback**.

## Passo 2 — Executar Script

```bash
node squads/squad-conteudo/tools/gemini-pesquisar.js \
  --keyword "{{keyword}}" \
  --intencao {{intencao}} \
  > /tmp/pesquisa-{{slug-provisorio}}.md
```

Logs de progresso aparecem no stderr. A pesquisa formatada vai para o arquivo de saída.

## Passo 3 — Validar Saída

Após o script concluir, o `@head-de-conteudo` valida a pesquisa:

- [ ] Todos os H2s têm fonte indicada (PAA / relacionadas / autocomplete / gap concorrente)?
- [ ] Nenhum H2 genérico proibido ("O que é...", "Benefícios de..., "Como funciona...")?
- [ ] Mapa de variantes está presente com todas as variantes relevantes?
- [ ] Gaps dos concorrentes identificados?

Se alguma validação falhar: re-executar o script (máximo 2 tentativas). Se ainda falhar: **Fallback**.

## Fallback

Se o script falhar (exit code 1) ou a saída for inadequada após 2 tentativas:

1. Registrar o erro exato do stderr
2. Executar `*pesquisar-pauta` com `@pesquisador-seo` (Claude nativo)
3. Continuar o pipeline normalmente — o handoff é idêntico

O fallback é transparente para o restante do pipeline.
