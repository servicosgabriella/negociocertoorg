/**
 * gerar-imagem.js
 * Gera imagem de capa para artigos usando Google Gemini Image Generation.
 *
 * Uso:
 *   npm run gerar-imagem -- --slug "como-abrir-um-mei" --topico "empreendedor abrindo empresa no computador"
 *
 * Flags:
 *   --slug     Nome do arquivo de saída (sem extensão). Obrigatório.
 *   --topico   Descrição visual do elemento central da imagem. Obrigatório.
 *   --saida    Pasta de saída (padrão: public/images)
 *   --format   Proporção da imagem (padrão: 16:9). OBRIGATÓRIO para blog.
 *
 * ⚠️ IMPORTANTE: Todas as imagens de blog DEVEM ser 16:9. Validação automática ativa.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Parse de argumentos
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] ?? null : null;
};

const slug   = getArg('slug');
const topico = getArg('topico');
const saida  = getArg('saida') ?? path.join(__dirname, '..', 'public', 'images');
const format = getArg('format') ?? '16:9';

if (!slug || !topico) {
  console.error(`
Uso: npm run gerar-imagem -- --slug "como-abrir-um-mei" --topico "empreendedor abrindo empresa no computador"

  --slug    Nome do arquivo de saída, ex: como-abrir-um-mei (gera como-abrir-um-mei.png)
  --topico  Descrição visual do elemento central, ex: "lojista usando maquininha de cartão"
  --saida   Pasta de saída (opcional, padrão: public/images)
  --format  Proporção da imagem (opcional, padrão: 16:9). OBRIGATÓRIO para blog.
`);
  process.exit(1);
}

// Validar formato
const formatosValidos = ['16:9', '1:1', '4:3'];
if (!formatosValidos.includes(format)) {
  console.error(`❌ Erro: Formato "${format}" inválido. Use um dos: ${formatosValidos.join(', ')}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Validação de aspecto de imagem PNG
// Extrai width e height do header PNG para validar proporção
// ---------------------------------------------------------------------------
function validarAspectoPNG(buffer, formatEsperado) {
  // PNG signature: 89 50 4E 47 (magic number)
  if (buffer.length < 24 || buffer[0] !== 0x89 || buffer[1] !== 0x50) {
    throw new Error('Buffer inválido: não é um PNG válido');
  }

  // Posição 16-20: width (big-endian)
  // Posição 20-24: height (big-endian)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  if (width === 0 || height === 0) {
    throw new Error('Dimensões PNG inválidas');
  }

  const aspectoReal = (width / height).toFixed(4);
  const aspectoEsperado = formatEsperado === '16:9' ? (16/9).toFixed(4) :
                          formatEsperado === '1:1' ? '1.0000' :
                          formatEsperado === '4:3' ? (4/3).toFixed(4) : null;

  // Tolerância: 3% (para variações mínimas do modelo com image_config)
  const tolerancia = 0.03;
  const diferenca = Math.abs(parseFloat(aspectoReal) - parseFloat(aspectoEsperado));

  if (diferenca > tolerancia) {
    throw new Error(
      `❌ ERRO: Imagem gerada com aspecto ${width}x${height} (${aspectoReal}), ` +
      `esperado ${formatEsperado} (${aspectoEsperado}). ` +
      `Diferença: ${(diferenca * 100).toFixed(2)}% (máx permitido: 3%).`
    );
  }

  console.log(`✓ Aspecto validado: ${width}x${height} (${formatEsperado})`);
}

// ---------------------------------------------------------------------------
// Sistema de Variações Visuais
// Mantém identidade editorial mas varia paletas e composição
// ---------------------------------------------------------------------------
const visualVariations = [
  {
    id: 1,
    colors: ['deep blue', 'teal', 'dark navy'],
    layout: 'center-dominant',
    description: 'Centro dominante, blocos azul/teal'
  },
  {
    id: 2,
    colors: ['forest green', 'golden yellow', 'olive'],
    layout: 'diagonal-left',
    description: 'Diagonal esquerda, verde/amarelo'
  },
  {
    id: 3,
    colors: ['deep purple', 'burnt orange', 'magenta'],
    layout: 'asymmetric-right',
    description: 'Lado direito assimétrico, roxo/laranja'
  },
  {
    id: 4,
    colors: ['rose pink', 'sky blue', 'soft coral'],
    layout: 'dynamic-scattered',
    description: 'Dispersão dinâmica, rosa/azul'
  }
];

function selectRandomVariation() {
  return visualVariations[Math.floor(Math.random() * visualVariations.length)];
}

// ---------------------------------------------------------------------------
// Construção do prompt com variações
// O estilo editorial é fixo. Paletas e layout variam por artigo.
// ---------------------------------------------------------------------------
function buildPrompt(topico, formato) {
  const dimensionMap = {
    '16:9': '1920x1080 pixels',
    '1:1': '1024x1024 pixels',
    '4:3': '1280x960 pixels'
  };
  const pixelDimensions = dimensionMap[formato];

  const variation = selectRandomVariation();
  const colorDescription = variation.colors.join(', ');
  const layoutInstructions = getLayoutInstructions(variation.layout);

  console.log(`🎨 Variação selecionada: ${variation.description}`);

  return `⚠️ CRITICAL INSTRUCTION: Generate image in LANDSCAPE format, ${formato} aspect ratio (${pixelDimensions}).

LANDSCAPE FORMAT REQUIREMENTS:
- Image MUST be MUCH WIDER than it is TALL
- ${formato} = wide horizontal layout, NOT square, NOT vertical
- Think of a widescreen movie/blog banner format
- This is for a blog header - needs to be wide landscape

Create an editorial blog cover image in collage style:

VISUAL DIRECTION:
- Color palette: geometric color blocks using ${colorDescription} with halftone dot texture overlay
- ${layoutInstructions}

COMPOSITION:
- Center element: black and white halftone photo of ${topico}, Brazilian context, cut with thick white border
- Supporting elements: relevant Brazilian business documents and objects related to the topic, black and white with white borders
- Torn paper edges on left and right sides for collage effect
- No text, no numbers, no letters anywhere
- CRITICAL: Image format is LANDSCAPE ${formato} - wide horizontal, widescreen style, for blog header
- High resolution, professional editorial magazine collage style
- Style: Bold graphic design, Brazilian editorial aesthetic

Remember: This must be LANDSCAPE (${formato}), much wider than tall, suitable for blog headers.`;
}

function getLayoutInstructions(layout) {
  const instructions = {
    'center-dominant': 'Place the main figure prominently in the center with supporting elements arranged symmetrically around it',
    'diagonal-left': 'Arrange the main figure diagonally from upper-left to lower-right, with documents and objects following this diagonal flow',
    'asymmetric-right': 'Position the main figure on the right side with supporting elements clustered on the left, creating visual tension',
    'dynamic-scattered': 'Distribute supporting documents dynamically across the composition, with the main figure as an anchor point'
  };
  return instructions[layout] || instructions['center-dominant'];
}

// ---------------------------------------------------------------------------
// Geração da imagem
// ---------------------------------------------------------------------------
async function gerarImagem() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('Erro: GOOGLE_API_KEY não encontrada. Verifique seu .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
  });

  const prompt = buildPrompt(topico, format);

  console.log(`\n🎨 Gerando capa...`);
  console.log(`   Slug:   ${slug}`);
  console.log(`   Tópico: ${topico}`);
  console.log(`   Formato: ${format} (OBRIGATÓRIO para blog)`);
  console.log(`\n⚙️  Processando...\n`);

  let result;
  try {
    // Mapear formato para aspect_ratio aceito pela API
    const aspectRatioMap = {
      '16:9': '16:9',
      '1:1': '1:1',
      '4:3': '4:3'
    };

    result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        image_config: {
          aspect_ratio: aspectRatioMap[format]
        }
      }
    });
  } catch (err) {
    console.error('Erro na chamada à API:', err.message);
    process.exit(1);
  }

  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'));

  if (!imagePart) {
    const textPart = parts.find((p) => p.text);
    console.error('Nenhuma imagem retornada pela API.');
    if (textPart) console.error('Resposta da API:', textPart.text);
    process.exit(1);
  }

  // Garante que a pasta de saída existe
  fs.mkdirSync(saida, { recursive: true });

  const outputPath = path.join(saida, `${slug}.png`);
  const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');

  // Validar aspecto ANTES de salvar
  try {
    validarAspectoPNG(imageBuffer, format);
  } catch (err) {
    console.error(`\n${err.message}`);
    console.error(`\n⚠️  Imagem rejeitada. Tente novamente - o modelo pode gerar proporções incorretas.`);
    process.exit(1);
  }

  fs.writeFileSync(outputPath, imageBuffer);

  console.log(`\n✅ Capa gerada e validada com sucesso!`);
  console.log(`   Arquivo: public/images/${slug}.png`);
  console.log(`   Tamanho: ${(imageBuffer.length / 1024).toFixed(1)} KB\n`);
}

gerarImagem().catch((err) => {
  console.error('Erro inesperado:', err.message);
  process.exit(1);
});
