# squad-conteudo

Squad de produção de conteúdo SEO para MEIs, empreendedores e microempreendedores brasileiros.

Baseado no guia operacional `estilodeconteudo.md`.

## Agentes

| Agente | Heurísticas | Função |
|--------|-------------|--------|
| `@head-de-conteudo` | Regra #5 (Intenção de Busca) | Orquestra o pipeline, classifica intenção antes de delegar |
| `@pesquisador-seo` | Regra #1 (H2s do PAA) | Extrai H2s de fontes reais do Google, nunca inventa |
| `@copywriter-seo` | Regras #2, #4, #6 (Tom, Estrutura, Ritmo) | Redige o artigo seguindo as fórmulas de introdução |
| `@qa-conteudo` | Regras #3, #11 (Lista Negra, Checklist) | Audita e veta artigos que não cumpram as regras |

## Como Usar

### Pipeline completo (recomendado)

```
@head-de-conteudo
*nova-pauta "melhores maquininhas para MEI"
```

### Agentes individuais

```
@pesquisador-seo
*pesquisar-pauta "como abrir MEI" --intencao informacional

@copywriter-seo
*redigir-artigo --briefing briefing.md

@qa-conteudo
*auditar artigo-draft.md
```

## Pipeline

```
keyword → @head-de-conteudo (classifica intenção)
        → @pesquisador-seo (extrai H2s do PAA)
        → @head-de-conteudo (valida + cria briefing)
        → @copywriter-seo (redige artigo)
        → @qa-conteudo (audita 14 pontos)
        → APROVADO → publicação
```

## Regras por Agente

### @pesquisador-seo — Regra #1
- H2s SOMENTE de fontes reais: PAA, buscas relacionadas, autocomplete, top 3 orgânicos
- H2s genéricos são VETADOS: "O que é", "Benefícios de", "Como funciona", etc.
- Regra de ouro: "Essa pergunta aparece no Google?"

### @copywriter-seo — Regras #2, #4, #5, #6
- Tom 80/20 (técnico/conversacional), "você" sempre
- 3 fórmulas de introdução: Ponte, CPP, Pergunta+Dor+Promessa
- **PROIBIDO travessão (—) no meio de frases** → use parênteses, vírgulas ou ponto
- Ritmo variado: bloco → impacto → bloco (sem efeito escada)

### @qa-conteudo — Regras #3, #11
- Zero tolerância: qualquer item da Lista Negra = VETO imediato
- 14 pontos de auditoria obrigatórios
- Conectivos proibidos: "Vale ressaltar", "Cabe destacar", "Além disso" (parágrafo), etc.

### @head-de-conteudo — Regra #5 + Layouts Astro
- OBRIGATÓRIO classificar intenção ANTES de qualquer delegação
- 4 tipos: Informacional, Navegacional, Comercial, Transacional
- O formato do artigo serve à intenção, não o contrário
- **Define o layout Astro obrigatório junto com a classificação:**

| Intenção | É review? | Layout |
|----------|-----------|--------|
| Informacional | — | `bloglayout.astro` |
| Navegacional | — | `bloglayout.astro` |
| Comercial | Sim | `reviewlayout.astro` |
| Comercial | Não | `contentlayout.astro` |
| Transacional | Sim | `reviewlayout.astro` |
| Transacional | Não | `contentlayout.astro` |
