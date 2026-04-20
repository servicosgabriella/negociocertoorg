const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.CLUSTER_TELEGRAM_TOKEN;
const PROJECT_ROOT = '/root/negociocertoorg';
const STATE_FILE = path.join(PROJECT_ROOT, '.aiox/cluster-architect-state.json');

if (!TOKEN) {
  console.error('❌ CLUSTER_TELEGRAM_TOKEN não configurado');
  process.exit(1);
}

let offset = 0;

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { pendingApprovals: {}, editingState: null };
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function telegramRequest(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(params);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function processCallback(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  log(`📥 Callback recebido: ${data}`);

  try {
    // Confirma o clique no botão
    await telegramRequest('answerCallbackQuery', {
      callback_query_id: callbackQuery.id
    });

    // Chama o handler do cluster-daily-architect
    const result = execSync(
      `cd ${PROJECT_ROOT} && export $(grep -v '^#' .env | xargs) && node .aiox-core/scripts/cluster-daily-architect.js --webhook "${data}"`,
      { encoding: 'utf8', timeout: 60000 }
    );

    log(`✅ Handler executado: ${result.trim()}`);

  } catch (e) {
    log(`❌ Erro: ${e.message}`);
    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: `❌ Erro ao processar: ${e.message}`
    });
  }
}

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;

  log(`📨 Mensagem recebida: "${text}"`);

  try {
    const state = loadState();

    // Verificar se estamos em modo de edição
    if (state.editingState) {
      const { articleKey } = state.editingState;
      log(`✏️ Modo edição ativo para artigo: ${articleKey}`);

      // Chamar handler de edição com a instrução
      const result = execSync(
        `cd ${PROJECT_ROOT} && export $(grep -v '^#' .env | xargs) && node .aiox-core/scripts/cluster-daily-architect.js --edit-instruction "${articleKey}" "${text.replace(/"/g, '\\"')}"`,
        { encoding: 'utf8', timeout: 600000 }
      );

      log(`✅ Edição processada`);
    } else {
      log(`⚠️ Nenhuma edição em progresso`);
      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: `⚠️ Nenhuma edição em progresso.\n\nClique em "Editar" numa mensagem de preview para ativar o modo de edição.`
      });
    }
  } catch (e) {
    log(`❌ Erro ao processar mensagem: ${e.message}`);
    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: `❌ Erro ao processar edição: ${e.message.substring(0, 100)}`
    });
  }
}

async function poll() {
  while (true) {
    try {
      const res = await telegramRequest('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['callback_query', 'message']
      });

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          offset = update.update_id + 1;
          if (update.callback_query) {
            await processCallback(update.callback_query);
          } else if (update.message && update.message.text) {
            await processMessage(update.message);
          }
        }
      }
    } catch (e) {
      log(`⚠️ Erro no polling: ${e.message}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

log('🚀 Cluster Webhook Server iniciado');
poll();
