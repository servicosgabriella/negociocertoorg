/**
 * gemini-client.js
 * Cliente base para Gemini API — sem dependências externas (Node 18+ nativo)
 *
 * Lê GEMINI_API_KEY do .env sobe a árvore de diretórios automaticamente.
 * Retry com backoff exponencial (padrão: 3 tentativas).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// .env loader manual (sem dotenv)
// ---------------------------------------------------------------------------
function loadEnv() {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

// ---------------------------------------------------------------------------
// callGemini — função principal
// ---------------------------------------------------------------------------
async function callGemini(systemPrompt, userPrompt, options = {}) {
  loadEnv();

  const {
    maxRetries = 3,
    temperature = 0.7,
    maxOutputTokens = 8192,
  } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY não encontrada. Adicione ao .env: GEMINI_API_KEY=sua-chave'
    );
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      { role: 'user', parts: [{ text: userPrompt }] },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        const reason = data?.candidates?.[0]?.finishReason || 'unknown';
        throw new Error(`Resposta vazia do Gemini (finishReason: ${reason})`);
      }

      return text;

    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.error(
        `[gemini-client] tentativa ${attempt}/${maxRetries} falhou: ${error.message}` +
        ` — aguardando ${delay / 1000}s antes de tentar novamente...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export { callGemini };
