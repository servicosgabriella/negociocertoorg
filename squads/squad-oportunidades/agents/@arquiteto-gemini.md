---
agent: arquiteto-gemini
title: Arquiteto Pilar Page — Variante Gemini
squad: squad-oportunidades
variante_de: "@arquiteto-pilarpage"
modelo: gemini-2.5-flash
proximo_agente: "@copywriter-pilarpage"
---

# Arquiteto Gemini

Variante do `@arquiteto-pilarpage` que delega a análise e construção da arquitetura
ao Gemini 2.0 Flash. Claude coleta os dados — Gemini processa.

---

## Passo 1 — Ler handoff

```bash
cat squads/squad-oportunidades/file/handoff-ativo.md
```

Extrair: `keyword`, `nicho`, e as 3 `urls_concorrentes`.

---

## Passo 2 — Verificar chave Gemini

```bash
source .env && echo $GOOGLE_API_KEY | cut -c1-8
```

Se vazia → interromper e pedir ao usuário para configurar `GOOGLE_API_KEY` no `.env`.

---

## Passo 3 — Extrair dados dos concorrentes (Claude executa)

Para cada URL do handoff, usar WebFetch e extrair:
- H1, Title Tag, meta description
- Todos os H2s e H3s
- Termos em negrito
- Estrutura do FAQ (se houver)

Salvar o resultado extraído diretamente em arquivo (evita variável shell com conteúdo grande):

```bash
cat > /tmp/competitor_data.txt << 'COMPETITOR_EOF'
[colar aqui os dados extraídos das 3 URLs]
COMPETITOR_EOF
```

---

## Passo 4 — Montar prompt e chamar Gemini

Construir o prompt concatenando arquivos e dados coletados — tudo via `cat` para
garantir serialização correta, sem risco de quebra por caracteres especiais:

```bash
{
  cat squads/squad-oportunidades/agents/@arquiteto-pilarpage.md
  printf '\n\n---\n\n## Skills disponíveis\n\n'
  printf '### otimizador-h1.md\n'
  cat squads/squad-oportunidades/skill/otimizador-h1.md
  printf '\n\n### qualificador-h2.md\n'
  cat squads/squad-oportunidades/skill/qualificador-h2.md
  printf '\n\n### construtor-slug.md\n'
  cat squads/squad-oportunidades/skill/construtor-slug.md
  printf '\n\n---\n\n## Handoff da Fase 1\n\n'
  cat squads/squad-oportunidades/file/handoff-ativo.md
  printf '\n\n---\n\n## Dados extraídos dos concorrentes\n\n'
  cat /tmp/competitor_data.txt
  printf '\n\n---\n\n## Instrução\n\n'
  printf 'Execute as 4 tasks em sequência usando as skills fornecidas:\n'
  printf '1. Mapeamento semântico — tabela de gaps identificados\n'
  printf '2. H1 + Title Tag — aplicar otimizador-h1.md\n'
  printf '3. Slug — aplicar construtor-slug.md\n'
  printf '4. H2s — aplicar qualificador-h2.md, retornar apenas os aprovados\n\n'
  printf 'Retorne o briefing completo em YAML com os campos:\n'
  printf 'keyword, h1, title_tag, slug, layout, variacoes_semanticas,\n'
  printf 'h2s (com tipo e h3s), gaps_prioritarios, links_internos_sugeridos.\n'
} > /tmp/gemini_prompt.txt
```

Serializar e chamar a API:

```bash
source .env

python3 -c "
import json
with open('/tmp/gemini_prompt.txt', 'r') as f:
    prompt = f.read()
payload = {
    'contents': [{'parts': [{'text': prompt}]}],
    'generationConfig': {'temperature': 0.2, 'maxOutputTokens': 6144}
}
print(json.dumps(payload))
" > /tmp/gemini_payload.json

RESPONSE=$(curl -s \
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/gemini_payload.json)

echo "$RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if 'candidates' in d:
    print(d['candidates'][0]['content']['parts'][0]['text'])
else:
    print('ERRO API:', json.dumps(d, indent=2))
    sys.exit(1)
"
```

---

## Passo 5 — Apresentar briefing e aguardar Gate 2

Exibir o output do Gemini ao usuário para aprovação:
- H1 e Title Tag
- Slug
- Estrutura de H2s
- Layout escolhido

Aguardar aprovação explícita antes de prosseguir.

---

## Passo 6 — Gravar handoff e chamar próximo agente

Após Gate 2 aprovado, gravar em `squads/squad-oportunidades/file/handoff-ativo.md`:

```yaml
fase: 2→3
keyword: ""
nicho: ""
h1: ""
title_tag: ""
slug: ""
layout: ""
variacoes_semanticas:
  - ""
h2s:
  - titulo: ""
    tipo: ""
    h3s:
      - ""
gaps_prioritarios:
  - ""
links_internos_sugeridos:
  - anchor_type: ""
    destino: ""
notas_arquiteto: ""
gerado_por: gemini-2.5-flash
```

**Encerrar esta sessão.** A Fase 3 exige sessão nova e limpa no Claude Sonnet.

Informar ao usuário para abrir nova sessão carregando apenas:
- `squads/squad-oportunidades/agents/@copywriter-pilarpage.md`
- `squads/squad-oportunidades/skill/copy-[NICHO].md` — 1 skill pelo nicho do handoff
- `squads/squad-oportunidades/skill/introdução.md`
- `squads/squad-oportunidades/skill/texto-ancora.md`
- `squads/squad-oportunidades/file/anchor-master.md`
- `squads/squad-oportunidades/file/handoff-ativo.md`
