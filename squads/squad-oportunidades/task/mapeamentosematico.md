# Mapeamento Semântico por Análise de Concorrentes

agents: "@arquiteto-pilarpage.md"


Entrada:
  - URLs: que o @estrategista-busca.md encontrou e foi aprovado pelo dono do projeto (ok no telegram)
Saida: |
  - H1: todos os h1
  - Todos os H2 dos artigos analisados  
  - URL: de todos os artigos analisados
  - Ancor text dos links internos 
  - tabela com variações semanticas:-
  - Quantidade que a palavra chave principal aparece em cada artigo, tanto da principal quanto das variações semanticas
| Variação | Concorrentes que cobrem | Profundidade máxima | Gap? | QTD
|----------|------------------------|---------------------|------| ---
|   |                   |                  |  |
|   |                   |                  |  | 
|   |                   |                  |  |

---

### Processo obrigatório

**Passo 1 — Coleta**
Para cada URL concorrente, extrair:
- H1 exato
- Todos os H2s e H3s
- Termos em negrito no corpo
- Anchor texts dos links internos
- Palavras do título e meta description 

**Passo 2 — Mapeamento**
Agrupar todos os termos encontrados em categorias:
- Sinônimos diretos do tema
- Siglas e abreviações (exemplo: o artigo é sobre vale refeição, podendo ser:VR, VA, VT)
- Marcas usadas como genérico (Ticket, Alelo, Sodexo)
- Variações por intenção (aceita / não aceita / como habilitar)
- Variações regionais ou coloquiais

**Passo 3 — Análise de cobertura**
Para cada variação encontrada, registrar:
- Quantos concorrentes cobrem esse termo
- Em qual profundidade (H1, H2, só no corpo)
- Se aparece em URL ou não

**Passo 4 — Identificação de gaps**
Variações que aparecem em menos de 2 concorrentes = oportunidade de cobertura.
Variações que nenhum cobre no H1/H2 = oportunidade de destaque semântico.

### Output esperado
Tabela com:
| Variação | Concorrentes que cobrem | Profundidade máxima | Gap? |
|----------|------------------------|---------------------|------|
| voucher  | 5/5                    | H1                  | não  |
| VR       | 3/5                    | H2                  | parcial |
| Alelo    | 1/5                    | corpo               | sim  |