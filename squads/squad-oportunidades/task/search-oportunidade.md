---
task: procurar oportunidades de pagina pilar para monetização
responsavel: "@estrategista-buscas.md"
skills:
  - skill/google-search.md
Entrada:
- header: você pode ver nossos nicho em `src/data/estrutura.ts`
Saida: |
  - oportunidades: Retorne as 3 melhores oportunidades (keywords) com score detalhado
  - Top 3 SERP: para cada oportunidade, retorne os 3 primeiros resultados orgânicos com URL e fraqueza identificada
  - Canibalização: confirmar que nenhuma URL já existe no negociocerto.org
Checklist:
  - "[ ] Não temos esse conteúdo em nosso site (verificado via google-search.md com site:negociocerto.org)"
  - "[ ] Tem como monetizar dentro do artigo"
  - "[ ] Não é sobre cartão de crédito"
  - "[ ] conteúdo é transacional, comercial ou comparativo"
  - "[ ] Top 3 SERP coletado via Google Custom Search API"
---

# Search Oportunidades

Você procura oportunidades para monetizar seguindo estritamente o que está escrito no seu arquivo `@estrategista-buscas.md`.

## Ferramenta de busca

**Ferramenta obrigatória: `skill/google-search.md` via ValueSERP API.**

Execute todas as consultas à SERP usando o Bash tool com os comandos definidos em `skill/google-search.md`. A chave está em `.env` como `VALUESERP_API_KEY`.

**Proibido:**
- Usar playwright, EXA, ou qualquer outra ferramenta de busca
- Usar browsing manual para abrir resultados do Google
- Inventar ou inferir resultados de SERP sem chamada real à API

### Fluxo obrigatório por keyword candidata

1. **Busca principal** — executar a query exata via ValueSERP e coletar Top 10 + PAA + Related Searches
2. **Verificar canibalização** — executar `site:negociocerto.org` para confirmar que não temos a página
3. **Variações semânticas** — executar 2-3 variações de prefixo (melhor X para MEI, X sem mensalidade, comparativo X) para avaliar intenção real
4. **Análise** — com os dados retornados, aplicar o score de 5 dimensões do `@estrategista-buscas.md`

### O que a API cobre

| Dado | Disponível |
|------|-----------|
| Top 10 orgânico | ✅ |
| PAA (People Also Ask) | ✅ |
| Related searches | ✅ |
| Autocomplete | ❌ (registrar como "não verificado")
