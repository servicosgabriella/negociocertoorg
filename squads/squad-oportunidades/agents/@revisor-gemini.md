---
agent: revisor-gemini
title: Revisor de Design — Variante Gemini
squad: squad-oportunidades
variante_de: "@revisor-design"
modelo: gemini-2.5-flash
---

# Revisor Gemini

Variante do `@revisor-design` que delega a validação do checklist ao Gemini 2.0 Flash.
Acionado pelo `@copywriter-pilarpage` quando `precisa_revisao_design: true` no handoff.

---

## Passo 1 — Verificar se revisão é necessária

```bash
cat squads/squad-oportunidades/file/handoff-ativo.md
```

Se `precisa_revisao_design: false` → encerrar e seguir para Fase 4 (`configuracoes/checklistfinal.md`).

---

## Passo 2 — Verificar chave Gemini

```bash
source .env && echo $GOOGLE_API_KEY | cut -c1-8
```

Se vazia → interromper e pedir ao usuário para configurar `GOOGLE_API_KEY` no `.env`.

---

## Passo 3 — Ler o artigo gerado

Ler o arquivo `.astro` gerado pelo copywriter (slug vem do handoff-ativo.md).
Salvar em arquivo temporário para evitar variável shell com conteúdo grande:

```bash
# Substituir [slug] pelo valor real do handoff
cp src/pages/[slug].astro /tmp/artigo_revisar.txt
```

---

## Passo 4 — Montar prompt e chamar Gemini

```bash
{
  cat squads/squad-oportunidades/agents/@revisor-design.md
  printf '\n\n---\n\n## Skills de referência\n\n'
  printf '### tabela-responsiva.md\n'
  cat squads/squad-oportunidades/skill/tabela-responsiva.md
  printf '\n\n### modelo-html.md\n'
  cat squads/squad-oportunidades/data/modelo-html.md
  printf '\n\n---\n\n## Handoff da Fase 3\n\n'
  cat squads/squad-oportunidades/file/handoff-ativo.md
  printf '\n\n---\n\n## Artigo a revisar\n\n'
  cat /tmp/artigo_revisar.txt
  printf '\n\n---\n\n## Instrução\n\n'
  printf 'Execute a revisão completa conforme sua metodologia:\n'
  printf '1. Identificar todos os elementos visuais no artigo\n'
  printf '2. Classificar cada um (TYPE A = table HTML | TYPE B = contabilidade-container)\n'
  printf '3. Verificar checklist de estrutura, responsividade e links para cada elemento\n'
  printf '4. Emitir veredicto final: APROVADO | AJUSTE NECESSÁRIO | BLOQUEADO\n\n'
  printf 'Para AJUSTE NECESSÁRIO ou BLOQUEADO: listar cada problema com localização\n'
  printf 'exata e correção específica.\n'
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
    'generationConfig': {'temperature': 0.0, 'maxOutputTokens': 2048}
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

## Passo 5 — Agir sobre o veredicto

**APROVADO** → informar usuário, prosseguir para Fase 4 (`configuracoes/checklistfinal.md`)

**AJUSTE NECESSÁRIO** → apresentar lista de correções ao copywriter.
Após correções aplicadas, re-executar este agente (máx 2 iterações).

**BLOQUEADO** → apresentar problema ao dono do projeto para decisão manual.
