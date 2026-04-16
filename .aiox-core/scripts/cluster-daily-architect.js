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
const { exec } = require('child_process');
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

    if (!data.organic || data.organic.length === 0) {
      log(`⚠️ Nenhum resultado SERP encontrado para: ${keyword}`, 'warn');
      return [];
    }

    const top3 = data.organic.slice(0, 3).map(r => ({
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
    const origin = `https://${CONFIG.GITHUB_USER}:${CONFIG.GITHUB_TOKEN}@github.com/${CONFIG.GITHUB_USER}/negociocerto.org.git`;
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

    // 4. Buscar SERP com ValueSERP
    const serpResults = await searchSERP(targetArticle.title);
    if (serpResults.length === 0) {
      log(`⚠️ Nenhum resultado SERP obtido, continuando com estrutura base...`, 'warn');
    }

    // 5. Nota: Aqui você chamaria @arquiteto-cluster, @copywriter-cluster, etc.
    // Por enquanto, simulamos o resultado
    const briefing = {
      title: targetArticle.title,
      url: targetArticle.url,
      serpResults,
      h2s: [
        `H2 1: [Título em cauda longa sobre ${targetArticle.title}]`,
        `H2 2: [Subtópico relevante]`,
        `H2 3: [Contexto para linkar: ${targetArticle.pillarUrl}]`,
        `H2 4: [Aprofundamento]`,
        `H2 5: [Conclusão ou dica prática]`,
      ],
      linkContext: targetArticle.pillarUrl,
      anchorText: 'veja nosso guia completo',
    };

    // 6. Simular artigo gerado
    const article = `
<h2>${briefing.title}</h2>
<p>Conteúdo do artigo aqui...</p>
<table>
  <thead><tr><th>Coluna 1</th><th>Coluna 2</th></tr></thead>
  <tbody><tr><td>Dado 1</td><td>Dado 2</td></tr></tbody>
</table>
<p>Se você quer aprofundar, <a href="${targetArticle.pillarUrl}">${briefing.anchorText}</a>.</p>
`;

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
H2 3 → Pillar (texto âncora: "${briefing.anchorText}")

<b>Elementos Visuais:</b>
${visualElements.hasTable ? '📊 Tabelas detectadas' : 'Sem tabelas'}

Aprova para publicar ou quer fazer ajustes?
`;

    await sendTelegramWithButtons(previewMessage, targetArticle.url);

    // 10. Salvar como pendente de aprovação
    state.pendingApprovals[targetArticle.url] = {
      article: targetArticle,
      briefing,
      article: article,
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
    log(`✅ Aprovado: ${pending.article.title}`, 'success');
    await sendTelegram(`✅ <b>Artigo Aprovado!</b>\n\n📝 ${pending.article.title}\n\nPublicando...`);

    try {
      // 1. Criar arquivo .astro
      const pageFile = path.join(CONFIG.PROJECT_ROOT, `src/pages${pending.article.url}.astro`);
      const dir = path.dirname(pageFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(pageFile, pending.article);

      // 2. Git commit e push
      const commitMsg = `feat: publica artigo cluster '${pending.article.title}' + atualiza anchor-master`;
      const success = await gitCommitAndPush(commitMsg, [
        `src/pages${pending.article.url}.astro`,
        CONFIG.ANCHOR_MASTER,
      ]);

      if (success) {
        // 3. Remover de cluster-master
        removeArticleFromClusterMaster(pending.article.title);

        // 4. Commit final
        await gitCommitAndPush(`docs: remove artigo publicado de cluster-master`, [CONFIG.CLUSTER_MASTER]);

        // 5. Marcar como processado
        state.processedArticles.push(articleKey);
        delete state.pendingApprovals[articleKey];
        saveState(state);

        await sendTelegram(
          `✅ <b>Publicado com Sucesso!</b>\n\n📄 ${pending.article.title}\n🔗 ${pending.article.url}\n\nPróximo artigo em 24h.`
        );
      } else {
        throw new Error('Falha no git push');
      }
    } catch (e) {
      log(`❌ Erro ao publicar: ${e.message}`, 'error');
      await sendTelegram(`❌ <b>Erro na Publicação</b>\n\n${e.message}`);
    }

  } else if (action === 'reject') {
    log(`❌ Rejeitado: ${pending.article.title}`, 'warn');
    await sendTelegram(`❌ <b>Artigo Rejeitado</b>\n\n${pending.article.title}\n\nAguardando próximo ciclo...`);
    delete state.pendingApprovals[articleKey];
    saveState(state);

  } else if (action === 'preview') {
    log(`👁️ Preview solicitado: ${pending.article.title}`, 'info');
    await sendTelegram(
      `👀 <b>Preview</b>\n\n${pending.article.title}\n\nURL: http://localhost:${CONFIG.LOCALHOST_PORT}${pending.article.url}/\n\nVolte ao menu anterior para aprovação.`
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
