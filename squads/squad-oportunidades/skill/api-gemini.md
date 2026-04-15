---
skill: api-gemini
title: Chamada de API — Gemini 2.0 Flash
description: >
  Executa prompts no Gemini 2.0 Flash via API REST usando Bash + curl.
  Usado pelo pipeline-pilarpage-gemini.md nas fases 1, 2 e 3.5.
  Requer GOOGLE_API_KEY configurada como variável de ambiente.
model: gemini-2.5-flash
---

# Skill — API Gemini

## Pré-requisito

Usar a variável `GOOGLE_API_KEY` (já configurada no `.env` do projeto para o Google AI Studio —
é a mesma chave que o Gemini usa). Verificar antes de usar:

```bash
echo $GOOGLE_API_KEY | cut -c1-8
```

Se vazia, interromper e avisar o usuário para configurar `GOOGLE_API_KEY` no `.env`.

---

## Como chamar o Gemini

### Por que usar arquivo temporário

Prompts grandes (conteúdo de múltiplos arquivos concatenados) contêm aspas, barras,
quebras de linha e caracteres especiais que quebram JSON inline no curl.
**Sempre usar arquivo temporário** para garantir serialização correta.

### Padrão robusto (obrigatório)

```bash
# 1. Escrever o prompt em arquivo temporário
cat > /tmp/gemini_prompt.txt << 'EOF'
[conteúdo do prompt aqui]
EOF

# 2. Montar payload JSON via Python (lida corretamente com qualquer caractere)
python3 -c "
import json
with open('/tmp/gemini_prompt.txt', 'r') as f:
    prompt = f.read()
payload = {
    'contents': [{'parts': [{'text': prompt}]}],
    'generationConfig': {'temperature': 0.2, 'maxOutputTokens': 8192}
}
print(json.dumps(payload))
" > /tmp/gemini_payload.json

# 3. Chamar a API com @file (sem risco de quebra por caracteres especiais)
RESPONSE=$(curl -s \
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/gemini_payload.json)

# 4. Extrair texto
echo "$RESPONSE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'candidates' in d:
    print(d['candidates'][0]['content']['parts'][0]['text'])
else:
    print('ERRO API:', json.dumps(d, indent=2))
"
```

---

## Parâmetros recomendados por fase

| Fase | temperature | maxOutputTokens | Razão |
|------|-------------|-----------------|-------|
| Fase 1 — Discovery | 0.1 | 4096 | Scoring analítico, pouca variação |
| Fase 2 — Arquitetura | 0.2 | 6144 | Decisões estruturais, alguma criatividade |
| Fase 3.5 — Design | 0.0 | 2048 | Checklist binário, zero variação |

---

## Padrão completo reutilizável

```bash
# Função auxiliar — usar em todos os agentes Gemini
call_gemini() {
  local PROMPT_FILE="$1"
  local TEMPERATURE="${2:-0.2}"
  local MAX_TOKENS="${3:-8192}"

  python3 -c "
import json
with open('$PROMPT_FILE', 'r') as f:
    prompt = f.read()
payload = {
    'contents': [{'parts': [{'text': prompt}]}],
    'generationConfig': {'temperature': $TEMPERATURE, 'maxOutputTokens': $MAX_TOKENS}
}
print(json.dumps(payload))
" > /tmp/gemini_payload.json

  local RESPONSE
  RESPONSE=$(curl -s \
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=$GOOGLE_API_KEY" \
    -H "Content-Type: application/json" \
    -d @/tmp/gemini_payload.json)

  echo "$RESPONSE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'candidates' in d:
    print(d['candidates'][0]['content']['parts'][0]['text'])
else:
    print('ERRO API:', json.dumps(d, indent=2))
    sys.exit(1)
"
}

# Uso: call_gemini /tmp/gemini_prompt.txt 0.1 4096
```

---

## Limites e observações

- **Rate limit free tier:** 15 req/min, 1.500 req/dia
- **Rate limit pago:** 1.000 req/min
- **Contexto máximo:** 1M tokens (Gemini 2.0 Flash)
- **Latência média:** 2-5 segundos por chamada
- **Custo:** ~$0,10/1M tokens input, ~$0,40/1M tokens output
