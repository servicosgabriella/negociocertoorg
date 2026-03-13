---
task: Gerar Capa do Artigo
responsavel: "@copywriter-seo"
responsavel_type: agent
atomic_layer: task
aplicavel_quando: Artigos com bloglayout.astro ou contentlayout.astro (revisar se reviewlayout precisa de capa)
Entrada: |
  - slug: Slug validado do artigo, ex: como-abrir-um-mei (obrigatório)
  - topico_visual: Descrição visual do elemento central da imagem em português (obrigatório)
Saida: |
  - imagem: public/images/{slug}.png gerado com sucesso
  - caminho: "/images/{slug}.png" para usar no frontmatter do artigo
Checklist:
  - "[ ] Slug não contém números, anos ou datas"
  - "[ ] Tópico visual descreve claramente o elemento central (pessoa + ação + contexto)"
  - "[ ] Comando executado: npm run gerar-imagem -- --slug ... --topico ..."
  - "[ ] Arquivo PNG gerado em public/images/"
  - "[ ] Caminho /images/{slug}.png adicionado ao frontmatter do artigo"
---

# *gerar-capa

Gera a imagem de capa do artigo usando Google Gemini Image Generation com estilo editorial brasileiro de colagem.

## Requisito

`GOOGLE_API_KEY` configurada no arquivo `.env` do projeto.
Obtenha em: https://aistudio.google.com/apikey

## Uso

```bash
npm run gerar-imagem -- --slug "como-abrir-um-mei" --topico "empreendedor brasileiro abrindo empresa no computador"
```

**ℹ️ Nota:** Cada execução gera uma variação aleatória de paleta e layout. Se não gostar do resultado, execute novamente para obter uma composição diferente.

## Parâmetros

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `--slug` | Nome do arquivo de saída (sem extensão) | `como-abrir-um-mei` |
| `--topico` | Descrição visual do elemento central | `"lojista MEI com maquininha de cartão"` |
| `--saida` | Pasta de saída (opcional) | `public/images` (padrão) |

## Como Definir o Tópico Visual

O `--topico` descreve **o que aparece no centro da imagem**. Seja específico com:
1. Quem é a pessoa (empreendedor, contador, lojista)
2. O que está fazendo (assinando contrato, usando computador, analisando documentos)
3. Contexto visual (no escritório, balcão de loja, mesa de trabalho)

### Exemplos por tipo de artigo

| Artigo | --topico |
|--------|----------|
| como abrir MEI | `"empreendedor brasileiro abrindo empresa no computador com formulário de cadastro"` |
| melhores maquininhas | `"lojista MEI usando maquininha de cartão em balcão de pequeno negócio"` |
| como fazer plano de negócios | `"empreendedor brasileiro escrevendo plano de negócios com gráficos e planilhas"` |
| registrar marca INPI | `"empreendedor assinando documentos de registro de marca com certificado"` |
| contabilidade online | `"contador analisando documentos financeiros em computador"` |
| como trocar de contabilidade | `"empresário assinando contrato de troca de serviços contábeis"` |

## Estilo Visual (mantém padrão, cores variam)

O script aplica automaticamente o estilo editorial com variações aleatórias:

**Identidade fixa** (igual em todas):
- Elemento central: foto P&B com borda branca, estilo recorte
- Elementos de suporte: documentos/objetos brasileiros relevantes ao tema, P&B com bordas brancas
- Bordas rasgadas de papel nas laterais
- Sem texto em nenhum lugar da imagem
- Proporção 16:9
- Textura de meio-tom nos blocos

**Variações de paleta + layout** (aleatória a cada geração):
1. **Centro dominante** (azul profundo + teal): figura central com elementos ao redor
2. **Diagonal esquerda** (verde floresta + amarelo): layout fluindo da esquerda para direita
3. **Lado direito assimétrico** (roxo + laranja): elemento principal no lado direito
4. **Dispersão dinâmica** (rosa + azul céu): elementos espalhados dinamicamente

Cada imagem é única em paleta e composição, mas mantém a identidade editorial brasileira.

## Após Gerar

Adicione o caminho no frontmatter do artigo:

**Para `bloglayout.astro`** (`src/content/blog/{slug}.md`):
```yaml
coverImage: "/images/{slug}.png"
```

**Para `contentlayout.astro`** (`src/pages/{slug}.astro`):
```astro
coverImage="/images/{slug}.png"
```

## Solução de Problemas

| Erro | Causa | Solução |
|------|-------|---------|
| `GOOGLE_API_KEY não encontrada` | .env sem a chave | Adicionar `GOOGLE_API_KEY=...` ao .env |
| `Nenhuma imagem retornada` | Prompt bloqueado | Ajustar o --topico para descrição mais neutra |
| `Cannot find module` | Dependência não instalada | Executar `npm install` |
