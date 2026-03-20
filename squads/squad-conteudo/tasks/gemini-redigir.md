---
task: Gemini Redigir Artigo
responsavel: "@head-de-conteudo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - briefing_file: Caminho para o arquivo de briefing gerado por @head-de-conteudo (obrigatório)
  - slug: Slug provisório para nomear arquivos temporários
Saida: |
  - artigo: Artigo completo em Markdown, revisado e corrigido pelo Claude
  - slug: Validado contra slug-rules.md (sem números, anos, datas — 3 a 5 palavras)
  - nota_revisao: Resumo das correções aplicadas pelo Claude
Checklist:
  - "[ ] Briefing salvo em arquivo temporário"
  - "[ ] GEMINI_API_KEY disponível no .env"
  - "[ ] Script de redação executado (exit code 0)"
  - "[ ] Artigo bruto do Gemini recebido"
  - "[ ] REVISÃO CLAUDE — blacklist: todos os itens verificados e violações corrigidas"
  - "[ ] REVISÃO CLAUDE — travessão (—) removido de todas as frases"
  - "[ ] REVISÃO CLAUDE — conectivos proibidos substituídos por alternativas naturais"
  - "[ ] REVISÃO CLAUDE — clichês corporativos reescritos"
  - "[ ] REVISÃO CLAUDE — efeito escada corrigido (3+ parágrafos de 1 linha fundidos)"
  - "[ ] REVISÃO CLAUDE — tom 80/20 verificado (técnico com personalidade)"
  - "[ ] REVISÃO CLAUDE — frontmatter completo para o layout do briefing"
  - "[ ] REVISÃO CLAUDE — slug validado (sem números/anos/datas, 3-5 palavras)"
  - "[ ] REVISÃO CLAUDE — todos os H2s do briefing presentes e desenvolvidos"
  - "[ ] REVISÃO CLAUDE — conclusão com próximo passo concreto"
  - "[ ] Nota de revisão gerada com total de correções"
  - "[ ] Artigo corrigido enviado para @qa-conteudo"
---

# *gemini-redigir

Redige artigo via Gemini API e aplica **revisão editorial obrigatória do Claude** antes de enviar ao `@qa-conteudo`.

O Gemini faz o volume. O Claude garante a qualidade.

## Uso

```
@head-de-conteudo

*gemini-redigir --briefing /tmp/briefing-{{slug}}.md
```

## Passo 1 — Salvar Briefing em Arquivo

O briefing deve estar em arquivo antes de executar o script.

```bash
# Salvar o briefing preenchido (baseado em templates/briefing-tmpl.md)
# Exemplo: /tmp/briefing-maquininha-mei.md
```

O arquivo deve conter o briefing completo: keyword, intenção, layout, H2s em ordem, estrutura de introdução, tamanho alvo, mapa de variantes.

## Passo 2 — Executar Gemini

```bash
node squads/squad-conteudo/tools/gemini-redigir.js \
  --briefing /tmp/briefing-{{slug}}.md \
  > /tmp/artigo-gemini-{{slug}}.md
```

O script injeta automaticamente `style-guide.md`, `blacklist.md`, `slug-rules.md` e `artigo-template.md` no system prompt do Gemini.

Tempo estimado: 30-90 segundos para um artigo de 2000-3000 palavras.

## Passo 3 — Revisão Editorial Claude (OBRIGATÓRIO)

**Esta etapa não pode ser pulada.** O Claude lê o artigo gerado pelo Gemini e aplica correções editoriais antes do QA.

### 3.1 — Blacklist (tolerância zero)

Ler `config/blacklist.md` e verificar o artigo linha por linha:

| Categoria | Ação |
|-----------|------|
| Conectivos proibidos (11 itens) | Substituir por alternativa natural sem perder o sentido |
| Clichês corporativos (7 itens) | Reescrever a frase completamente |
| Palavras banidas (vocabulário corporativo) | Substituir pelo equivalente humano da blacklist |

### 3.2 — Pontuação

- Remover **todo travessão (—)** usado no meio de frases → substituir por parênteses, vírgula ou ponto
- Verificar ponto e vírgula excessivo em frases que deveriam ser parágrafos separados

### 3.3 — Ritmo e Tom

- Identificar **efeito escada**: 3 ou mais parágrafos seguidos de 1 linha → fundir em bloco ou adicionar frase de desenvolvimento
- Verificar frequência de "você" — deve aparecer regularmente (não concentrado só na introdução)
- Verificar conclusão: tem próximo passo concreto? Se contiver "esperamos ter ajudado", "agora você sabe tudo" ou "em conclusão" → reescrever

### 3.4 — Estrutura e Frontmatter

- Verificar slug no frontmatter contra `config/slug-rules.md`: sem números, anos, datas, 3-5 palavras, lowercase+hífens
- Verificar se frontmatter está completo para o layout especificado no briefing
- Verificar se **todos os H2s do briefing** estão presentes e desenvolvidos (não apenas mencionados)
- Verificar se o mapa de variantes semânticas está distribuído conforme o briefing

### 3.5 — Nota de Revisão

Ao final da revisão, gerar nota para registro:

```
[REVISÃO CLAUDE — {{data}}]
Correções aplicadas no artigo Gemini:
- Blacklist: N violações corrigidas (listar tipos)
- Travessões: N removidos
- Ritmo: N ajustes de efeito escada
- Frontmatter: [OK / N campos corrigidos]
- Slug: [OK / corrigido para: novo-slug]
- H2s: [todos presentes / N ausentes adicionados]
Status: APROVADO PARA QA
```

## Passo 4 — Enviar para @qa-conteudo

Com o artigo corrigido, enviar para `@qa-conteudo` executar `*auditar-artigo`.

O @qa-conteudo não precisa saber que o artigo foi gerado pelo Gemini — ele audita o conteúdo final como sempre faz.

---

## Fallback

Se o script falhar (exit code 1) ou o artigo gerado for inadequado:

1. Registrar o erro exato do stderr
2. Executar `*redigir-artigo` com `@copywriter-seo` (Claude nativo) usando o mesmo briefing
3. Pular o Passo 3 — o Claude nativo já segue as diretrizes diretamente
4. Continuar o pipeline a partir do `@qa-conteudo`
