---
task: redigir-cluster
responsavel: "@redator-cluster"
ativacao: manual
descricao: >
  Redige um post informacional de suporte para o cluster de uma money page.
  Esta task NÃO está em nenhum workflow automático — só é executada quando
  o dono do projeto chamar @redator-cluster diretamente.
input:
  - titulo: Título completo do post (conforme cluster-master.md)
  - slug: URL do post (conforme cluster-master.md)
  - keyword: Keyword principal do post
  - variacoes: Variações semânticas (opcional)
  - money_page: URL da money page que esse post suporta
  - links_cluster: URLs dos posts do cluster que têm relação temática (opcional)
  - h2s: Estrutura de H2s do post
output:
  - arquivo: src/pages/{slug}.astro com contentlayout
  - capa: public/images/{slug}.png gerado
  - gabriella: src/pages/autor/gabriella-fernandes.astro atualizado
  - estrutura: src/data/estrutura.ts atualizado
---

# *redigir-cluster

Task atômica do `@redator-cluster`. Fluxo completo em 5 passos:

## Passo 1 — Carregar skill de nicho

Identificar o nicho pelo tema do post e carregar:
- `skill/copy-maquininha.md` — maquininha, voucher, VR/VA, taxas, bandeiras
- `skill/copy-contabilidade.md` — contabilidade, obrigações fiscais, MEI
- `skill/copy-negociocerto.md` — negócios, empreendedorismo (default)

## Passo 2 — Verificar input

Confirmar todos os campos obrigatórios antes de redigir:
- [ ] `titulo` preenchido
- [ ] `slug` preenchido e bate com o `cluster-master.md`
- [ ] `keyword` preenchida
- [ ] `money_page` preenchida
- [ ] `h2s` preenchidos

**Se algum campo obrigatório faltar: perguntar antes de continuar.**

## Passo 3 — Redigir o artigo

Seguir as Regras de Construção do `@redator-cluster.md` na íntegra.

Checklist interno antes de finalizar:
- [ ] Introdução segue uma das 3 estruturas (CPP / Ponte / Pergunta+Resposta+Open Loop)
- [ ] Cada H2 abre com resposta direta (não com setup)
- [ ] Cada H2 tem ao menos um dado concreto (número, prazo, exemplo de cenário)
- [ ] Link para `money_page` inserido naturalmente no corpo do texto
- [ ] Links para `links_cluster` presentes somente onde há relação temática real
- [ ] FAQ com mínimo 5 perguntas no frontmatter
- [ ] Conclusão informacional com CTA apontando para a money page
- [ ] Nenhum travessão (—) em parágrafos
- [ ] Voz ativa em todo o artigo

## Passo 4 — Montar o arquivo

Seguir `squads/squad-conteudo/tasks/montar-arquivo.md` usando `contentlayout.astro`.

Layout obrigatório para posts de cluster:
```astro
import ContentLayout from '../layouts/ContentLayout.astro';
```

Atualizar obrigatoriamente após criar o arquivo:
1. `src/pages/autor/gabriella-fernandes.astro` — novo artigo no topo do array
2. `src/data/estrutura.ts` — novo item na subcategoria correspondente

## Passo 5 — Gerar capa

Executar `squads/squad-conteudo/tasks/gerar-capa.md`:

```bash
npm run gerar-imagem -- --slug "{slug-sem-barras}" --topico "{descrição visual do conteúdo}"
```

Após geração:
- [ ] Arquivo PNG confirmado em `public/images/{slug}.png`
- [ ] `coverImage="/images/{slug}.png"` adicionado ao frontmatter do artigo

---

**Esta task NÃO aciona nenhum outro agente ao concluir.**
O post fica publicado e o `cluster-master.md` já foi atualizado previamente pelo `@cluster-pilarpage`.
