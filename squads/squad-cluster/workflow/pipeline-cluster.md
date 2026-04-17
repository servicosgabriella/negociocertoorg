---
name: pipeline-cluster
description: Pipeline automático diário de publicação de posts de cluster
squad: squad-cluster
executor: cluster-daily-architect.js (VPS via cron)
---

# Pipeline Cluster — Publicação Automática Diária

## Visão Geral

Pipeline headless executado na VPS via Node.js. Não usa sessão interativa do Claude Code.
Cada agente é chamado via `claude -p "[prompt]"` com o contexto completo do agente `.md` injetado.

---

## Sequência de Execução

```
[VPS: cron → node cluster-daily-architect.js]
        │
        ▼
FASE 1 — SELEÇÃO
  └─ Parse cluster-master.md
  └─ Filtra artigos já processados (state.json)
  └─ Seleciona próximo artigo da fila
        │
        ▼
FASE 2 — ARQUITETURA (@arquiteto-cluster)
  └─ Extrai keywords do título
  └─ Busca SERP via ValueSERP API (top 3)
  └─ Injeta @arquiteto-cluster.md + skill qualificador-h2.md
  └─ claude -p "[agente + skill + SERP + dados do artigo]"
  └─ Output: JSON { h2s[], linkH2Index, linkReason, transitionSuggestion, needsDesignReview }
        │
        ▼
FASE 3 — REDAÇÃO (@copywriter-cluster)
  └─ Detecta nicho (maquininha / contabilidade / negociocerto)
  └─ Injeta @copywriter-cluster.md + copy-{niche}.md + todas as skills
  └─ Injeta modelo-html.md para tabelas
  └─ claude -p "[agente + skills + briefing do arquiteto + SERP]"
  └─ Output: HTML completo do artigo (sem preamble, sem H1)
        │
        ▼
FASE 4 — REVISÃO VISUAL (condicional — @revisor-design)
  └─ detectVisualElements(html)
  └─ SE needsDesignReview: injeta @revisor-design.md
  └─ claude -p "[agente + html + skill tabela-responsiva]"
  └─ Output: HTML revisado
        │
        ▼
FASE 5 — APROVAÇÃO HUMANA (Telegram)
  └─ Envia preview com H2s + link contextual
  └─ Botões: ✅ Aprovar / 👁️ Preview / ❌ Rejeitar
  └─ Aguarda callback via cluster-webhook-server.js
        │
        ▼
FASE 6 — PUBLICAÇÃO (se aprovado)
  └─ Gera imagem de capa: npm run gerar-imagem
  └─ BLOQUEIA se imagem não for gerada
  └─ Cria src/content/blog/{slug}.md com frontmatter
  └─ git commit + push
  └─ Remove artigo de cluster-master.md
  └─ Atualiza anchor-master.md
  └─ Notifica conclusão no Telegram
```

---

## Agentes e Skills Utilizados

### @arquiteto-cluster
- **Arquivo:** `agents/@arquiteto-cluster.md`
- **Skills injetadas:** `qualificador-h2.md`
- **Output:** JSON com briefing estruturado

### @copywriter-cluster
- **Arquivo:** `agents/@copywriter-cluster.md`
- **Skills injetadas:**
  - `copy-{niche}.md` — tom e vocabulário do nicho
  - `texto-ancora.md` — escolha do texto âncora do link interno
  - `tabela-responsiva.md` — padrão de tabelas responsivas
  - `otimizador-h1.md` — validação do título
  - `construtor-slug.md` — validação do slug
- **Dados injetados:** `data/modelo-html.md` — modelos visuais de tabela
- **Output:** HTML limpo (sem H1, sem preamble)

### @revisor-design *(condicional)*
- **Arquivo:** `agents/@revisor-design.md`
- **Skills injetadas:** `tabela-responsiva.md`
- **Ativado quando:** artigo contém tabelas, grids ou elementos visuais complexos

---

## Regras de Qualidade (gates automáticos)

| Gate | Condição | Ação se falhar |
|------|----------|----------------|
| Artigo na fila | `cluster-master.md` não vazio | Notifica Telegram, encerra |
| SERP | ValueSERP retorna resultados | Arquiteto usa estrutura base |
| H2s | Mínimo 5 H2s no briefing | Erro — rejeita o briefing |
| HTML | Comprimento > 700 chars | Warning no log |
| Imagem | `public/images/{slug}.png` existe | BLOQUEIA publicação |
| Slug | Não é vazio, não é `undefined` | BLOQUEIA publicação |

---

## Arquivos de Estado

| Arquivo | Propósito |
|---------|-----------|
| `file/cluster-master.md` | Fila de artigos a publicar |
| `file/anchor-master.md` | Histórico de âncoras (proporcionalidade SEO) |
| `.aiox/cluster-architect-state.json` | Artigos processados + aprovações pendentes |
| `.aiox-core/logs/cluster-architect.log` | Log de execução |

---

## Configuração da VPS

Variáveis de ambiente obrigatórias em `.env`:
```
CLUSTER_TELEGRAM_TOKEN   — Bot API token
TELEGRAM_CHAT_ID         — Chat destino
GITHUB_TOKEN             — Autenticação git push
GITHUB_USER              — Usuário GitHub
VALUESERP_API_KEY        — Busca SERP
```

Serviços que devem estar rodando:
- `cluster-webhook-server.js` — polling Telegram para callbacks de aprovação
- `claude` CLI — disponível no PATH (`which claude`)

---

## Adicionar Artigo à Fila

Edite `file/cluster-master.md` seguindo o formato:

```markdown
## Money Page: [H1 da pillar]
URL da pillar: /[slug-da-pillar]/

### Posts de Suporte

#### [Título do post informacional]
URL: /[slug-do-post]/
Linka para: /[slug-da-pillar]/
```

O pipeline processa um artigo por execução, na ordem em que aparecem no arquivo.
