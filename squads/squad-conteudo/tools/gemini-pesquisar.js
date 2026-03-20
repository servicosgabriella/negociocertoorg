/**
 * gemini-pesquisar.js
 * Pesquisa e valida H2s via Gemini API, substituindo @pesquisador-seo.
 *
 * Uso:
 *   node gemini-pesquisar.js --keyword "maquininha para MEI" --intencao comercial
 *
 * Saída: formato padrão de pesquisar-pauta.md → stdout
 * Erros: stderr
 * Exit code 1 → fallback para Claude nativo (@pesquisador-seo)
 */

import { callGemini } from './gemini-client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
};

const keyword = getArg('--keyword');
const intencao = getArg('--intencao');

if (!keyword || !intencao) {
  console.error('Uso: node gemini-pesquisar.js --keyword "..." --intencao [informacional|comercial|transacional|navegacional]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Carregar config do squad
// ---------------------------------------------------------------------------
const squadRoot = path.join(__dirname, '..');

function readConfig(relPath) {
  const fullPath = path.join(squadRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[gemini-pesquisar] Aviso: arquivo não encontrado: ${fullPath}`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

const checklistResearch = readConfig('checklists/checklist-research.md');
const slugRules = readConfig('config/slug-rules.md');

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `Você é um especialista em SEO brasileiro com profundo conhecimento do comportamento de busca de MEIs, empreendedores e microempreendedores no Google Brasil.

Sua tarefa é simular o trabalho de um pesquisador SEO: identificar quais H2s realmente aparecem no Google (PAA, buscas relacionadas, autocomplete, estrutura dos top 3 resultados orgânicos) para a keyword fornecida.

Você tem conhecimento treinado sobre padrões de busca no Brasil e sabe quais perguntas os empreendedores realmente fazem. Use esse conhecimento para gerar H2s que REALMENTE apareceriam no Google — não invente perguntas genéricas.

CHECKLIST DE ENTREGA OBRIGATÓRIO:
${checklistResearch}

REGRAS DE SLUG:
${slugRules}

H2s GENÉRICOS PROIBIDOS (nunca inclua):
- "O que é [tema]"
- "Benefícios de [tema]"
- "Como funciona [tema]"
- "Vantagens e desvantagens"
- "Dicas para [tema]"
- "Conclusão"
- Qualquer H2 que não responda uma pergunta específica e real

REGRA DE OURO: Antes de incluir qualquer H2, pergunte: "Essa pergunta aparece no Google quando alguém busca o tema?" Se NÃO → H2 vetado.

DISTRIBUIÇÃO DE VARIANTES: Para artigos de review ou intenção transacional/comercial, cada variante semântica relevante deve estar atribuída a pelo menos um H2 ou ao corpo de uma seção específica.

Entregue EXATAMENTE no formato especificado abaixo, sem texto adicional antes ou depois.`;

const USER_PROMPT = `Keyword principal: ${keyword}
Intenção de busca: ${intencao}

Entregue a pesquisa no seguinte formato EXATO (preserve os separadores e labels):

---
PESQUISA — ${keyword}

Keyword confirmada: [keyword confirmada ou ajustada se necessário]
Intenção: ${intencao}

H2s Validados:
1. [H2 transformado em título de seção — tom do artigo] — Fonte: PAA
2. [H2] — Fonte: PAA
3. [H2] — Fonte: buscas relacionadas
4. [H2] — Fonte: autocomplete
5. [H2] — Fonte: gap concorrente
[continue até cobrir toda a intenção de busca — entre 5 e 10 H2s]

Gaps identificados nos concorrentes:
- [Pergunta ou tema que os top 2 resultados orgânicos não respondem bem]
- [Segundo gap se identificado]

Mapa de Variantes → H2:
- "[variante principal]" → H1 + H2-N (descreva qual H2)
- "[variante 2]" → H2-N (descreva qual H2)
- "[variante 3]" → H2-N ou corpo da seção X
[liste TODAS as variantes semânticas relevantes]
---`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  try {
    console.error(`[gemini-pesquisar] Iniciando pesquisa: "${keyword}" (${intencao})`);

    const result = await callGemini(SYSTEM_PROMPT, USER_PROMPT, {
      temperature: 0.5,
      maxOutputTokens: 4096,
    });

    process.stdout.write(result + '\n');
    console.error('[gemini-pesquisar] Concluído com sucesso.');

  } catch (error) {
    console.error(`[gemini-pesquisar] ERRO: ${error.message}`);
    console.error('[gemini-pesquisar] FALLBACK NECESSÁRIO: execute *pesquisar-pauta com @pesquisador-seo (Claude nativo).');
    process.exit(1);
  }
})();
