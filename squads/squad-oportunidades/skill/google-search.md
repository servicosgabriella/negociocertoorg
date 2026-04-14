# Google Search Skill (via ValueSERP)

Esta skill executa buscas reais na SERP brasileira via **ValueSERP API**,
retornando dados estruturados completos — orgânico, PAA, autocomplete e related searches.

## Configuração necessária

Adicione no `.env`:
```
VALUESERP_API_KEY=sua_chave_aqui
```

Obtenha sua chave em: https://www.valueserp.com/

## Quando usar

- Coletar o Top 10 orgânico de qualquer keyword
- Verificar quais concorrentes estão ranqueando
- Coletar People Also Ask (PAA) reais do Google
- Coletar Related Searches do rodapé da SERP
- Validar se o negociocerto.org já aparece na SERP
- Executar variações sistemáticas de busca (Passo 1 da metodologia)

---

## Busca principal — Top 10 orgânico + PAA + Related searches

Substitua `QUERY` pela keyword desejada:

```bash
source .env && curl -s "https://api.valueserp.com/search?api_key=${VALUESERP_API_KEY}&q=QUERY&location=Brazil&gl=br&hl=pt-br&num=10" | python3 -c "
import json, sys

data = json.load(sys.stdin)

# Orgânico
print('=== TOP 10 ORGÂNICO ===')
for i, r in enumerate(data.get('organic_results', []), 1):
    print(f'{i}. {r[\"title\"]}')
    print(f'   URL: {r[\"link\"]}')
    print(f'   Snippet: {r.get(\"snippet\", \"\").replace(chr(10), \" \")}')
    print()

# PAA
paa = data.get('people_also_ask', [])
if paa:
    print('=== PEOPLE ALSO ASK ===')
    for q in paa:
        print(f'  - {q.get(\"question\", \"\")}')
    print()

# Related searches
related = data.get('related_searches', [])
if related:
    print('=== RELATED SEARCHES ===')
    for r in related:
        print(f'  - {r.get(\"query\", \"\")}')
"
```

---

## Verificar se o negociocerto.org já tem a página

```bash
source .env && curl -s "https://api.valueserp.com/search?api_key=${VALUESERP_API_KEY}&q=QUERY+site:negociocerto.org&gl=br&hl=pt-br&num=5" | python3 -c "
import json, sys
data = json.load(sys.stdin)
items = data.get('organic_results', [])
if items:
    print('JÁ EXISTE no negociocerto.org:')
    for r in items:
        print(f'  - {r[\"link\"]}')
else:
    print('NÃO encontrado no negociocerto.org — oportunidade válida')
"
```

---

## Variações de query para expansão semântica (Passo 1)

```bash
# Variação 1 — intenção comparativa (MEI, autônomo, segmentos)
source .env && curl -s "https://api.valueserp.com/search?api_key=${VALUESERP_API_KEY}&q=melhor+TEMA+para+MEI&gl=br&hl=pt-br&num=10" | python3 -c "import json,sys; [print(f'{i+1}. {r[\"link\"]} | {r[\"title\"]}') for i,r in enumerate(json.load(sys.stdin).get('organic_results',[]))]"

# Variação 2 — intenção transacional (sem mensalidade/taxa)
source .env && curl -s "https://api.valueserp.com/search?api_key=${VALUESERP_API_KEY}&q=TEMA+sem+mensalidade&gl=br&hl=pt-br&num=10" | python3 -c "import json,sys; [print(f'{i+1}. {r[\"link\"]} | {r[\"title\"]}') for i,r in enumerate(json.load(sys.stdin).get('organic_results',[]))]"

# Variação 3 — comparativo direto
source .env && curl -s "https://api.valueserp.com/search?api_key=${VALUESERP_API_KEY}&q=comparativo+TEMA&gl=br&hl=pt-br&num=10" | python3 -c "import json,sys; [print(f'{i+1}. {r[\"link\"]} | {r[\"title\"]}') for i,r in enumerate(json.load(sys.stdin).get('organic_results',[]))]"
```

---

## Parâmetros fixos

| Parâmetro | Valor | Motivo |
|-----------|-------|--------|
| `gl` | `br` | Geolocalização Brasil |
| `hl` | `pt-br` | Interface em português |
| `location` | `Brazil` | Resultados localizados |
| `num` | `10` | Máximo de resultados por chamada |

---

## O que a API retorna

| Dado | Retornado? | Campo JSON |
|------|-----------|------------|
| Top 10 orgânico | ✅ | `organic_results` |
| Title + URL + Snippet | ✅ | Por item orgânico |
| People Also Ask (PAA) | ✅ | `people_also_ask` |
| Related searches | ✅ | `related_searches` |
| Posição aproximada | ✅ | `position` por item |
| Autocomplete suggestions | ❌ | Não disponível via REST |

---

## Cota e custos

- Plano gratuito: 100 buscas/mês
- Plano pago: a partir de $50/mês para 5.000 buscas
- Priorizar queries de alta relevância — não usar para variações de baixo potencial
- Agrupar verificações de canibalização em uma única query `site:negociocerto.org`
