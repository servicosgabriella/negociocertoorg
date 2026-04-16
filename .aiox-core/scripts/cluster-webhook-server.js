const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.CLUSTER_TELEGRAM_TOKEN;
const PROJECT_ROOT = '/root/negociocertoorg';

if (!TOKEN) {
  console.error('❌ CLUSTER_TELEGRAM_TOKEN não configurado');
  process.exit(1);
}

let offset = 0;

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

async function poll() {
  while (true) {
    try {
      const res = await telegramRequest('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['callback_query']
      });

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          offset = update.update_id + 1;
          if (update.callback_query) {
            await processCallback(update.callback_query);
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
