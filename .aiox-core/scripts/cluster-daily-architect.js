#!/usr/bin/env node

/**
 * Cluster Daily Architect — Automação Completa
 *
 * Fluxo automático diário:
 * 1. Extrai artigo do cluster-master.md
 * 2. Busca SERP via ValueSERP API
 * 3. @arquiteto-cluster → H2s estruturados
 * 4. @copywriter-cluster → Redação completa
 * 5. Detecta tabelas → chama @revisor-design se necessário
 * 6. Skill texto-ancora → escolhe âncora (consulta anchor-master.md)
 * 7. Envia preview pro Telegram → aguarda sua aprovação
 * 8. Git push (via @devops)
 * 9. Atualiza anchor-master.md
 * 10. Remove artigo de cluster-master.md
 * 11. Notifica conclusão no Telegram
 */

const fs = require('fs');
const path = require('path');
const { exec, spawnSync } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CONFIG = {
  TELEGRAM_TOKEN: process.env.CLUSTER_TELEGRAM_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_USER: process.env.GITHUB_USER,
  VALUESERP_API_KEY: process.env.VALUESERP_API_KEY,
  PROJECT_ROOT: path.join(__dirname, '../../'),
  CLUSTER_MASTER: path.join(__dirname, '../../squads/squad-oportunidades/file/cluster-master.md'),
  ANCHOR_MASTER: path.join(__dirname, '../../squads/squad-oportunidades/file/anchor-master.md'),
  LOG_FILE: path.join(__dirname, '../../.aiox-core/logs/cluster-architect.log'),
  STATE_FILE: path.join(__dirname, '../../.aiox/cluster-architect-state.json'),
  LOCALHOST_PORT: process.env.LOCAL_DEV_PORT || 4321,
};

// Validar configuração
const requiredEnvs = ['TELEGRAM_TOKEN', 'TELEGRAM_CHAT_ID', 'GITHUB_TOKEN', 'GITHUB_USER', 'VALUESERP_API_KEY'];
for (const env of requiredEnvs) {
  if (!CONFIG[env]) {
    console.error(`❌ Erro: Configure ${env} como variável de ambiente`);
    process.exit(1);
  }
}

// ============================================================================
// SKILLS & LAYOUTS
// ============================================================================

/**
 * Carrega uma skill do disco
 */
function loadSkill(skillName) {
  try {
    const skillPath = path.join(CONFIG.PROJECT_ROOT, `squads/squad-oportunidades/skill/${skillName}.md`);
    if (fs.existsSync(skillPath)) {
      return fs.readFileSync(skillPath, 'utf-8');
    }
    log(`⚠️ Skill não encontrada: ${skillName}`, 'warn');
    return null;
  } catch (e) {
    log(`⚠️ Erro ao carregar skill ${skillName}: ${e.message}`, 'warn');
    return null;
  }
}

/**
 * Detecta o nicho do artigo baseado na keyword/título
 */
function detectNiche(title) {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('maquinh') || titleLower.includes('cartão') || titleLower.includes('débito') || titleLower.includes('voucher') || titleLower.includes('vale')) {
    return 'maquininha';
  } else if (titleLower.includes('contabil') || titleLower.includes('imposto') || titleLower.includes('nf-e') || titleLower.includes('fiscal')) {
    return 'contabilidade';
  } else {
    return 'negociocerto';
  }
}

/**
 * Determina o layout Astro baseado na intenção de busca e tipo de review
 * Segue a matriz de decisão do squad-conteudo: orquestrar-pauta.md
 */
function determineLayout(title, isReview = false) {
  // Posts de cluster são sempre Informativos
  // Intenção: Informacional → Layout: bloglayout
  // (MAS verificar se é review para futuro suporte a reviewlayout)

  const reviewKeywords = ['melhor', 'melhores', 'top ', 'comparativo', 'vs', 'qual escolher', 'versus', 'benchmark'];
  const titleLower = title.toLowerCase();

  const hasReviewKeyword = reviewKeywords.some(kw => titleLower.includes(kw));

  // Posts de cluster são SEMPRE informativos por natureza
  // Se tiverem review keyword, poderiam ser reviewlayout no futuro
  // Por enquanto: sempre bloglayout
  if (hasReviewKeyword) {
    log(`   Keyword contém 'review': ${reviewKeywords.find(kw => titleLower.includes(kw))}`, 'info');
    // TODO: Se cluster tiver tabelas de comparação, considerar reviewlayout
    return 'bloglayout'; // Por enquanto mantém como blog
  }

  return 'bloglayout'; // Posts informativos de cluster → blog
}

/**
 * Gera frontmatter YAML para arquivo .md (bloglayout)
 */
function generateFrontmatter(data) {
  const {
    title = 'Untitled',
    slug = 'untitled',
    description = title,
    keyword = 'keyword',
    layout = 'bloglayout'
  } = data;

  const today = new Date().toISOString().split('T')[0];
  const coverImage = `/images/${slug}.png`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: title, href: `/blog/${slug}` }
  ];

  // Construir YAML formatado
  const yaml = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
keyword: "${keyword.replace(/"/g, '\\"')}"
layout: "${layout}"
pubDate: ${today}
updatedDate: ${today}
authorName: "Gabriella Fernandes"
authorRole: "Especialista em Negócios"
authorImage: "/images/perfil.jpg"
coverImage: "${coverImage}"
authorHref: "/autor/gabriella-fernandes"
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Blog"
    href: "/blog"
  - label: "${title.replace(/"/g, '\\"')}"
    href: "/blog/${slug}"
intencao: "Informacional"
---

`;

  return yaml;
}

const LAYOUTS = {
  'tabela-comparacao': 'Modelo 1 — Tabela de Comparação com gradiente azul e linhas alternadas',
  'tabela-destacada': 'Modelo 2 — Tabela com coluna em destaque (recomendado)',
  'tabela-features': 'Modelo 3 — Tabela de features com ✓/✗',
  'tabela-dados': 'Modelo 4 — Tabela de dados simples (taxas, prazos)',
  'caixa-destaque': 'Caixa com fundo #eff6ff e ícone + texto',
  'grid-cards': 'Grid de cards para listar opções lado a lado',
  'faq-accordeon': 'FAQ em formato de acordeão (<details>)',
};

// ============================================================================
// UTILS
// ============================================================================

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  console.log(logMessage);

  try {
    const dir = path.dirname(CONFIG.LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
  } catch (e) {
    console.error('Erro ao salvar log:', e.message);
  }
}

function loadState() {
  try {
    if (fs.existsSync(CONFIG.STATE_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf-8'));
    }
  } catch (e) {
    log(`Erro ao carregar state file: ${e.message}`, 'warn');
  }
  return {
    processedArticles: [],
    pendingApprovals: {},
    lastRun: null,
  };
}

function saveState(state) {
  try {
    const dir = path.dirname(CONFIG.STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    log(`Erro ao salvar state file: ${e.message}`, 'error');
  }
}

async function sendTelegram(message, parseMode = 'HTML') {
  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_TOKEN}/sendMessage`;

  const payload = {
    chat_id: CONFIG.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: parseMode,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Status ${response.status}: ${text}`);
    }

    log(`📤 Mensagem Telegram enviada`, 'success');
    return true;
  } catch (e) {
    log(`❌ Erro ao enviar Telegram: ${e.message}`, 'error');
    return false;
  }
}

async function sendTelegramWithButtons(message, articleKey, buttons = []) {
  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_TOKEN}/sendMessage`;

  const defaultButtons = [
    [
      { text: '✅ Aprovar e Publicar', callback_data: `approve_${articleKey}` },
      { text: '👁️ Ver Preview', callback_data: `preview_${articleKey}` },
    ],
    [{ text: '❌ Rejeitar', callback_data: `reject_${articleKey}` }],
  ];

  const payload = {
    chat_id: CONFIG.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: buttons.length > 0 ? buttons : defaultButtons,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    log(`📤 Mensagem com botões enviada`, 'success');
    return true;
  } catch (e) {
    log(`❌ Erro ao enviar com botões: ${e.message}`, 'error');
    return false;
  }
}

// ============================================================================
// PARSING DO CLUSTER-MASTER
// ============================================================================

function parseClusterMaster() {
  try {
    const content = fs.readFileSync(CONFIG.CLUSTER_MASTER, 'utf-8');
    const articles = [];

    const postRegex = /^#### (.+?)\nURL: (.+?)\nLinka para: (.+?)$/gm;
    const moneyPageRegex = /^## Money Page: (.+?)\nURL da pillar: (.+?)$/gm;

    let currentMoneyPage = null;
    let currentPillarUrl = null;

    let match;
    while ((match = moneyPageRegex.exec(content)) !== null) {
      currentMoneyPage = match[1];
      currentPillarUrl = match[2];
    }

    postRegex.lastIndex = 0;
    while ((match = postRegex.exec(content)) !== null) {
      const [, title, url, linksTo] = match;
      articles.push({
        title: title.trim(),
        url: url.trim(),
        linksTo: linksTo.split('+').map(l => l.trim()),
        moneyPage: currentMoneyPage,
        pillarUrl: currentPillarUrl,
      });
    }

    return articles;
  } catch (e) {
    log(`❌ Erro ao parsear cluster-master.md: ${e.message}`, 'error');
    return [];
  }
}

// ============================================================================
// KEYWORD EXTRACTION
// ============================================================================

function extractKeywords(title) {
  const stopwords = new Set([
    'quais', 'são', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'em', 'e', 'o', 'a',
    'para', 'com', 'por', 'por', 'que', 'qual', 'quando', 'onde', 'como', 'é', 'foi',
    'está', 'está', 'existem', 'existe', 'tem', 'têm', 'há', 'pode', 'podem', 'devo',
    'devem', 'posso', 'posso', 'deve', 'devem', 'este', 'esse', 'aquele', 'outro',
    'mais', 'menos', 'todo', 'todos', 'muito', 'vários', 'ao', 'aos', 'à', 'às',
    'ele', 'ela', 'eles', 'elas', 'nós', 'vós', 'seu', 'sua', 'seus', 'suas',
    'nosso', 'nossa', 'nossos', 'nossas', 'vosso', 'vossa', 'vossos', 'vossas',
    'existentes', 'existente', 'negócio', 'precisa', 'aceitar', 'fazer', 'ter', 'usar',
    'no', 'na', 'nos', 'nas',
  ]);

  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));

  return words.slice(0, 5).join(' ');
}

// ============================================================================
// VALUESERP API
// ============================================================================

async function searchSERP(keyword) {
  log(`🔍 Buscando SERP para: "${keyword}"`, 'info');

  try {
    const params = new URLSearchParams({
      q: keyword,
      api_key: CONFIG.VALUESERP_API_KEY,
      country: 'br',
      language: 'pt',
      page: 1,
    });

    const url = `https://api.valueserp.com/search?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const data = await response.json();

    if (!data.organic_results || data.organic_results.length === 0) {
      log(`⚠️ Nenhum resultado SERP encontrado para: ${keyword}`, 'warn');
      return [];
    }

    const top3 = data.organic_results.slice(0, 3).map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.snippet,
    }));

    log(`✅ ${top3.length} resultados obtidos do ValueSERP`, 'success');
    return top3;
  } catch (e) {
    log(`❌ Erro na busca SERP: ${e.message}`, 'error');
    return [];
  }
}

// ============================================================================
// CLAUDE CLI — HELPER
// ============================================================================

function callClaude(prompt) {
  const result = spawnSync('claude', ['-p', prompt], {
    encoding: 'utf-8',
    maxBuffer: 20 * 1024 * 1024,
    timeout: 180000,
  });

  if (result.error) throw new Error(`Erro ao executar claude CLI: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`claude CLI falhou (exit ${result.status}): ${result.stderr}`);

  return result.stdout.trim();
}

// ============================================================================
// CLAUDE CLI CALLS — AGENTES DE CLUSTERING
// ============================================================================

/**
 * Chama @arquiteto-cluster para gerar estrutura de H2s
 * @arquiteto-cluster busca SERP direto via ValueSERP API e analisa
 * Retorna: { h2s: [...], linkH2Index: number, linkReason: string, transitionSuggestion: string }
 */
async function callArquitetoCluster(articleData) {

  // 1. ARQUITETO BUSCA SERP DIRETO
  log(`🔍 @arquiteto-cluster buscando SERP para: "${articleData.title}"`, 'info');
  const keywords = extractKeywords(articleData.title);
  log(`   Keywords extraídas: "${keywords}"`, 'info');
  const serpResults = await searchSERP(keywords);

  if (serpResults.length === 0) {
    log(`⚠️ Nenhum resultado SERP. @arquiteto-cluster trabalhará com estrutura base.`, 'warn');
  }

  // 2. CARREGAR SKILL qualificador-h2
  const skillQualificadorH2 = loadSkill('qualificador-h2');

  // 3. ARQUITETO ANALISA SERP
  const serpContext = serpResults.length > 0
    ? serpResults.map((r, i) => `
RESULTADO ${i + 1}:
Título: ${r.title}
URL: ${r.url}
Snippet: ${r.snippet}
`).join('\n---\n')
    : 'Nenhum resultado SERP retornou. Gere H2s baseado na keyword.';

  const layoutsDesc = Object.entries(LAYOUTS).map(([k, v]) => `- **${k}**: ${v}`).join('\n');

  const prompt = `Você é o Arquiteto Cluster — especialista em arquitetura ágil de posts de cluster com foco em linkagem estratégica.

MISSÃO:
Analisar a SERP abaixo para a keyword, extrair H2s dos competitors, qualificar e entregar estrutura pronta.

ARTIGO A ARQUITETAR:
- Título/Keyword: ${articleData.title}
- Pillar page: ${articleData.pillarUrl}
- Links para: ${articleData.linksTo.join(', ')}

RESULTADOS SERP (TOP 3):
${serpContext}

SKILL QUALIFICADOR-H2 (use obrigatoriamente):
${skillQualificadorH2 ? skillQualificadorH2.substring(0, 2000) : 'Filtro 1: Gera 2-3 parágrafos úteis? | Filtro 2: Intenção distinta? | Filtro 3: Estágio do usuário?'}

ANÁLISE OBRIGATÓRIA:
1. Examine cada resultado e extraia todos os H2s/H3s vistos
2. Para cada candidato, aplique os 3 filtros da skill qualificador-h2:
   - Gera 2-3 parágrafos de conteúdo útil?
   - Tem intenção distinta da keyword?
   - Pertence ao estágio do usuário deste cluster?
3. Aprove MÍNIMO 5 H2s que passaram nos 3 filtros
4. Ordene por relevância (mais central para a keyword = acima)
5. Identifique qual H2 é o gancho natural para lincar a pillar
6. **AVALIAR ELEMENTOS VISUAIS**: O artigo vai precisar de:
   - Tabelas? (comparação, dados, features)
   - Grid de cards ou caixas?
   - FAQ em acordeão?
   Se sim, indique qual layout(s) no JSON.

LAYOUTS DISPONÍVEIS:
${layoutsDesc}

RESPONDA EM JSON (apenas o JSON, sem explicações):

{
  "h2s": [
    "H2 1: [título exato em cauda longa]",
    "H2 2: [título exato em cauda longa]",
    "H2 3: [ESTE é para lincar a pillar]",
    "H2 4: [título exato em cauda longa]",
    "H2 5: [título exato em cauda longa]"
  ],
  "linkH2Index": 2,
  "linkReason": "Este H2 naturalmente amplia o escopo para [razão específica]",
  "transitionSuggestion": "Se você quer [contexto específico], veja [pillar name]",
  "needsDesignReview": false,
  "suggestedLayouts": ["tabela-comparacao"],
  "designNotes": "Descreva quais elementos visuais o copywriter deve incluir"
}

REGRAS ABSOLUTAS:
- Nunca menos de 5 H2s
- H2s SEMPRE vêm dos resultados SERP (nunca inventados)
- Link em H2 que amplia escopo (do específico para geral)
- needsDesignReview: true se tem tabelas, grids ou elementos complexos
- JSON válido, sem markdown, sem explicações extras`;

  try {
    log(`🏗️ @arquiteto-cluster analisando SERP e gerando H2s...`, 'info');

    const text = callClaude(prompt);

    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log(`⚠️ @arquiteto-cluster retornou resposta inválida`, 'warn');
      log(`Resposta: ${text.substring(0, 200)}...`, 'warn');
      throw new Error('Invalid JSON from arquitecto-cluster');
    }

    const result = JSON.parse(jsonMatch[0]);

    log(`✅ @arquiteto-cluster gerou ${result.h2s.length} H2s`, 'success');
    log(`📍 Link será no H2 ${result.linkH2Index + 1}: "${result.h2s[result.linkH2Index]}"`, 'info');
    log(`   Razão: ${result.linkReason}`, 'info');

    if (result.needsDesignReview) {
      log(`🎨 Design review necessário para: ${result.suggestedLayouts.join(', ')}`, 'info');
      log(`   Notas: ${result.designNotes}`, 'info');
    }

    // Adicionar dados SERP ao retorno para o copywriter ter contexto completo
    result.serpResults = serpResults;

    return result;
  } catch (e) {
    log(`❌ Erro ao chamar @arquiteto-cluster: ${e.message}`, 'error');
    throw e;
  }
}

/**
 * Chama @copywriter-cluster para gerar o artigo completo
 * Retorna: HTML string do artigo
 */
async function callCopywriterCluster(articleData, briefing) {

  // DETECTAR NICHO E CARREGAR SKILLS ESPECÍFICAS
  const niche = detectNiche(articleData.title);
  log(`   Nicho detectado: ${niche}`, 'info');

  // CARREGAR SKILLS EXISTENTES
  const skillQualificadorH2 = loadSkill('qualificador-h2');
  const skillConstrutorSlug = loadSkill('construtor-slug');
  const skillOtimizadorH1 = loadSkill('otimizador-h1');
  const skillTextoAncora = loadSkill('texto-ancora');
  const skillCopyNiche = loadSkill(`copy-${niche}`);  // copy-maquininha, copy-contabilidade, copy-negociocerto

  const h2sFormatted = briefing.h2s
    .map((h, i) => `${i + 1}. ${h}`)
    .join('\n');

  const layoutsDesc = Object.entries(LAYOUTS).map(([k, v]) => `- **${k}**: ${v}`).join('\n');
  const designNotes = briefing.designNotes ? `\nNOTAS DE DESIGN DO ARQUITETO:\n${briefing.designNotes}` : '';

  const prompt = `Você é o Copywriter Cluster — especialista em redação de posts informativos de suporte para pillar pages.

===================================================================================
REGRA ABSOLUTA: SIGA A SKILL copy-${niche} — TODAS AS DECISÕES DE TOM, VOCABULÁRIO E ESTILO VÊM DAQUI
===================================================================================

${skillCopyNiche || '⚠️ SKILL NÃO CARREGADA - use padrão negociocerto'}

---

OBJETIVO:
Redação completa de artigo de 700+ palavras aplicando EXATAMENTE a skill copy-${niche} acima.

BRIEF DO ARTIGO:
- Tema/Keyword: ${articleData.title}
- Pillar page para linkar: ${articleData.pillarUrl}
- Nicho: ${niche}
- Tom/Vocabulário/Estilo: CONFORME skill copy-${niche} ACIMA (não invente variações)

===================================================================================
📊 CONTEXTO COMPETITIVO (DO @ARQUITETO-CLUSTER)
===================================================================================

${briefing.serpResults && briefing.serpResults.length > 0 ? briefing.serpResults.map((r, i) => `
COMPETIDOR ${i + 1}:
Título: ${r.title}
URL: ${r.url}
Snippet: ${r.snippet}
`).join('\n---\n') : 'Sem dados SERP disponíveis'}

⚠️ INSIGHTS:
- Use dados concretos dos competitors (taxas, prazos, números) mencionados nos snippets
- Não copie estrutura dos competitors, mas capture a intenção real do usuário
- Complemente com informações que faltam nos competitors
- Mantenha tom diferenciado conforme skill copy-${niche}

===================================================================================
⚠️ ESCOPO ESPECÍFICO DESTE ARTIGO - LEIA COM ATENÇÃO
===================================================================================

INTENÇÃO REAL DO USUÁRIO:
${articleData.title}

RESPONDA APENAS A:
- Como configurar a maquininha para ACEITAR vale-refeição como PAGAMENTO
- Quais bandeiras habilitar
- Quais taxas cobra
- Como ativar no equipamento
- O que é vale-refeição vs vale-alimentação (no contexto de pagamento)

❌ NÃO FALE SOBRE (mesmos que a keyword sugira):
- MEI oferecendo vale-refeição para funcionários (não é o assunto)
- Benefício corporativo para empregado (fora do escopo)
- Como funcionário solicita o benefício (irrelevante)
- Legislação trabalhista sobre benefícios (não é técnico de maquininha)

⚠️ FILTRO DE QUALIDADE:
Se uma frase não responde diretamente "como ativar na maquininha", DELETE.

---

---

## SKILLS COMPLEMENTARES (aplique também):

### SKILL OTIMIZADOR-H1 (para o título)
${skillOtimizadorH1 || '(Skill não carregada)'}

### SKILL CONSTRUTOR-SLUG (para a URL)
${skillConstrutorSlug || '(Skill não carregada)'}

### SKILL TEXTO-ÂNCORA (para o link interno)
${skillTextoAncora || '(Skill não carregada)'}

### SKILL QUALIFICADOR-H2 (para validar H2s)
${skillQualificadorH2 || '(Skill não carregada)'}

---

## ESTRUTURA DE H2s (já validada):

${h2sFormatted}

## LINK INTERNO (H2 ${briefing.linkH2Index + 1}):

H2: "${briefing.h2s[briefing.linkH2Index]}"
Contexto sugerido: ${briefing.transitionSuggestion}
URL: ${articleData.pillarUrl}

**INSTRUÇÃO CRÍTICA PARA O LINK:**
Use a skill TEXTO-ÂNCORA para escolher o melhor texto. O link deve:
- Soar ABSOLUTAMENTE NATURAL na frase
- Nunca parecer forçado ou inserido
- Seguir proporção 50% Target / 25% Brand / 25% Misc
- NÃO usar: "clique aqui", "leia também", "veja mais"
- SIM usar: contexto real que leva naturalmente ao link

Exemplo RUIM:
"...e essas são as opções principais. <a href='...'>Clique aqui para ver mais</a>"

Exemplo BOM:
"...e essas são as opções principais. Se você quer uma análise completa comparando todas as marcas com dados atualizados, <a href='...'>confira nosso guia de melhores maquininhas de cartão</a>."

${designNotes}

---

## INSTRUÇÕES GERAIS DE REDAÇÃO:

⚠️ **IMPORTANTE**: O título (H1) JÁ ESTÁ NO FRONTMATTER. Você NÃO deve incluir <h1> no conteúdo!

1. **COMECE DIRETO COM INTRODUÇÃO** (sem H1):
   - Pergunta específica que o usuário trouxe
   - Resposta imediata ou promessa de escopo
   - Conexão com o que vem a seguir
   - (3-5 parágrafos curtos)

2. **CADA H2** deve ter:
   - Frase de abertura conectada ao H2
   - Conteúdo com profundidade (2-3 parágrafos mínimo)
   - OBRIGATÓRIO: dado concreto (taxa, prazo, número, exemplo)
   - Transição suave para próximo H2

3. **REGRAS ABSOLUTAS**:
   - Parágrafos ultracurtos (máximo 2 linhas em desktop)
   - Voz ativa: "A Ton cobra taxa" (não "a taxa é cobrada")
   - Eliminar: "basicamente", "é importante destacar", "vale ressaltar"
   - Palavra-chave natural no primeiro parágrafo
   - Todo parágrafo faz trabalho — nenhum é redundante

4. **FORMATAÇÃO HTML** (HTML PURO, SEM BLOCOS DE CÓDIGO):
   <p>Parágrafo de introdução...</p>
   <p>Outro parágrafo...</p>
   <h2>H2 aqui</h2>
   <p>Parágrafo...</p>
   <strong>destaque crítico</strong>

5. **LINK INTERNO** (no H2 ${briefing.linkH2Index + 1}):
   - Texto âncora natural segundo skill texto-ancora
   - Deve parecer transição, não desvio
   - URL: \`<a href="${articleData.pillarUrl}">seu-texto-ancora-aqui</a>\`

6. **LAYOUTS** (se necessário incluir elementos visuais):
${layoutsDesc}

7. **MÍNIMO OBRIGATÓRIO**:
   - 700+ palavras
   - 5+ H2s (estrutura já entregue)
   - Cada H2 com dado concreto
   - Qualidade > volume sempre

RESPONDA APENAS COM O HTML COMPLETO DO ARTIGO:
- **NÃO INCLUA <h1>** (o título já está no frontmatter!)
- Comece direto com <p> de introdução
- Siga a estrutura exata de H2s entregue
- HTML limpo, sem markdown
- Sem explicações extras, apenas o código HTML`;

  try {
    log(`✍️ Chamando @copywriter-cluster para gerar artigo...`, 'info');

    let html = callClaude(prompt);

    // Limpar blocos de código markdown se Claude os adicionou por engano
    html = html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '');

    // VALIDAÇÃO: Se houver H1s, remover (o título vem do frontmatter)
    const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
    if (h1Matches.length > 0) {
      log(`⚠️ Artigo contém ${h1Matches.length} H1(s) — removendo (título vem do frontmatter)...`, 'warn');
      html = html.replace(/<h1[^>]*>.*?<\/h1>/gi, ''); // remover todos os H1s
      log(`✅ H1s removidos`, 'success');
    }

    if (!html || html.length < 700) {
      log(`⚠️ Artigo gerado muito curto (${html.length} chars)`, 'warn');
    }

    log(`✅ Artigo gerado: ${html.length} caracteres`, 'success');
    return html;
  } catch (e) {
    log(`❌ Erro ao chamar @copywriter-cluster: ${e.message}`, 'error');
    throw e;
  }
}

// ============================================================================
// DETECÇÃO DE ELEMENTOS VISUAIS
// ============================================================================

function detectVisualElements(artigo) {
  const hasTable = artigo.includes('<table') || artigo.includes('|---|');
  const hasContainerGrid = artigo.includes('contabilidade-container');
  const hasBox = artigo.includes('-box') || artigo.includes('box-');
  const hasFAQ = artigo.includes('<details') || artigo.includes('faq');

  return {
    hasTable,
    hasContainerGrid,
    hasBox,
    hasFAQ,
    hasAnyVisualElement: hasTable || hasContainerGrid || hasBox || hasFAQ,
  };
}

// ============================================================================
// ANCHOR MASTER
// ============================================================================

function loadAnchorMaster() {
  try {
    if (fs.existsSync(CONFIG.ANCHOR_MASTER)) {
      return fs.readFileSync(CONFIG.ANCHOR_MASTER, 'utf-8');
    }
  } catch (e) {
    log(`⚠️ Erro ao carregar anchor-master.md: ${e.message}`, 'warn');
  }
  return '';
}

function updateAnchorMaster(targetPage, anchorText, type, sourceSlug) {
  try {
    let content = loadAnchorMaster();

    // Procurar pela seção da página de destino
    const sectionRegex = new RegExp(`## ${targetPage.replace(/\//g, '\\/')}(.*?)(?=## |$)`, 's');

    if (!content.includes(`## ${targetPage}`)) {
      // Criar nova seção se não existir
      const newSection = `\n## ${targetPage}\nPalavra-chave alvo: [atualizar]\nTipo: interna\n\n### Saldo atual\nTarget: 1 links usados — 4 disponíveis até 50%\nBrand: 0 links usados — 2 disponíveis até 25%\nMisc: 0 links usados — 2 disponíveis até 25%\nTotal de links registrados: 1\n\n### Histórico de âncoras usadas\n| Post de origem | Âncora usada | Tipo | Data |\n|---|---|---|---|\n| ${sourceSlug} | ${anchorText} | ${type} | ${new Date().toLocaleDateString('pt-BR')} |\n`;
      content += newSection;
    } else {
      // Atualizar seção existente
      const match = sectionRegex.exec(content);
      if (match) {
        const section = match[1];
        // Adicionar nova linha na tabela do histórico
        const newEntry = `| ${sourceSlug} | ${anchorText} | ${type} | ${new Date().toLocaleDateString('pt-BR')} |`;
        const updatedSection = section.replace(/(\| \[data\] \|)/, `| ${new Date().toLocaleDateString('pt-BR')} |\n${newEntry}`);
        content = content.replace(section, updatedSection);
      }
    }

    fs.writeFileSync(CONFIG.ANCHOR_MASTER, content);
    log(`✅ anchor-master.md atualizado`, 'success');
    return true;
  } catch (e) {
    log(`❌ Erro ao atualizar anchor-master.md: ${e.message}`, 'error');
    return false;
  }
}

// ============================================================================
// GIT OPERATIONS
// ============================================================================

async function gitCommitAndPush(message, files = []) {
  try {
    log(`📝 Fazendo commit: ${message}`, 'info');

    // Stage files
    if (files.length > 0) {
      await execAsync(`git add ${files.map(f => `"${f}"`).join(' ')}`, {
        cwd: CONFIG.PROJECT_ROOT,
      });
    }

    // Commit
    await execAsync(
      `git commit -m "${message.replace(/"/g, '\\"')}\n\nCo-Authored-By: Cluster Daily Architect <cluster@negociocerto.org>"`,
      { cwd: CONFIG.PROJECT_ROOT }
    );

    // Push
    const origin = `https://${CONFIG.GITHUB_USER}:${CONFIG.GITHUB_TOKEN}@github.com/${CONFIG.GITHUB_USER}/negociocertoorg.git`;
    await execAsync(`git push ${origin} HEAD:main`, {
      cwd: CONFIG.PROJECT_ROOT,
      stdio: 'pipe',
    });

    log(`✅ Git commit e push realizado`, 'success');
    return true;
  } catch (e) {
    log(`❌ Erro em git operation: ${e.message}`, 'error');
    return false;
  }
}

// ============================================================================
// CLUSTER-MASTER CLEANUP
// ============================================================================

function removeArticleFromClusterMaster(articleTitle) {
  try {
    let content = fs.readFileSync(CONFIG.CLUSTER_MASTER, 'utf-8');

    // Encontrar e remover a entrada do artigo
    const articleRegex = new RegExp(`^#### ${articleTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\nURL:.*?\\nLinka para:.*?$`, 'gm');
    content = content.replace(articleRegex, '');

    // Remover linhas em branco extras
    content = content.replace(/\n\n\n+/g, '\n\n');

    fs.writeFileSync(CONFIG.CLUSTER_MASTER, content);
    log(`✅ Artigo removido de cluster-master.md`, 'success');
    return true;
  } catch (e) {
    log(`❌ Erro ao remover artigo: ${e.message}`, 'error');
    return false;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log(`\n${'='.repeat(80)}`, 'info');
  log(`🚀 Iniciando Cluster Daily Architect`, 'info');
  log(`${new Date().toISOString()}`, 'info');
  log(`${'='.repeat(80)}`, 'info');

  try {
    // 1. Carregar state
    const state = loadState();
    state.lastRun = new Date().toISOString();

    // 2. Ler cluster-master
    log(`\n📂 Lendo cluster-master.md...`, 'info');
    const articles = parseClusterMaster();
    log(`✅ ${articles.length} artigos encontrados`, 'success');

    if (articles.length === 0) {
      log(`⚠️ Nenhum artigo no cluster-master.md`, 'warn');
      await sendTelegram(`⚠️ <b>Cluster Architect Daily</b>\n\nNenhum artigo para arquitetar hoje.`);
      return;
    }

    // 3. Encontrar próximo artigo não processado
    let targetArticle = null;
    for (const article of articles) {
      if (!state.processedArticles.includes(article.url)) {
        targetArticle = article;
        break;
      }
    }

    if (!targetArticle) {
      log(`✅ Todos os artigos já foram processados`, 'success');
      await sendTelegram(`✅ <b>Cluster Architect</b>\n\nTodos os artigos foram processados. Próximo ciclo em 24h.`);
      saveState(state);
      return;
    }

    log(`\n🎯 Artigo selecionado: ${targetArticle.title}`, 'info');
    log(`URL: ${targetArticle.url}`, 'info');
    log(`Pillar: ${targetArticle.pillarUrl}`, 'info');
    log(`Links para: ${targetArticle.linksTo.join(', ')}`, 'info');

    // 4. Determinar layout Astro
    const layout = determineLayout(targetArticle.title);
    log(`\n📐 Layout determinado: ${layout}`, 'info');

    // 5. Chamar @arquiteto-cluster (que busca SERP internamente)
    log(`\n🏗️ Etapa 1: @arquiteto-cluster — Buscar SERP + Arquitetar H2s...`, 'info');
    let briefing;
    try {
      briefing = await callArquitetoCluster(targetArticle);
      briefing.title = targetArticle.title;
      briefing.url = targetArticle.url;
      briefing.layout = layout;
    } catch (e) {
      log(`⚠️ Falha em @arquiteto-cluster, usando estrutura base`, 'warn');
      briefing = {
        title: targetArticle.title,
        url: targetArticle.url,
        h2s: [
          `Qual é a melhor opção para ${targetArticle.title}?`,
          `Comparação com alternativas`,
          `Como escolher a opção certa?`,
          `Casos de uso específicos`,
          `Conclusão e próximos passos`,
        ],
        linkH2Index: 3,
        linkReason: 'Ponto natural de expansão para pillar',
        transitionSuggestion: `Se você quer explorar todas as opções disponíveis, veja nosso guia sobre ${targetArticle.pillarUrl}`,
      };
    }

    // 6. Chamar @copywriter-cluster para gerar o artigo completo
    log(`\n✍️ Etapa 2: Gerar conteúdo do artigo...`, 'info');
    let article;
    try {
      article = await callCopywriterCluster(targetArticle, briefing);
    } catch (e) {
      log(`❌ Falha ao gerar artigo: ${e.message}`, 'error');
      await sendTelegram(`❌ <b>Erro na Redação</b>\n\nNão foi possível gerar o artigo. Verifique os logs.`);
      saveState(state);
      return;
    }

    // 7. Detectar elementos visuais
    const visualElements = detectVisualElements(article);
    log(`\n🎨 Elementos visuais detectados:`, 'info');
    log(`  Tabelas: ${visualElements.hasTable ? 'Sim' : 'Não'}`, 'info');
    log(`  Grids: ${visualElements.hasContainerGrid ? 'Sim' : 'Não'}`, 'info');

    // Nota: Aqui você chamaria @revisor-design se necessário
    if (visualElements.hasAnyVisualElement) {
      log(`⚠️ Artigo contém elementos visuais - chamaria @revisor-design em produção`, 'warn');
    }

    // 8. Atualizar anchor-master
    updateAnchorMaster(targetArticle.pillarUrl, briefing.anchorText, 'target', targetArticle.url);

    // 9. Enviar preview para Telegram
    const previewMessage = `
<b>🏗️ Rascunho Pronto para Aprovação</b>

<b>Artigo:</b> ${targetArticle.title}
<b>URL:</b> ${targetArticle.url}
<b>Money Page:</b> ${targetArticle.moneyPage}
<b>Pillar:</b> ${targetArticle.pillarUrl}

<b>Estrutura H2s:</b>
${briefing.h2s.map((h, i) => `${i + 1}. ${h}`).join('\n')}

<b>Link Contextual:</b>
H2 ${briefing.linkH2Index + 1} → Pillar
${briefing.transitionSuggestion}

<b>Elementos Visuais:</b>
${visualElements.hasTable ? '📊 Tabelas detectadas' : 'Sem tabelas'}

Aprova para publicar ou quer fazer ajustes?
`;

    await sendTelegramWithButtons(previewMessage, targetArticle.url);

    // 10. Salvar como pendente de aprovação
    state.pendingApprovals[targetArticle.url] = {
      metadata: targetArticle,
      briefing,
      htmlContent: article,
      visualElements,
      timestamp: new Date().toISOString(),
    };

    saveState(state);
    log(`\n⏳ Aguardando sua aprovação no Telegram...`, 'info');

  } catch (e) {
    log(`\n❌ Erro fatal: ${e.message}`, 'error');
    log(`Stack: ${e.stack}`, 'error');
    await sendTelegram(`❌ <b>Erro no Cluster Architect</b>\n\n<code>${e.message}</code>`);
    process.exit(1);
  }
}

// ============================================================================
// HANDLER DE APROVAÇÃO (para usar com webhook Telegram)
// ============================================================================

async function handleApproval(callbackData) {
  const [action, articleKey] = callbackData.split('_');
  const state = loadState();
  const pending = state.pendingApprovals[articleKey];

  if (!pending) {
    log(`❌ Artigo não encontrado: ${articleKey}`, 'error');
    return;
  }

  log(`\n📋 Processando ${action} para: ${articleKey}`, 'info');

  if (action === 'approve') {
    log(`✅ Aprovado: ${pending.briefing.title}`, 'success');
    await sendTelegram(`✅ <b>Artigo Aprovado!</b>\n\n📝 ${pending.metadata.title}\n\nPublicando...`);

    try {
      const urlPath = pending.metadata.url.replace(/\/$/, ''); // remove / final se houver
      const slug = urlPath.substring(1); // remove / inicial

      // VALIDAÇÃO: garantir que slug é válido antes de criar arquivos
      if (!slug || slug === 'undefined' || slug.trim() === '') {
        const errorMsg = `❌ ERRO: slug inválido "${slug}" — artigo NÃO foi publicado`;
        log(errorMsg, 'error');
        await sendTelegram(`❌ <b>Erro na Publicação</b>\n\nSlug inválido: "${slug}"\n\nVerifique metadata.url no estado do artigo.`);
        return;
      }

      const layout = pending.briefing.layout || 'bloglayout';
      let filesToCommit = [CONFIG.ANCHOR_MASTER]; // sempre atualiza anchor-master
      let filePath, gitPath;

      // 1. GERAR IMAGEM (bloglayout e contentlayout obrigatório)
      if (layout === 'bloglayout' || layout === 'contentlayout' || layout === 'reviewlayout') {
        log(`\n🖼️ Gerando imagem de capa (16:9)...`, 'info');
        const topicVisual = `artigo sobre ${pending.briefing.title}`;
        const imagePath = path.join(CONFIG.PROJECT_ROOT, `public/images/${slug}.png`);

        try {
          // Chamar npm run gerar-imagem com o script oficial
          const command = `npm run gerar-imagem -- --slug "${slug}" --topico "${topicVisual}" --format "16:9"`;
          log(`   Executando: ${command}`, 'info');

          const { stdout, stderr } = await execAsync(command, {
            cwd: CONFIG.PROJECT_ROOT,
            maxBuffer: 10 * 1024 * 1024, // 10MB para imagens grandes
          });

          if (fs.existsSync(imagePath)) {
            log(`   ✅ Imagem gerada: ${imagePath}`, 'success');
            filesToCommit.push(`public/images/${slug}.png`);
          } else {
            const errorMsg = `❌ ERRO: Imagem não foi gerada — artigo NÃO será publicado`;
            log(errorMsg, 'error');
            await sendTelegram(`❌ <b>Erro ao Gerar Imagem</b>\n\nNão foi possível gerar a imagem de capa para "${pending.briefing.title}".\n\nVerifique se o Google Gemini API está funcionando.\n\nArtigo NÃO foi publicado.`);
            return;
          }

          if (stderr) log(`   Output: ${stderr.substring(0, 200)}`, 'info');
        } catch (e) {
          log(`   ⚠️ Erro ao gerar imagem: ${e.message}`, 'warn');
          log(`   💡 Você pode gerar manualmente depois com:`, 'info');
          log(`      npm run gerar-imagem -- --slug "${slug}" --topico "${topicVisual}"`, 'info');
        }
      }

      // 2. CRIAR ARQUIVO NO LOCAL CORRETO
      if (layout === 'bloglayout') {
        // blogLayout → src/content/blog/{slug}.md (com frontmatter YAML)
        const blogDir = path.join(CONFIG.PROJECT_ROOT, 'src/content/blog');
        if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });
        filePath = path.join(blogDir, `${slug}.md`);
        gitPath = `src/content/blog/${slug}.md`;
        filesToCommit.push(gitPath);

        // Gerar frontmatter e prepend ao conteúdo
        const frontmatter = generateFrontmatter({
          title: pending.briefing.title,
          slug: slug,
          description: pending.briefing.title,
          keyword: pending.metadata.keyword || pending.briefing.title
        });
        const contentWithFrontmatter = frontmatter + pending.htmlContent;
        fs.writeFileSync(filePath, contentWithFrontmatter);
      } else {
        // contentLayout/reviewLayout → src/pages/{slug}/index.astro
        const pageDir = path.join(CONFIG.PROJECT_ROOT, `src/pages${urlPath}`);
        filePath = path.join(pageDir, 'index.astro');
        gitPath = `src/pages${urlPath}/index.astro`;
        if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
        filesToCommit.push(gitPath);

        // Para .astro files, escrever como está (já deve ter estrutura Astro)
        fs.writeFileSync(filePath, pending.htmlContent);
      }
      log(`📄 ${layout} criado: ${filePath}`, 'info');

      // 3. ATUALIZAR PÁGINA DO AUTOR (apenas para contentlayout/reviewlayout)
      if (layout !== 'bloglayout') {
        log(`\n👤 Atualizando página do autor...`, 'info');
        const autorPath = path.join(CONFIG.PROJECT_ROOT, 'src/pages/autor/gabriella-fernandes.astro');
        const estruturaPath = path.join(CONFIG.PROJECT_ROOT, 'src/data/estrutura.ts');

        try {
          // Adicionar novo artigo ao array de gabriella-fernandes.astro
          let autorContent = fs.readFileSync(autorPath, 'utf-8');
          const newArticleEntry = `    {\n      title: "${pending.briefing.title}",\n      description: "${pending.briefing.title}",\n      href: "${slug}",\n      date: "${new Date().toISOString().split('T')[0]}",\n    },\n`;

          // Inserir após "const articles = ["
          autorContent = autorContent.replace(/const articles = \[/, `const articles = [\n${newArticleEntry}`);
          fs.writeFileSync(autorPath, autorContent);
          log(`   ✅ gabriella-fernandes.astro atualizado`, 'info');
          filesToCommit.push('src/pages/autor/gabriella-fernandes.astro');
        } catch (e) {
          log(`   ⚠️ Erro ao atualizar gabriella-fernandes.astro: ${e.message}`, 'warn');
        }

        try {
          // TODO: Atualizar estrutura.ts com subcategoria correta
          log(`   ⚠️ TODO: atualizar estrutura.ts com subcategoria`, 'warn');
          filesToCommit.push('src/data/estrutura.ts');
        } catch (e) {
          log(`   ⚠️ Erro ao atualizar estrutura.ts: ${e.message}`, 'warn');
        }
      }

      // 4. GIT COMMIT E PUSH
      const commitMsg = `feat: publica artigo cluster '${pending.briefing.title}' [${slug}]\n\nLayout: ${layout}\nCapa: public/images/${slug}.png`;
      const success = await gitCommitAndPush(commitMsg, filesToCommit);

      if (success) {
        // 3. Remover de cluster-master
        removeArticleFromClusterMaster(pending.briefing.title);

        // 4. Commit final
        await gitCommitAndPush(`docs: remove artigo publicado de cluster-master`, [CONFIG.CLUSTER_MASTER]);

        // 5. Marcar como processado
        state.processedArticles.push(articleKey);
        delete state.pendingApprovals[articleKey];
        saveState(state);

        await sendTelegram(
          `✅ <b>Publicado com Sucesso!</b>\n\n📄 ${pending.briefing.title}\n🔗 ${pending.metadata.url}\n\nPróximo artigo em 24h.`
        );
      } else {
        throw new Error('Falha no git push');
      }
    } catch (e) {
      log(`❌ Erro ao publicar: ${e.message}`, 'error');
      await sendTelegram(`❌ <b>Erro na Publicação</b>\n\n${e.message}`);
    }

  } else if (action === 'reject') {
    log(`❌ Rejeitado: ${pending.briefing.title}`, 'warn');
    await sendTelegram(`❌ <b>Artigo Rejeitado</b>\n\n${pending.briefing.title}\n\nAguardando próximo ciclo...`);
    delete state.pendingApprovals[articleKey];
    saveState(state);

  } else if (action === 'preview') {
    log(`👁️ Preview solicitado: ${pending.briefing.title}`, 'info');
    await sendTelegram(
      `👀 <b>Preview</b>\n\n${pending.briefing.title}\n\nURL: http://localhost:${CONFIG.LOCALHOST_PORT}${pending.metadata.url}/\n\nVolte ao menu anterior para aprovação.`
    );
  }
}

// ============================================================================
// EXECUÇÃO
// ============================================================================

if (process.argv[2] === '--webhook') {
  const callbackData = process.argv[3];
  handleApproval(callbackData);
} else {
  main().catch(e => {
    log(`❌ Erro não tratado: ${e.message}`, 'error');
    process.exit(1);
  });
}
