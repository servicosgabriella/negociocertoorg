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
const { exec, spawn, spawnSync } = require('child_process');
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
  CLUSTER_MASTER: path.join(__dirname, '../../squads/squad-cluster/file/cluster-master.md'),
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
    const skillPath = path.join(CONFIG.PROJECT_ROOT, `squads/squad-cluster/skill/${skillName}.md`);
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
 * Carrega o arquivo .md de um agente do squad-cluster
 */
function loadAgent(agentName) {
  try {
    const agentPath = path.join(CONFIG.PROJECT_ROOT, `squads/squad-cluster/agents/@${agentName}.md`);
    if (fs.existsSync(agentPath)) {
      const content = fs.readFileSync(agentPath, 'utf-8');
      log(`✅ Agente carregado: @${agentName} (${content.length} chars)`, 'info');
      return content;
    }
    log(`⚠️ Agente não encontrado: @${agentName}`, 'warn');
    return null;
  } catch (e) {
    log(`⚠️ Erro ao carregar agente @${agentName}: ${e.message}`, 'warn');
    return null;
  }
}

/**
 * Carrega o anchor-master.md (centralizado em squad-oportunidades)
 */
function loadAnchorMasterContent() {
  try {
    if (fs.existsSync(CONFIG.ANCHOR_MASTER)) {
      return fs.readFileSync(CONFIG.ANCHOR_MASTER, 'utf-8');
    }
    log(`⚠️ anchor-master.md não encontrado`, 'warn');
    return null;
  } catch (e) {
    log(`⚠️ Erro ao carregar anchor-master.md: ${e.message}`, 'warn');
    return null;
  }
}

/**
 * Carrega os modelos HTML de referência visual
 */
function loadModeloHtml() {
  try {
    const modeloPath = path.join(CONFIG.PROJECT_ROOT, 'squads/squad-cluster/data/modelo-html.md');
    if (fs.existsSync(modeloPath)) {
      return fs.readFileSync(modeloPath, 'utf-8');
    }
    return null;
  } catch (e) {
    log(`⚠️ Erro ao carregar modelo-html.md: ${e.message}`, 'warn');
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
 * Extrai perguntas e respostas do FAQ em HTML para formato YAML
 * Busca por <details><summary>...</summary><p>...</p></details>
 */
function extractFaqFromHtml(html) {
  const faqItems = [];
  const detailsRegex = /<details[^>]*>[\s\n]*<summary[^>]*>([^<]+)<\/summary>[\s\n]*<p[^>]*>([^<]+)<\/p>[\s\n]*<\/details>/gi;

  let match;
  while ((match = detailsRegex.exec(html)) !== null) {
    faqItems.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  }
  return faqItems;
}

/**
 * Gera frontmatter YAML para arquivo .md (bloglayout)
 * Inclui FAQ se fornecido
 */
function generateFrontmatter(data) {
  const {
    title = 'Untitled',
    slug = 'untitled',
    description = title,
    keyword = 'keyword',
    layout = 'bloglayout',
    faq = []
  } = data;

  const today = new Date().toISOString().split('T')[0];
  const coverImage = `/images/${slug}.png`;

  // Construir YAML formatado
  let yaml = `---
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
intencao: "Informacional"`;

  // Adicionar FAQ ao YAML se fornecido
  if (faq && faq.length > 0) {
    yaml += `\nfaq:`;
    for (const item of faq) {
      yaml += `\n  - question: "${item.question.replace(/"/g, '\\"')}"`;
      yaml += `\n    answer: "${item.answer.replace(/"/g, '\\"')}"`;
    }
  }

  yaml += `\n---\n\n`;

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
    [
      { text: '✏️ Editar', callback_data: `edit_${articleKey}` },
      { text: '❌ Rejeitar', callback_data: `reject_${articleKey}` },
    ],
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
// PREVIEW SERVERS — ASTRO + NGROK
// ============================================================================

async function writePreviewFile(metadata, briefing, htmlContent, description) {
  const urlPath = metadata.url.replace(/\/$/, '');
  const slug = urlPath.substring(1);

  if (!slug || slug === 'undefined' || slug.trim() === '') {
    throw new Error(`Slug inválido para preview: "${slug}"`);
  }

  const blogDir = path.join(CONFIG.PROJECT_ROOT, 'src/content/blog');
  if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

  const filePath = path.join(blogDir, `${slug}.md`);
  const gitPath = `src/content/blog/${slug}.md`;

  const faqItems = extractFaqFromHtml(htmlContent);
  let cleanHtml = htmlContent;
  if (faqItems.length > 0) {
    // Remove apenas os <details>, mantém o H2 "Perguntas Frequentes"
    for (const item of faqItems) {
      const escapedQuestion = item.question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedAnswer = item.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const detailsRegex = new RegExp(`<details[^>]*>\\s*<summary[^>]*>${escapedQuestion}<\\/summary>\\s*<p[^>]*>${escapedAnswer}<\\/p>\\s*<\\/details>`, 'i');
      cleanHtml = cleanHtml.replace(detailsRegex, '');
    }
    cleanHtml = cleanHtml.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  }

  const frontmatter = generateFrontmatter({
    title: briefing.title,
    slug,
    description: description || briefing.title,
    keyword: metadata.keyword || briefing.title,
    faq: faqItems,
  });

  fs.writeFileSync(filePath, frontmatter + cleanHtml);
  log(`✅ Arquivo de preview escrito: ${gitPath}`, 'success');
  return { filePath, gitPath, slug };
}

async function startNgrok(port) {
  log(`🌐 Iniciando ngrok na porta ${port}...`, 'info');

  // Encerrar ngrok existente
  try {
    await execAsync('pkill -f "ngrok http" 2>/dev/null || true');
    await new Promise(r => setTimeout(r, 1000));
  } catch (_) {}

  const proc = spawn('ngrok', ['http', String(port)], {
    detached: true,
    stdio: 'ignore',
  });

  let ngrokStartError = null;
  proc.on('error', (err) => { ngrokStartError = err; });
  proc.unref();

  // Aguardar API do ngrok estar pronta
  const startTime = Date.now();
  while (Date.now() - startTime < 30000) {
    await new Promise(r => setTimeout(r, 1000));
    if (ngrokStartError) throw new Error(`ngrok não encontrado: ${ngrokStartError.message}`);
    try {
      const res = await fetch('http://localhost:4040/api/tunnels');
      if (res.ok) {
        const data = await res.json();
        const tunnel = data.tunnels?.find(t => t.proto === 'https') || data.tunnels?.[0];
        if (tunnel?.public_url) {
          log(`✅ ngrok URL: ${tunnel.public_url}`, 'success');
          return { pid: proc.pid, url: tunnel.public_url };
        }
      }
    } catch (_) {}
  }

  throw new Error('Timeout aguardando ngrok iniciar (30s)');
}

const ASTRO_CONFIG_PATH = path.join(__dirname, '../../astro.config.mjs');

function patchAstroConfig(ngrokDomain) {
  const original = fs.readFileSync(ASTRO_CONFIG_PATH, 'utf-8');

  let patched;
  if (original.includes('allowedHosts')) {
    patched = original.replace(/allowedHosts:\s*\[.*?\]/, `allowedHosts: ['${ngrokDomain}']`);
  } else if (original.includes('server:')) {
    patched = original.replace(/server:\s*\{/, `server: {\n    allowedHosts: ['${ngrokDomain}'],`);
  } else {
    patched = original.replace(/vite:/, `server: {\n    host: true,\n    allowedHosts: ['${ngrokDomain}'],\n  },\n  vite:`);
  }

  fs.writeFileSync(ASTRO_CONFIG_PATH, patched);
  log(`✅ astro.config.mjs atualizado com allowedHosts: ${ngrokDomain}`, 'success');
  return original;
}

function restoreAstroConfig(originalContent) {
  if (!originalContent) return;
  try {
    fs.writeFileSync(ASTRO_CONFIG_PATH, originalContent);
    log(`✅ astro.config.mjs restaurado`, 'success');
  } catch (e) {
    log(`⚠️ Erro ao restaurar astro.config.mjs: ${e.message}`, 'warn');
  }
}

async function startAstroServer(port) {
  log(`🚀 Iniciando servidor Astro na porta ${port}...`, 'info');

  // Liberar porta se estiver em uso
  try {
    await execAsync(`fuser -k ${port}/tcp 2>/dev/null || true`);
    await new Promise(r => setTimeout(r, 500));
  } catch (_) {}

  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(port)], {
      cwd: CONFIG.PROJECT_ROOT,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let resolved = false;
    let actualPort = port;

    const onData = (data) => {
      const text = data.toString();
      const portMatch = text.match(/localhost:(\d+)/);
      if (portMatch) actualPort = parseInt(portMatch[1]);

      if (!resolved && (
        text.includes('Local') ||
        text.includes('ready in') ||
        text.includes('started in') ||
        text.includes('watching for')
      )) {
        resolved = true;
        proc.unref();
        log(`✅ Servidor Astro pronto na porta ${actualPort}`, 'success');
        resolve({ pid: proc.pid, port: actualPort });
      }
    };

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', reject);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        proc.unref();
        log(`⚠️ Astro não confirmou ready — assumindo porta ${actualPort}`, 'warn');
        resolve({ pid: proc.pid, port: actualPort });
      }
    }, 45000);
  });
}

async function stopPreviewServers(state) {
  const servers = state.previewServers;
  if (!servers) return;

  const port = servers.port || CONFIG.LOCALHOST_PORT;

  try {
    await execAsync(`fuser -k ${port}/tcp 2>/dev/null || true`);
    log(`🛑 Servidor Astro (porta ${port}) encerrado`, 'info');
  } catch (e) {
    log(`⚠️ Aviso ao encerrar Astro: ${e.message}`, 'warn');
  }

  try {
    await execAsync('pkill -f "ngrok http" 2>/dev/null || true');
    log(`🛑 ngrok encerrado`, 'info');
  } catch (e) {
    log(`⚠️ Aviso ao encerrar ngrok: ${e.message}`, 'warn');
  }

  if (servers.originalAstroConfig) {
    restoreAstroConfig(servers.originalAstroConfig);
  }

  delete state.previewServers;
  saveState(state);
}

// ============================================================================
// PARSING DO CLUSTER-MASTER
// ============================================================================

function parseClusterMaster() {
  try {
    let content = fs.readFileSync(CONFIG.CLUSTER_MASTER, 'utf-8');
    const articles = [];

    // Remover blocos de comentário HTML para evitar parsear template/instruções
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Case-insensitive para "Linka para:" / "linka para:"
    const postRegex = /^#### (.+?)\nURL: (.+?)\n[Ll]inka para: (.+?)$/gm;
    const moneyPageRegex = /^## Money Page: (.+?)\nURL da pillar: (.+?)$/gm;

    // Mapear cada artigo à sua money page correta (suporte a múltiplas money pages)
    const moneyPages = [];
    let match;
    while ((match = moneyPageRegex.exec(content)) !== null) {
      moneyPages.push({
        name: match[1],
        pillarUrl: match[2],
        index: match.index,
      });
    }

    postRegex.lastIndex = 0;
    while ((match = postRegex.exec(content)) !== null) {
      const [, title, url, linksTo] = match;

      // Encontrar a money page mais próxima antes deste artigo
      const articleIndex = match.index;
      let currentMoneyPage = null;
      let currentPillarUrl = null;
      for (const mp of moneyPages) {
        if (mp.index <= articleIndex) {
          currentMoneyPage = mp.name;
          currentPillarUrl = mp.pillarUrl;
        }
      }

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
  // Use npm exec to ensure claude is found
  const result = spawnSync('npm', ['exec', '--', 'claude', '-p', '--allowedTools', ''], {
    encoding: 'utf-8',
    input: prompt,
    maxBuffer: 20 * 1024 * 1024,
    timeout: 300000,
    env: { ...process.env, HOME: '/root' },
    cwd: CONFIG.PROJECT_ROOT,
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
 * Carrega o agente @arquiteto-cluster.md do disco e injeta como contexto.
 * Retorna: { h2s: [...], linkH2Index: number, linkReason: string, transitionSuggestion: string }
 */
async function callArquitetoCluster(articleData) {

  // 1. BUSCAR SERP
  log(`🔍 @arquiteto-cluster buscando SERP para: "${articleData.title}"`, 'info');
  const keywords = extractKeywords(articleData.title);
  log(`   Keywords extraídas: "${keywords}"`, 'info');
  const serpResults = await searchSERP(keywords);

  if (serpResults.length === 0) {
    log(`⚠️ Nenhum resultado SERP. @arquiteto-cluster trabalhará com estrutura base.`, 'warn');
  }

  // 2. CARREGAR AGENTE E SKILLS DO DISCO
  const agentContext = loadAgent('arquiteto-cluster');
  const skillQualificadorH2 = loadSkill('qualificador-h2');

  if (!agentContext) {
    throw new Error('Agente @arquiteto-cluster não encontrado em squad-cluster/agents/');
  }

  // 3. MONTAR CONTEXTO SERP
  const serpContext = serpResults.length > 0
    ? serpResults.map((r, i) => `RESULTADO ${i + 1}:\nTítulo: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`).join('\n---\n')
    : 'Nenhum resultado SERP retornou. Gere H2s baseado na keyword e no contexto do artigo.';

  const layoutsDesc = Object.entries(LAYOUTS).map(([k, v]) => `- **${k}**: ${v}`).join('\n');

  // 4. PROMPT = AGENTE COMPLETO + SKILL + DADOS DA TAREFA
  const prompt = `${agentContext}

---

## SKILL CARREGADA: qualificador-h2.md

${skillQualificadorH2 || '(skill não encontrada — use filtros: volume/intenção/estágio)'}

---

## TAREFA

Execute a Sequência de Execução Obrigatória (PASSOS 1-6) para o artigo abaixo.

ARTIGO:
- Título/Keyword: ${articleData.title}
- Pillar page (receberá o link): ${articleData.pillarUrl}
- Links para: ${articleData.linksTo.join(', ')}

SERP COLETADA (use como se fossem os resultados reais do Google — top 3):
${serpContext}

LAYOUTS VISUAIS DISPONÍVEIS (avalie se o artigo vai precisar):
${layoutsDesc}

---

## OUTPUT OBRIGATÓRIO

Responda APENAS com JSON válido. Sem texto antes, sem texto depois, sem markdown.

{
  "h2s": [
    "H2 1 em cauda longa",
    "H2 2 em cauda longa",
    "H2 3 em cauda longa",
    "H2 4 em cauda longa",
    "H2 5 em cauda longa"
  ],
  "linkH2Index": 3,
  "linkReason": "Por que este H2 é o gancho natural para a pillar",
  "transitionSuggestion": "Frase de transição sugerida para inserir o link",
  "needsDesignReview": false,
  "suggestedLayouts": [],
  "designNotes": "Descreva elementos visuais necessários, ou deixe vazio"
}`;

  try {
    log(`🏗️ @arquiteto-cluster executando sequência obrigatória (PASSOS 1-6)...`, 'info');

    const text = callClaude(prompt);

    // Extrair JSON da resposta (agente pode produzir texto antes do JSON)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log(`⚠️ @arquiteto-cluster retornou resposta sem JSON válido`, 'warn');
      log(`Resposta (200 chars): ${text.substring(0, 200)}...`, 'warn');
      throw new Error('JSON não encontrado na resposta do @arquiteto-cluster');
    }

    const result = JSON.parse(jsonMatch[0]);

    if (!result.h2s || result.h2s.length < 5) {
      throw new Error(`@arquiteto-cluster retornou apenas ${result.h2s?.length || 0} H2s (mínimo: 5)`);
    }

    // Garantir que linkH2Index está dentro dos bounds do array
    if (typeof result.linkH2Index !== 'number' || result.linkH2Index < 0 || result.linkH2Index >= result.h2s.length) {
      log(`⚠️ linkH2Index inválido (${result.linkH2Index}) — usando índice ${result.h2s.length - 2}`, 'warn');
      result.linkH2Index = result.h2s.length - 2;
    }

    log(`✅ @arquiteto-cluster gerou ${result.h2s.length} H2s`, 'success');
    log(`📍 Link no H2 ${result.linkH2Index + 1}: "${result.h2s[result.linkH2Index]}"`, 'info');
    log(`   Razão: ${result.linkReason}`, 'info');

    if (result.needsDesignReview) {
      log(`🎨 Design review necessário: ${result.suggestedLayouts.join(', ')}`, 'info');
      log(`   Notas: ${result.designNotes}`, 'info');
    }

    result.serpResults = serpResults;
    return result;
  } catch (e) {
    log(`❌ Erro ao chamar @arquiteto-cluster: ${e.message}`, 'error');
    throw e;
  }
}

/**
 * Chama @copywriter-cluster para gerar o artigo completo
 * Carrega o agente @copywriter-cluster.md e todas as skills do disco.
 * Retorna: HTML string do artigo (sem H1, sem preamble)
 */
async function callCopywriterCluster(articleData, briefing) {

  // DETECTAR NICHO
  const niche = detectNiche(articleData.title);
  log(`   Nicho detectado: ${niche}`, 'info');

  // CARREGAR AGENTE E TODAS AS SKILLS DO DISCO
  const agentContext = loadAgent('copywriter-cluster');
  const skillCopyNiche = loadSkill(`copy-${niche}`);
  const skillTextoAncora = loadSkill('texto-ancora');
  const skillTabelaResponsiva = loadSkill('tabela-responsiva');
  const skillOtimizadorH1 = loadSkill('otimizador-h1');
  const skillConstrutorSlug = loadSkill('construtor-slug');
  const modeloHtml = loadModeloHtml();
  const anchorMasterContent = loadAnchorMasterContent();

  if (!agentContext) {
    throw new Error('Agente @copywriter-cluster não encontrado em squad-cluster/agents/');
  }
  if (!skillCopyNiche) {
    log(`⚠️ Skill copy-${niche} não encontrada, usando copy-negociocerto como fallback`, 'warn');
  }

  const h2sFormatted = briefing.h2s.map((h, i) => `${i + 1}. ${h}`).join('\n');

  const serpContext = briefing.serpResults && briefing.serpResults.length > 0
    ? briefing.serpResults.map((r, i) => `COMPETIDOR ${i + 1}:\nTítulo: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`).join('\n---\n')
    : 'Sem dados SERP disponíveis.';

  const designSection = briefing.designNotes
    ? `\n## NOTAS DE DESIGN DO @ARQUITETO-CLUSTER\n${briefing.designNotes}\n`
    : '';

  // PROMPT = AGENTE COMPLETO + TODAS AS SKILLS + BRIEFING DO ARQUITETO
  const prompt = `${agentContext}

---

## SKILL ATIVA DE TOM: copy-${niche}.md

Toda decisão de tom, vocabulário, argumentação e estilo vem desta skill.
NÃO invente variações. Siga exatamente.

${skillCopyNiche || loadSkill('copy-negociocerto') || '(skill de tom não carregada)'}

---

## SKILL: texto-ancora.md

Use para escolher o texto âncora do link interno obrigatório.

${skillTextoAncora || '(skill não carregada)'}

---

## ANCHOR-MASTER (histórico de âncoras já usadas)

Este é o estado atual das âncoras registradas para cada pillar page.
Consulte obrigatoriamente antes de definir o texto âncora do link interno.
Siga os passos da skill texto-ancora.md: calcule o saldo disponível por tipo (Target/Brand/Misc),
escolha o tipo com saldo positivo, nunca repita uma âncora target exata já usada.

${anchorMasterContent || '(anchor-master.md não encontrado — use âncora target na primeira ocorrência)'}

---

## SKILL: tabela-responsiva.md

Use se o artigo precisar de tabelas.

${skillTabelaResponsiva || '(skill não carregada)'}

---

## SKILL: otimizador-h1.md

${skillOtimizadorH1 || '(skill não carregada)'}

---

## SKILL: construtor-slug.md

${skillConstrutorSlug || '(skill não carregada)'}

---

## REFERÊNCIA DE MODELOS HTML (data/modelo-html.md)

Use EXATAMENTE esses padrões para tabelas. Nunca markdown, sempre HTML inline.

${modeloHtml || '(modelos não carregados)'}

---

## BRIEFING DO @ARQUITETO-CLUSTER

Keyword: ${articleData.title}
Pillar page (receberá o link): ${articleData.pillarUrl}
Nicho: ${niche}

Estrutura de H2s aprovada:
${h2sFormatted}

Link obrigatório:
- H2 de linkagem (índice ${briefing.linkH2Index}): "${briefing.h2s[briefing.linkH2Index]}"
- Razão: ${briefing.linkReason}
- Transição sugerida pelo arquiteto: "${briefing.transitionSuggestion}"
- URL do link: ${articleData.pillarUrl}

Contexto competitivo (SERP coletada pelo @arquiteto-cluster):
${serpContext}
${designSection}
---

## INSTRUÇÃO DE OUTPUT

O título (H1) já está no frontmatter do arquivo .md. NÃO inclua <h1> no conteúdo.

**OBRIGATÓRIO — FAQ:**
Incluir FAQ com mínimo 5 perguntas reais que o leitor digitaria no Google.
Respostas diretas de 2-4 frases.
Estrutura obrigatória:
<h2>Perguntas Frequentes</h2>
<details><summary>Pergunta aqui?</summary><p>Resposta.</p></details>
<details><summary>Pergunta aqui?</summary><p>Resposta.</p></details>
[mais details...]

O script extrai automaticamente os <details> para o frontmatter YAML.
O H2 "Perguntas Frequentes" permanece no artigo.

**REGRA ABSOLUTA — VOCABULÁRIO ACESSÍVEL:**
O leitor é dono de pequeno negócio. Palavras técnicas difíceis devem ser substituídas por equivalentes simples.
Se a palavra técnica for inevitável, explicar entre parênteses de forma amigável.
Exemplo: "interoperabilidade (capacidade de aceitar diferentes bandeiras)"

**REGRA ABSOLUTA — TRAVESSÃO PROIBIDO:**
Nunca usar o caractere — (travessão / em-dash) em nenhuma frase do artigo.
Substituir sempre por vírgula, ponto final ou ponto e vírgula.
Esta é a regra mais verificada antes da publicação.

**REGRA ABSOLUTA — DATAS REAIS:**
Nunca usar datas futuras como se já ocorreram. Verifique: a data atual é ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.

**REGRA ABSOLUTA — CONECTIVOS E CLICHÊS PROIBIDOS:**
Nunca iniciar parágrafo com: "Vale ressaltar", "É importante notar", "Além disso", "Em suma", "Dessa forma", "Nesse sentido".
Nunca usar: "No cenário digital de hoje", "Como todos sabemos", "Crucial", "solução", "ecossistema".

⚠️ INSTRUÇÃO OBRIGATÓRIA — RESPONDA APENAS COM O CONTEÚDO DO ARTIGO

Sua resposta deve conter APENAS e EXCLUSIVAMENTE:
1. Uma linha "DESCRIPTION: [meta description]"
2. Uma linha separadora "---"
3. O HTML do artigo (iniciando com <p> ou <h2>)

NÃO INCLUIR:
- Nenhum comentário antes do DESCRIPTION
- Nenhuma explicação ou relatório de trabalho
- Nenhuma confirmação do checklist
- Nenhuma nota ou observação
- Nenhum texto APÓS o último </p>, </h2>, </details> ou </div>
- Nenhum resumo ou rodapé

Formato EXATO (e ÚNICO esperado):

DESCRIPTION: [meta description SEO real, máximo 155 caracteres, diferente do título, descreve o que o leitor vai aprender]
---
[HTML do artigo começa aqui — primeira tag deve ser <p> ou <h2>]

Regras do HTML:
- Sem preamble, sem notas de redação
- Sem blocos de código markdown (sem \`\`\`html)
- HTML limpo, sem atributos de estilo inline desnecessários
- O checklist do @copywriter-cluster deve ser cumprido internamente`;

  try {
    log(`✍️ @copywriter-cluster gerando artigo com agente + ${Object.keys({skillCopyNiche, skillTextoAncora, skillTabelaResponsiva}).filter(k => eval(k)).length} skills carregadas...`, 'info');

    let raw = callClaude(prompt);

    // 1. Remover blocos de código markdown
    raw = raw.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim();

    // 2. Extrair description do cabeçalho (formato: "DESCRIPTION: ...\n---\n[HTML]")
    let description = null;
    const descMatch = raw.match(/^DESCRIPTION:\s*(.+)/i);
    if (descMatch) {
      description = descMatch[1].trim().substring(0, 155);
      log(`✅ Meta description extraída: "${description}"`, 'success');
      // Remover cabeçalho (DESCRIPTION: ... e separador ---)
      raw = raw.replace(/^DESCRIPTION:.*\n?-{3,}\n?/i, '').trim();
    } else {
      log(`⚠️ DESCRIPTION não encontrada no output — será gerada a partir do título`, 'warn');
    }

    let html = raw;

    // 3. Remover preamble — qualquer texto antes do primeiro tag HTML
    const firstTagIndex = html.search(/<[a-zA-Z]/);
    if (firstTagIndex > 0) {
      const preamble = html.substring(0, firstTagIndex).trim();
      if (preamble.length > 0) {
        log(`⚠️ Preamble detectado (${preamble.length} chars) — removendo...`, 'warn');
        log(`   Preview: "${preamble.substring(0, 100)}"`, 'warn');
        html = html.substring(firstTagIndex);
      }
    }

    // 3. Remover H1s (título vem do frontmatter)
    const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
    if (h1Matches.length > 0) {
      log(`⚠️ ${h1Matches.length} H1(s) detectados — removendo (título está no frontmatter)...`, 'warn');
      html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '').trim();
    }

    // 4. Validar e remover travessões (regra absoluta)
    const emdashCount = (html.match(/—/g) || []).length;
    if (emdashCount > 0) {
      log(`⚠️ ${emdashCount} travessão(ões) detectado(s) — removendo e substituindo por vírgula...`, 'warn');
      html = html.replace(/\s*—\s*/g, ', ');
      log(`✅ Travessões substituídos por vírgula`, 'success');
    }

    // 6. Validar FAQ obrigatório
    const hasFaq = html.includes('<details') && html.includes('<summary');
    if (!hasFaq) {
      log(`⚠️ FAQ não encontrado no artigo — obrigatório mínimo 5 perguntas em <details>`, 'warn');
    } else {
      const faqCount = (html.match(/<details/g) || []).length;
      log(`✅ FAQ presente: ${faqCount} perguntas`, 'success');
      if (faqCount < 5) {
        log(`⚠️ FAQ com apenas ${faqCount} pergunta(s) — mínimo obrigatório é 5`, 'warn');
      }
    }

    // 7. Validar link interno
    if (!html.includes(`href="${articleData.pillarUrl}"`)) {
      log(`⚠️ Link para pillar "${articleData.pillarUrl}" não encontrado no HTML`, 'warn');
    }

    // 7. Validar comprimento mínimo
    if (!html || html.length < 700) {
      log(`⚠️ Artigo gerado muito curto (${html.length} chars)`, 'warn');
    }

    log(`✅ Artigo gerado: ${html.length} caracteres`, 'success');
    return { html, description };
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

/**
 * Extrai o texto âncora real do HTML gerado pelo copywriter.
 * Busca o primeiro <a href="pillarUrl">TEXTO</a> no artigo.
 */
function extractAnchorTextFromHtml(html, pillarUrl) {
  const escapedUrl = pillarUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<a[^>]+href=["']${escapedUrl}["'][^>]*>([^<]+)<\\/a>`, 'i');
  const match = html.match(regex);
  if (match) {
    return match[1].trim();
  }
  log(`⚠️ Âncora não encontrada no HTML para URL: ${pillarUrl}`, 'warn');
  return null;
}

/**
 * Determina o tipo de âncora (target/brand/misc) com base no texto.
 * Heurística simples baseada nas regras da skill texto-ancora.md.
 */
function determineAnchorType(anchorText, pillarUrl) {
  const text = anchorText.toLowerCase();
  // Brand: contém domínio ou URL
  if (text.includes('negociocerto') || text.includes('http') || text.includes('.com')) {
    return 'brand';
  }
  // Misc: âncoras genéricas
  const miscPatterns = ['clique aqui', 'saiba mais', 'leia', 'veja aqui', 'acesse', 'confira aqui'];
  if (miscPatterns.some(p => text.includes(p))) {
    return 'misc';
  }
  // Target: contém palavras-chave da pillar
  return 'target';
}

/**
 * Atualiza o anchor-master.md com a nova âncora usada.
 * Adiciona linha no histórico e recalcula o saldo a partir do histórico real.
 */
function updateAnchorMaster(targetPage, anchorText, type, sourceSlug) {
  try {
    let content = loadAnchorMaster();
    const date = new Date().toLocaleDateString('pt-BR');
    const newRow = `| ${sourceSlug} | ${anchorText} | ${type} | ${date} |`;

    if (!content.includes(`## ${targetPage}`)) {
      // Seção não existe — criar do zero
      const newSection = [
        `\n## ${targetPage}`,
        `Palavra-chave alvo: [atualizar]`,
        `Tipo: interna`,
        ``,
        `### Saldo atual`,
        `Target: 1 links usados — 4 disponíveis até 50%`,
        `Brand: 0 links usados — 2 disponíveis até 25%`,
        `Misc: 0 links usados — 2 disponíveis até 25%`,
        `Total de links registrados: 1`,
        ``,
        `### Histórico de âncoras usadas`,
        `| Post de origem | Âncora usada | Tipo | Data |`,
        `|---|---|---|---|`,
        newRow,
        ``,
        `### Âncoras target já usadas (nunca repetir exatas)`,
        type === 'target' ? `- "${anchorText}"` : '',
      ].join('\n');
      content += newSection;
    } else {
      // Seção existe — appenda nova linha na tabela do histórico
      // Encontra o separador da tabela (|---|---|---|---|) e insere após a última linha de dados
      const sectionStart = content.indexOf(`## ${targetPage}`);
      const nextSectionStart = content.indexOf('\n## ', sectionStart + 1);
      const sectionEnd = nextSectionStart === -1 ? content.length : nextSectionStart;
      let section = content.substring(sectionStart, sectionEnd);

      // Inserir nova linha após o último | da tabela
      const lastRowIndex = section.lastIndexOf('\n|');
      if (lastRowIndex !== -1) {
        section = section.substring(0, lastRowIndex + 1) + newRow + '\n' + section.substring(lastRowIndex + 1);
      } else {
        // Tabela não encontrada na seção — append ao final da seção
        section += `\n${newRow}\n`;
      }

      // Recalcular saldo a partir das linhas da tabela
      const rows = [...section.matchAll(/^\| .+ \| .+ \| (target|brand|misc) \| .+ \|$/gm)];
      const total = rows.length;
      const countTarget = rows.filter(r => r[1] === 'target').length;
      const countBrand = rows.filter(r => r[1] === 'brand').length;
      const countMisc = rows.filter(r => r[1] === 'misc').length;
      const maxTarget = Math.floor(total * 0.5);
      const maxBrand = Math.floor(total * 0.25);
      const maxMisc = Math.floor(total * 0.25);

      section = section
        .replace(/Target: \d+ links usados — \d+ disponíveis até 50%/, `Target: ${countTarget} links usados — ${Math.max(0, maxTarget - countTarget)} disponíveis até 50%`)
        .replace(/Brand: \d+ links usados — \d+ disponíveis até 25%/, `Brand: ${countBrand} links usados — ${Math.max(0, maxBrand - countBrand)} disponíveis até 25%`)
        .replace(/Misc: \d+ links usados — \d+ disponíveis até 25%/, `Misc: ${countMisc} links usados — ${Math.max(0, maxMisc - countMisc)} disponíveis até 25%`)
        .replace(/Total de links registrados: \d+/, `Total de links registrados: ${total}`);

      // Adicionar âncora target usada à lista de "nunca repetir"
      if (type === 'target') {
        if (section.includes('### Âncoras target já usadas')) {
          section = section.replace(
            /### Âncoras target já usadas \(nunca repetir exatas\)\n/,
            `### Âncoras target já usadas (nunca repetir exatas)\n- "${anchorText}"\n`
          );
        } else {
          section += `\n### Âncoras target já usadas (nunca repetir exatas)\n- "${anchorText}"\n`;
        }
      }

      content = content.substring(0, sectionStart) + section + content.substring(sectionEnd);
    }

    fs.writeFileSync(CONFIG.ANCHOR_MASTER, content);
    log(`✅ anchor-master.md atualizado — âncora "${anchorText}" (${type}) registrada`, 'success');
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

    // 1. Stage files
    if (files.length > 0) {
      await execAsync(`git add ${files.map(f => `"${f}"`).join(' ')}`, {
        cwd: CONFIG.PROJECT_ROOT,
      });
    }

    // 2. Commit
    await execAsync(
      `git commit -m "${message.replace(/"/g, '\\"')}\n\nCo-Authored-By: Cluster Daily Architect <cluster@negociocerto.org>"`,
      { cwd: CONFIG.PROJECT_ROOT }
    );

    // 3. Push com retry (até 3 tentativas) + rebase se necessário
    const origin = `https://${CONFIG.GITHUB_USER}:${CONFIG.GITHUB_TOKEN}@github.com/${CONFIG.GITHUB_USER}/negociocertoorg.git`;
    let pushSuccess = false;
    let lastError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        log(`   Tentativa ${attempt}/3 de push...`, 'info');
        await execAsync(`git push ${origin} HEAD:main`, {
          cwd: CONFIG.PROJECT_ROOT,
          stdio: 'pipe',
        });
        pushSuccess = true;
        log(`✅ Git commit e push realizado (tentativa ${attempt})`, 'success');
        break;
      } catch (e) {
        lastError = e;
        if (attempt < 3) {
          log(`   ⚠️ Falha na tentativa ${attempt}: ${e.message.split('\n')[0]}`, 'warn');
          log(`   Aguardando 2s e sincronizando com rebase...`, 'info');
          await new Promise(r => setTimeout(r, 2000));

          // Sincronizar com rebase antes da próxima tentativa
          try {
            await execAsync(`git pull --rebase origin main`, {
              cwd: CONFIG.PROJECT_ROOT,
            });
            log(`   ✅ Rebase realizado, tentando push novamente...`, 'info');
          } catch (rebaseError) {
            log(`   ⚠️ Erro no rebase: ${rebaseError.message.split('\n')[0]}`, 'warn');
            // Continua mesmo se rebase falhar
          }
        }
      }
    }

    if (!pushSuccess) {
      throw lastError || new Error('Falha em todas as tentativas de push');
    }

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
    let article, articleDescription;
    try {
      const result = await callCopywriterCluster(targetArticle, briefing);
      article = result.html;
      articleDescription = result.description;
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

    // 8. Subir servidores de preview e enviar link no Telegram
    let previewUrl = null;

    try {
      const targetPort = parseInt(CONFIG.LOCALHOST_PORT);

      // 8a. Iniciar ngrok primeiro para obter o domínio público
      log(`\n🌐 Iniciando ngrok na porta ${targetPort}...`, 'info');
      const ngrokResult = await startNgrok(targetPort);
      const ngrokDomain = new URL(ngrokResult.url).hostname;

      // 8b. Atualizar astro.config.mjs com o domínio do ngrok
      log(`\n⚙️ Atualizando astro.config.mjs com domínio ngrok...`, 'info');
      const originalAstroConfig = patchAstroConfig(ngrokDomain);

      // 8c. Escrever arquivo de preview no disco
      log(`\n📝 Escrevendo arquivo de preview...`, 'info');
      const previewFile = await writePreviewFile(targetArticle, briefing, article, articleDescription);

      // 8d. Iniciar Astro e aguardar estar pronto
      log(`\n🚀 Iniciando servidor Astro...`, 'info');
      const astroResult = await startAstroServer(targetPort);

      // Se Astro subiu em porta diferente, reiniciar ngrok na porta correta
      if (astroResult.port !== targetPort) {
        log(`⚠️ Astro subiu na porta ${astroResult.port} — reiniciando ngrok...`, 'warn');
        const ngrokNew = await startNgrok(astroResult.port);
        const newNgrokDomain = new URL(ngrokNew.url).hostname;
        patchAstroConfig(newNgrokDomain);
        ngrokResult.url = ngrokNew.url;
        ngrokResult.pid = ngrokNew.pid;
      }

      previewUrl = `${ngrokResult.url}/blog${targetArticle.url}/`.replace(/([^:]\/)\/+/g, '$1');

      state.previewServers = {
        port: astroResult.port,
        ngrokUrl: ngrokResult.url,
        originalAstroConfig,
        previewFile: previewFile.gitPath,
      };

      log(`✅ Preview disponível: ${previewUrl}`, 'success');
    } catch (e) {
      log(`⚠️ Servidores de preview indisponíveis: ${e.message}`, 'warn');
      // Cleanup parcial
      try { await execAsync('pkill -f "ngrok http" 2>/dev/null || true'); } catch (_) {}
    }

    // 9. Enviar preview para Telegram
    const previewLine = previewUrl ? `\n🌐 <b>Preview:</b> ${previewUrl}` : '';
    const previewMessage = `
<b>🏗️ Rascunho Pronto para Aprovação</b>

<b>Artigo:</b> ${targetArticle.title}
<b>URL:</b> ${targetArticle.url}
<b>Money Page:</b> ${targetArticle.moneyPage}
<b>Pillar:</b> ${targetArticle.pillarUrl}
${previewLine}
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
      description: articleDescription,
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

    // Encerrar servidores de preview antes de publicar
    await stopPreviewServers(state);

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
      let filesToCommit = [];
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

        // EXTRAIR FAQ DO HTML E REMOVER DO CONTEÚDO
        const faqItems = extractFaqFromHtml(pending.htmlContent);
        let cleanHtml = pending.htmlContent;

        if (faqItems.length > 0) {
          // Remover apenas os blocos <details> que foram extraídos
          // O H2 "Perguntas Frequentes" permanece no artigo para renderização do layout
          for (const item of faqItems) {
            const escapedQuestion = item.question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedAnswer = item.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const detailsRegex = new RegExp(`<details[^>]*>\\s*<summary[^>]*>${escapedQuestion}<\\/summary>\\s*<p[^>]*>${escapedAnswer}<\\/p>\\s*<\\/details>`, 'i');
            cleanHtml = cleanHtml.replace(detailsRegex, '');
          }

          // Remover linhas vazias extras deixadas pelos <details> removidos
          cleanHtml = cleanHtml.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
          log(`✅ FAQ extraído: ${faqItems.length} perguntas para frontmatter YAML — H2 mantido no artigo`, 'success');
        }

        // Gerar frontmatter e prepend ao conteúdo
        const frontmatter = generateFrontmatter({
          title: pending.briefing.title,
          slug: slug,
          description: pending.description || pending.briefing.title,
          keyword: pending.metadata.keyword || pending.briefing.title,
          faq: faqItems
        });
        const contentWithFrontmatter = frontmatter + cleanHtml;
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
        // 3. Extrair âncora do HTML e atualizar anchor-master
        const anchorText = extractAnchorTextFromHtml(pending.htmlContent, pending.metadata.pillarUrl);
        if (anchorText) {
          const anchorType = determineAnchorType(anchorText, pending.metadata.pillarUrl);
          updateAnchorMaster(pending.metadata.pillarUrl, anchorText, anchorType, pending.metadata.url);
          log(`📎 Âncora registrada: "${anchorText}" (${anchorType}) → ${pending.metadata.pillarUrl}`, 'info');
        } else {
          log(`⚠️ Âncora não encontrada no HTML — anchor-master.md não atualizado`, 'warn');
        }

        // 4. Remover de cluster-master
        removeArticleFromClusterMaster(pending.briefing.title);

        // 5. Commit final (anchor-master + cluster-master)
        await gitCommitAndPush(`docs: remove artigo publicado de cluster-master`, [CONFIG.CLUSTER_MASTER, CONFIG.ANCHOR_MASTER]);

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

    // Remover arquivo de preview do disco antes de encerrar servidores
    const previewFilePath = state.previewServers?.previewFile
      ? path.join(CONFIG.PROJECT_ROOT, state.previewServers.previewFile)
      : null;
    if (previewFilePath && fs.existsSync(previewFilePath)) {
      fs.unlinkSync(previewFilePath);
      log(`🗑️ Arquivo de preview removido: ${state.previewServers.previewFile}`, 'info');
    }

    // Encerrar servidores e restaurar astro.config.mjs
    await stopPreviewServers(state);

    await sendTelegram(`❌ <b>Artigo Rejeitado</b>\n\n${pending.briefing.title}\n\nAguardando próximo ciclo...`);
    delete state.pendingApprovals[articleKey];
    saveState(state);

  } else if (action === 'preview') {
    log(`👁️ Preview solicitado: ${pending.briefing.title}`, 'info');
    const previewLink = state.previewServers?.ngrokUrl
      ? `${state.previewServers.ngrokUrl}/blog${pending.metadata.url}/`.replace(/([^:]\/)\/+/g, '$1')
      : `http://localhost:${CONFIG.LOCALHOST_PORT}/blog${pending.metadata.url}/`.replace(/([^:]\/)\/+/g, '$1');
    await sendTelegram(
      `👀 <b>Preview</b>\n\n${pending.briefing.title}\n\nURL: ${previewLink}\n\nVolte ao menu anterior para aprovação.`
    );
  } else if (action === 'edit') {
    log(`✏️ Edição solicitada: ${pending.briefing.title}`, 'info');
    state.editingState = {
      articleKey,
      title: pending.briefing.title,
      timestamp: new Date().toISOString(),
    };
    saveState(state);
    await sendTelegram(
      `✏️ <b>Modo Edição Ativo</b>\n\n${pending.briefing.title}\n\nDigite a instrução de edição. Exemplo:\n"Expandir seção sobre segurança"\n"Adicionar mais exemplos práticos"\n"Simplificar linguagem técnica"\n\nExecute:\n<code>node .aiox-core/scripts/cluster-daily-architect.js --edit-instruction "${articleKey}" "SUA INSTRUÇÃO AQUI"</code>`
    );
  }
}

// ============================================================================
// HANDLER DE EDIÇÃO
// ============================================================================

async function handleEditInstruction(articleKey, editInstruction) {
  const state = loadState();
  const pending = state.pendingApprovals[articleKey];

  if (!pending) {
    log(`❌ Artigo não encontrado para edição: ${articleKey}`, 'error');
    return;
  }

  log(`\n✏️ Processando edição: ${pending.briefing.title}`, 'info');
  log(`   Instrução: ${editInstruction}`, 'info');

  try {
    // 1. CHAMAR COPYWRITER COM INSTRUÇÕES DE EDIÇÃO (ARTIGO COMPLETO)
    const niche = detectNiche(pending.metadata.title);
    const agentContext = loadAgent('copywriter-cluster');
    const skillCopyNiche = loadSkill(`copy-${niche}`);

    if (!agentContext) {
      throw new Error('Agente @copywriter-cluster não encontrado');
    }

    const h2sFormatted = pending.briefing.h2s.map((h, i) => `${i + 1}. ${h}`).join('\n');
    const serpContext = pending.briefing.serpResults && pending.briefing.serpResults.length > 0
      ? pending.briefing.serpResults.map((r, i) => `COMPETIDOR ${i + 1}:\nTítulo: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`).join('\n---\n')
      : 'Sem dados SERP disponíveis.';

    const editPrompt = `${agentContext}

---

## 🚨 CONTEXTO: EDIÇÃO DE ARTIGO EXISTENTE

⚠️ **INSTRUÇÕES CRÍTICAS - LEIA COM ATENÇÃO:**

1. ✅ RETORNE O ARTIGO COMPLETO (não apenas um snippet)
2. ✅ Faça APENAS a edição solicitada pelo usuário
3. ✅ Mantenha 95% do artigo original intacto
4. ✅ NÃO reescreva seções que não precisam de edição
5. ✅ Mantenha EXATAMENTE a mesma estrutura, tom e qualidade

ARTIGO ATUAL (COMPLETO - ${pending.htmlContent.length} caracteres):
${pending.htmlContent}

---

INSTRUÇÃO DE EDIÇÃO DO USUÁRIO:
"${editInstruction}"

---

## PROCESSO DE EDIÇÃO

Você é o @copywriter-cluster em modo de revisão cirúrgica.

**Passo a passo:**
1. Leia o artigo COMPLETO acima
2. Identifique EXATAMENTE qual(is) seção(ões) precisa(m) ser editada(s)
3. Faça APENAS essa edição específica
4. **RETORNE O ARTIGO 100% COMPLETO com a edição aplicada**
5. Não altere nenhuma outra parte

**O QUE DEVE PERMANECER IDÊNTICO:**
- ✅ Estrutura de H2s (não alterar títulos)
- ✅ Pillar page link (URL deve permanecer igual)
- ✅ FAQ obrigatório (mínimo 5 perguntas)
- ✅ Qualidade e tom da redação (onde não há edição)

**⚠️ CRÍTICO - FORMATO DE RESPOSTA:**

Sua resposta DEVE ter exatamente este formato:

DESCRIPTION: [meta description SEO — manter se não foi alterada, mudar se relevante]
---
[HTML DO ARTIGO COMPLETO - cada parágrafo, seção, tudo deve estar aqui]
[O artigo deve ter PELO MENOS ${Math.round(pending.htmlContent.length * 0.8)} caracteres — caso contrário não será aceito]

**Se você retornar um snippet ou apenas a seção editada, será rejeitado.**
**Você DEVE retornar o artigo inteiro com a edição aplicada.**`;

    log(`\n✍️ Reenviando para copywriter-cluster com instrução de edição (artigo COMPLETO)...`, 'info');
    let raw = callClaude(editPrompt);

    // Remover markdown wrappers
    raw = raw.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim();

    // Extrair nova description se houver
    let newDescription = pending.description;
    const descMatch = raw.match(/^DESCRIPTION:\s*(.+)/i);
    if (descMatch) {
      newDescription = descMatch[1].trim().substring(0, 155);
      log(`✅ Nova description: "${newDescription}"`, 'success');
      raw = raw.replace(/^DESCRIPTION:.*\n?-{3,}\n?/i, '').trim();
    }

    let newHtml = raw;

    // VALIDAÇÃO CRÍTICA: verificar se o HTML retornado tem tamanho mínimo
    const minSize = Math.round(pending.htmlContent.length * 0.8);
    if (newHtml.length < minSize) {
      log(`\n❌ ERRO: Artigo retornado muito curto (${newHtml.length} chars vs ${minSize} esperados)`, 'error');
      log(`   Parece que apenas um snippet foi retornado ao invés do artigo completo.`, 'error');
      log(`   O copywriter retornou:`, 'error');
      log(`   "${newHtml.substring(0, 200)}..."`, 'error');

      await sendTelegram(`❌ <b>Erro na Edição</b>\n\nO copywriter retornou apenas um snippet ao invés do artigo completo.\n\nArticle returned: ${newHtml.length} chars (expected: ${minSize}+)\n\nTente novamente com uma instrução mais clara.`);
      return;
    }

    // Remover H1s se houver
    const h1Matches = newHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
    if (h1Matches.length > 0) {
      log(`⚠️ ${h1Matches.length} H1(s) removido(s)`, 'warn');
      newHtml = newHtml.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '').trim();
    }

    // VALIDAÇÃO: Verificar se todos os H2s principais estão presentes
    const h2Count = (newHtml.match(/<h2[^>]*>/gi) || []).length;
    if (h2Count < pending.briefing.h2s.length * 0.8) {
      log(`\n❌ ERRO: Faltam H2s principais no artigo editado`, 'error');
      log(`   Esperado: ${pending.briefing.h2s.length} H2s`, 'error');
      log(`   Encontrado: ${h2Count} H2s`, 'error');

      await sendTelegram(`❌ <b>Erro na Edição</b>\n\nO artigo editado está faltando seções (H2s).\n\nEsperado: ${pending.briefing.h2s.length} H2s\nEncontrado: ${h2Count} H2s\n\nTente novamente ou revise a instrução de edição.`);
      return;
    }

    // VALIDAÇÃO: Verificar se o link da pillar está presente
    if (!newHtml.includes(`href="${pending.metadata.pillarUrl}"`)) {
      log(`\n❌ ERRO: Link para pillar foi removido na edição`, 'error');
      log(`   URL esperada: ${pending.metadata.pillarUrl}`, 'error');

      await sendTelegram(`❌ <b>Erro na Edição</b>\n\nO link para a pillar page foi removido na edição.\n\nEsso não é permitido. Tente novamente.`);
      return;
    }

    // Validar e remover travessões
    const emdashCount = (newHtml.match(/—/g) || []).length;
    if (emdashCount > 0) {
      log(`⚠️ ${emdashCount} travessão(ões) removido(s)`, 'warn');
      newHtml = newHtml.replace(/\s*—\s*/g, ', ');
    }

    log(`\n✅ Validações de integridade passaram:`, 'success');
    log(`   - Tamanho do artigo: ${newHtml.length} chars (mín: ${minSize})`, 'info');
    log(`   - H2s presentes: ${h2Count} (esperado: ${pending.briefing.h2s.length})`, 'info');
    log(`   - Link da pillar: presente`, 'info');

    // 2. ATUALIZAR ARQUIVO DE PREVIEW
    const urlPath = pending.metadata.url.replace(/\/$/, '');
    const slug = urlPath.substring(1);
    const blogDir = path.join(CONFIG.PROJECT_ROOT, 'src/content/blog');
    const filePath = path.join(blogDir, `${slug}.md`);

    const faqItems = extractFaqFromHtml(newHtml);
    let cleanHtml = newHtml;

    if (faqItems.length > 0) {
      for (const item of faqItems) {
        const escapedQuestion = item.question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedAnswer = item.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const detailsRegex = new RegExp(`<details[^>]*>\\s*<summary[^>]*>${escapedQuestion}<\\/summary>\\s*<p[^>]*>${escapedAnswer}<\\/p>\\s*<\\/details>`, 'i');
        cleanHtml = cleanHtml.replace(detailsRegex, '');
      }
      cleanHtml = cleanHtml.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    }

    const frontmatter = generateFrontmatter({
      title: pending.briefing.title,
      slug: slug,
      description: newDescription,
      keyword: pending.metadata.keyword || pending.briefing.title,
      faq: faqItems
    });

    fs.writeFileSync(filePath, frontmatter + cleanHtml);
    log(`✅ Preview atualizado: ${filePath}`, 'success');

    // 3. ATUALIZAR ESTADO
    pending.htmlContent = newHtml;
    pending.description = newDescription;
    pending.timestamp = new Date().toISOString();
    state.pendingApprovals[articleKey] = pending;
    delete state.editingState;
    saveState(state);

    // 4. ENVIAR NOVO PREVIEW PARA TELEGRAM
    const previewUrl = state.previewServers?.ngrokUrl
      ? `${state.previewServers.ngrokUrl}/blog${pending.metadata.url}/`.replace(/([^:]\/)\/+/g, '$1')
      : `http://localhost:${CONFIG.LOCALHOST_PORT}/blog${pending.metadata.url}/`.replace(/([^:]\/)\/+/g, '$1');

    const visualElements = detectVisualElements(newHtml);
    const updatedMessage = `
<b>✏️ Artigo Editado</b>

<b>Artigo:</b> ${pending.briefing.title}
<b>Edição:</b> ${editInstruction}

🌐 <b>Preview Atualizado:</b> ${previewUrl}

<b>Estrutura H2s:</b>
${pending.briefing.h2s.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Aprova a edição ou quer mais ajustes?
`;

    await sendTelegramWithButtons(updatedMessage, articleKey);
    log(`\n✅ Edição concluída e preview enviado para Telegram`, 'success');

  } catch (e) {
    log(`❌ Erro ao editar artigo: ${e.message}`, 'error');
    await sendTelegram(`❌ <b>Erro na Edição</b>\n\n${pending.briefing.title}\n\n${e.message}`);
  }
}

// ============================================================================
// EXECUÇÃO
// ============================================================================

if (process.argv[2] === '--webhook') {
  const callbackData = process.argv[3];
  handleApproval(callbackData);
} else if (process.argv[2] === '--edit-instruction') {
  const articleKey = process.argv[3];
  const editInstruction = process.argv[4];
  if (!articleKey || !editInstruction) {
    console.error('❌ Uso: node cluster-daily-architect.js --edit-instruction <articleKey> "<instrução>"');
    process.exit(1);
  }
  handleEditInstruction(articleKey, editInstruction).catch(e => {
    log(`❌ Erro não tratado na edição: ${e.message}`, 'error');
    process.exit(1);
  });
} else {
  main().catch(e => {
    log(`❌ Erro não tratado: ${e.message}`, 'error');
    process.exit(1);
  });
}
