# Comando: Novo Artigo

## Como usar
```
/novo-artigo
```

## O que este comando faz
Orquestra o processo completo de criação de um artigo — desde a definição do tipo até a publicação. Faz as perguntas certas antes de começar a escrever.

## Fluxo

### PASSO 1 — Coletar briefing
Perguntar ao usuário:

1. **Keyword principal** — qual é a palavra-chave alvo?
2. **Tipo de conteúdo:**
   - `blog` → post informacional no blog
   - `seo` → artigo de categoria (ContentLayout)
   - `review` → review de produto único
   - `comparativo` → comparativo de múltiplos produtos
3. **Produtos envolvidos** (se review/comparativo) — quais produtos comparar?
4. **Link de afiliado disponível?** — sim/não/qual

### PASSO 2 — Confirmar tipo de publicação
Perguntar:
- Review ou comparativo → **sempre abrir PR** (não publicar direto)
- Artigo SEO → **sempre abrir PR** (não publicar direto)
- Blog post → **sempre abrir PR** (não publicar direto)

*(No início, tudo vai para PR. Quando o usuário quiser mudar para automático, editar este arquivo.)*

### PASSO 3 — Delegar ao agente correto
- `blog` → ativar instruções de `agents/redator-blog.md`
- `seo` → ativar instruções de `agents/redator-seo.md`
- `review` ou `comparativo` → ativar instruções de `agents/redator-review.md`

### PASSO 4 — Executar o processo do agente
Seguir todas as fases do agente selecionado:
1. Pesquisa SERP + produto (web search)
2. Estrutura
3. Escrita
4. Criação do arquivo
5. Ações pós-criação

### PASSO 5 — Relatório final
Entregar ao usuário:
```
✅ Artigo criado: [nome do arquivo]
📍 URL: https://negociocerto.org/[slug]/
📝 Meta title: [título sugerido]
📝 Meta description: [descrição sugerida]
🔗 Links internos adicionados: [lista]
📂 Arquivos atualizados: Header.astro, estrutura.ts
⚠️  Pendências: [se houver — ex: imagem de capa, link de afiliado]
```

## Regras Globais (para todos os tipos)
- Sempre pesquisar na internet antes de escrever
- Sempre verificar SERP antes de definir estrutura
- Sempre adicionar linkagem interna
- Nunca publicar direto — sempre criar os arquivos para o usuário revisar
- Nunca adicionar `<style>` ou `<script>` nos artigos
- Sempre usar o autor padrão: Gabriella Fernandes