# Comando: Gerar Imagem

## Como usar
```
/gerar-imagem [slug-do-artigo]
```

Exemplo:
```
/gerar-imagem como-abrir-cnpj
```

## REGRA CRÍTICA
Este comando só funciona para artigos com **BlogLayout** ou **ContentLayout**.
**NUNCA** gerar imagem para artigos com **ReviewLayout**.

Se o artigo usar ReviewLayout → responder:
"Este artigo usa ReviewLayout. Geração de imagem não é aplicável para reviews e comparativos."

## Processo (execute nesta ordem)

### PASSO 1 — Identificar o artigo
- Se for BlogLayout: ler `src/content/blog/[slug].md`
- Se for ContentLayout: ler `src/pages/[slug].astro`
- Extrair: `title`, `category` (para definir cores do fundo)
- Confirmar que NÃO é ReviewLayout antes de continuar

### PASSO 2 — Definir cores do fundo baseado na categoria
```
Finanças    → deep blue, teal, dark navy
Gestão      → deep green, olive, dark teal  
RH          → deep purple, indigo, slate blue
Planejamento → deep orange, amber, dark brown
Blog (geral) → escolher baseado no tema do artigo
```

### PASSO 3 — Identificar elementos temáticos
Analisar o título do artigo e definir 2 objetos temáticos relevantes.

Exemplos:
- "Como abrir CNPJ" → certificado CNPJ + carimbo oficial
- "Contabilidade online" → laptop com planilha + calculadora
- "Maquininha de cartão" → maquininha POS + cartão de crédito
- "Gestão de equipe" → pessoas em reunião + gráfico de metas
- "Fluxo de caixa" → notas de real + planilha financeira
- "MEI" → carteira de MEI + smartphone

Nunca repetir os mesmos elementos — sempre relacionar com o tema específico.

### PASSO 4 — Montar o prompt
```
Create an editorial blog cover image in collage style with these exact characteristics:

- Background: geometric color blocks ([CORES_DA_CATEGORIA]) with halftone dot texture overlay
- Center: a black and white halftone photo of [CENA_PRINCIPAL_RELACIONADA_AO_TEMA], cut out with a thick white border/outline
- Supporting elements: [ELEMENTO_TEMÁTICO_1] and [ELEMENTO_TEMÁTICO_2], also in black and white with white cutout borders, placed around the central figure
- Torn paper edges on left and right sides of the image
- No text anywhere in the image
- Aspect ratio: 16:9 landscape
- Style reference: Brazilian editorial magazine collage, bold graphic design
```

### PASSO 5 — Chamar a API do Imagen 3
```javascript
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GOOGLE_API_KEY
    },
    body: JSON.stringify({
      instances: [{ prompt: PROMPT_MONTADO }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/webp'
      }
    })
  }
);
```

### PASSO 6 — Salvar a imagem
- Salvar em `public/images/[slug].webp`
- Formato: `.webp`
- Se o arquivo já existir, perguntar antes de sobrescrever

### PASSO 7 — Atualizar o artigo
**Se BlogLayout (`.md`):** atualizar frontmatter:
```yaml
coverImage: "/images/[slug].webp"
coverAlt: "[descrição da cena gerada, sem citar marca d'água ou IA]"
```

**Se ContentLayout (`.astro`):** atualizar props:
```astro
coverImage="/images/[slug].webp"
coverAlt="[descrição da cena gerada]"
```

### PASSO 8 — Confirmar entrega
```
✅ Imagem gerada: public/images/[slug].webp
✅ Artigo atualizado: [caminho do arquivo]
🎨 Prompt usado: [prompt completo]
📐 Elementos temáticos: [elemento 1] + [elemento 2]
```

## Erros comuns

**API key inválida:**
Verificar se `GOOGLE_API_KEY` está nos Secrets do Codespace.

**Artigo não encontrado:**
Confirmar se o slug está correto — verificar em `src/content/blog/` e `src/pages/`.

**ReviewLayout detectado:**
Não gerar imagem. Informar o usuário.