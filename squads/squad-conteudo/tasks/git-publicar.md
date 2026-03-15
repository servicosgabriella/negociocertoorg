---
task: Git Publicar Artigo
responsavel: "@copywriter-seo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - slug: Slug do artigo (obrigatório)
  - titulo: Título do artigo para a mensagem de commit (obrigatório)
  - layout: Layout usado (obrigatório)
  - data: Data de publicação (obrigatório)
Saida: |
  - commit: Commit local criado, aguardando push por @devops
Checklist:
  - "[ ] git status verificado — apenas arquivos esperados aparecem"
  - "[ ] Sem conflitos ou alterações inesperadas"
  - "[ ] git add com arquivos específicos (não git add .)"
  - "[ ] git commit criado com mensagem descritiva"
  - "[ ] Delegação para @devops realizada"
---

# *git-publicar

Finaliza a publicação criando o commit e delegando o push para `@devops`.

Task atômica — parte da sequência de publicação:
1. `gerar-capa.md` → 2. `montar-arquivo.md` → 3. **`git-publicar.md`**

## Uso

```
@copywriter-seo

*git-publicar --slug "como-abrir-um-mei" --layout bloglayout
```

## Passo 1 — Verificar Git Status

```bash
git status
```

**Deve mostrar apenas:**
- Arquivo novo/modificado: `src/content/blog/{slug}.md` ou `src/pages/{slug}.astro`
- Arquivo modificado (se layout != bloglayout): `src/pages/autor/gabriella-fernandes.astro`
- Arquivo modificado (se layout != bloglayout): `src/data/estrutura.ts`
- Arquivo novo (se criado): `public/images/{slug}.png`

**❌ BLOQUEADOR:** Se houver arquivos inesperados ou conflitos, HALT e investigar antes de prosseguir.

## Passo 2 — Git Add e Commit

Adicionar apenas os arquivos esperados:

```bash
# Para bloglayout:
git add src/content/blog/{slug}.md public/images/{slug}.png

# Para reviewlayout ou contentlayout:
git add src/pages/{slug}.astro src/pages/autor/gabriella-fernandes.astro src/data/estrutura.ts public/images/{slug}.png
```

Criar commit:

```bash
git commit -m "feat: publica artigo '{titulo}' [{slug}]"
```

**Mensagem de commit completa (quando relevante incluir corpo):**
```
feat: publica artigo '{titulo}' [{slug}]

- Layout: {layout}
- Data: {data}
- Capa gerada: public/images/{slug}.png
```

## Passo 3 — Delegar Push para @devops

**NÃO execute `git push` aqui.** Isso é responsabilidade **EXCLUSIVA** de `@devops`.

Após commit bem-sucedido:

```
✅ Artigo pronto para publicação!

Slug: {slug}
Layout: {layout}
Commit: [hash curto]

Próximo: Ativar @devops para push
@devops *push
```

## Solução de Problemas

| Erro | Causa | Solução |
|------|-------|--------|
| `Arquivo já existe` | Slug duplicado | Verificar `src/content/blog/` ou `src/pages/` |
| `Git merge conflict` | Alterações simultâneas | Resolver conflitos com editor, depois commit |
| `href não corresponde ao slug` | Inconsistência no montar-arquivo | Certificar que `href` == `slug` exatamente |
