/**
 * gemini-redigir.js
 * Redige artigo SEO via Gemini API, seguindo todas as diretrizes do squad-conteudo.
 *
 * Uso:
 *   node gemini-redigir.js --briefing /tmp/briefing-slug.md
 *
 * Saída: artigo completo em Markdown → stdout
 * Erros: stderr
 * Exit code 1 → fallback para Claude nativo (@copywriter-seo)
 *
 * IMPORTANTE: A saída deste script DEVE ser revisada pelo Claude antes de
 * ser enviada ao @qa-conteudo. Ver task: tasks/gemini-redigir.md (Passo 3).
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

const briefingFile = getArg('--briefing');

if (!briefingFile) {
  console.error('Uso: node gemini-redigir.js --briefing /caminho/para/briefing.md');
  process.exit(1);
}

if (!fs.existsSync(briefingFile)) {
  console.error(`[gemini-redigir] Arquivo de briefing não encontrado: ${briefingFile}`);
  process.exit(1);
}

const briefing = fs.readFileSync(briefingFile, 'utf-8');

// ---------------------------------------------------------------------------
// Carregar config do squad — injeção completa no system prompt
// ---------------------------------------------------------------------------
const squadRoot = path.join(__dirname, '..');

function readConfig(relPath) {
  const fullPath = path.join(squadRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[gemini-redigir] Aviso: arquivo não encontrado: ${fullPath}`);
    return `[arquivo ${relPath} não encontrado]`;
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

const styleGuide = readConfig('config/style-guide.md');
const blacklist = readConfig('config/blacklist.md');
const slugRules = readConfig('config/slug-rules.md');
const articleTemplate = readConfig('templates/artigo-template.md');

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `Você é um redator SEO brasileiro sênior especializado em conteúdo para MEIs, empreendedores e microempreendedores. Você escreve como alguém que testou e viveu o que descreve — autoridade prática, não teoria acadêmica.

════════════════════════════════════════════
GUIA DE ESTILO — SIGA COM RIGOR ABSOLUTO
════════════════════════════════════════════
${styleGuide}

════════════════════════════════════════════
LISTA NEGRA — PROIBIÇÃO COM TOLERÂNCIA ZERO
════════════════════════════════════════════
${blacklist}

Se qualquer palavra ou conectivo da Lista Negra aparecer no seu texto, o artigo será vetado imediatamente. Não use NENHUM item dessa lista em hipótese alguma.

════════════════════════════════════════════
REGRAS DE SLUG
════════════════════════════════════════════
${slugRules}

════════════════════════════════════════════
TEMPLATE DO ARTIGO — ESTRUTURA BASE
════════════════════════════════════════════
${articleTemplate}

════════════════════════════════════════════
INSTRUÇÕES CRÍTICAS ADICIONAIS
════════════════════════════════════════════
1. NUNCA use travessão (—) no meio de frases. Use parênteses, vírgula ou ponto.
2. Escreva SEMPRE em português brasileiro informal mas técnico.
3. Tom: 80% técnico, 20% personalidade — como um consultor experiente que explica de forma direta.
4. Use "você" com frequência — o leitor é sempre tratado de forma direta.
5. Siga EXATAMENTE o briefing: H2s na ordem indicada, layout especificado, tamanho alvo, estrutura de introdução.
6. Inclua FAQ ao final se o artigo tiver 7 ou mais H2s, ou se for review.
7. Conclusão com próximo passo concreto — NUNCA "Esperamos ter ajudado!", "Agora você sabe tudo", ou "Em conclusão".
8. Cada H2 deve ser desenvolvido com: abertura direta (não repita o H2), dado concreto ou exemplo, ritmo variado.
9. Ritmo obrigatório: bloco médio (2-3 linhas) → frase de impacto (1 linha) → bloco médio → impacto. PROIBIDO o efeito escada (3+ parágrafos de 1 linha seguidos).
10. Entregue APENAS o conteúdo do artigo em Markdown, com frontmatter correto — sem explicações adicionais.`;

const USER_PROMPT = `Redija o artigo SEO completo baseado no briefing abaixo.

BRIEFING:
${briefing}

ENTREGA ESPERADA:
1. Frontmatter correto para o layout especificado no briefing (todos os campos preenchidos)
2. Slug validado no campo correto do frontmatter (sem números, anos, datas — 3 a 5 palavras)
3. H1 com keyword + promessa clara
4. Introdução na estrutura especificada no briefing (ponte | cpp | pdp)
5. Keyword principal nos primeiros 100 palavras de forma natural
6. Todos os H2s do briefing desenvolvidos na ordem indicada
7. Distribuição correta das variantes semânticas (cada variante em seu H2 designado)
8. Ritmo variado — sem efeito escada
9. FAQ ao final (se aplicável conforme regras)
10. Conclusão com próximo passo concreto

Entregue APENAS o Markdown do artigo, começando diretamente pelo frontmatter (---).`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  try {
    console.error(`[gemini-redigir] Iniciando redação a partir de: ${briefingFile}`);

    const result = await callGemini(SYSTEM_PROMPT, USER_PROMPT, {
      temperature: 0.75,
      maxOutputTokens: 16384,
    });

    process.stdout.write(result + '\n');
    console.error('[gemini-redigir] Artigo gerado com sucesso.');
    console.error('[gemini-redigir] PRÓXIMO PASSO OBRIGATÓRIO: Claude deve revisar o artigo antes de enviar ao @qa-conteudo.');

  } catch (error) {
    console.error(`[gemini-redigir] ERRO: ${error.message}`);
    console.error('[gemini-redigir] FALLBACK NECESSÁRIO: execute *redigir-artigo com @copywriter-seo (Claude nativo).');
    process.exit(1);
  }
})();
