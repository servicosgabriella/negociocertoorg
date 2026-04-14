---

essa task é utilizada pelo @copywriter-pilarpage.md

input:
- H1/H2/H3
- SLUG/Título
- keyword: Keyword principal (obrigatório)
- variações semanticas da Keyword principal
- layout: contentlayout | reviewlayout (obrigatório)

output:
artigo completo

---

## Modos de execução

Esta task opera em dois modos distintos. **Identificar o modo antes de qualquer ação.**

---

### Modo 1 — Criação (artigo novo)

Usar quando o arquivo `.astro` ainda não existe ou quando foi explicitamente pedido "escrever do zero".

Executar o artigo completo seguindo a estrutura de H2s do briefing.

---

### Modo 2 — Modificação (artigo existente)

Usar quando existe um artigo publicado e o pedido é alterar, corrigir ou substituir algo específico.

**Regra de escopo — CRÍTICA:**
> Modificar **somente** o que foi explicitamente pedido. Nunca reescrever seções que não foram mencionadas no pedido.

**Protocolo obrigatório:**

1. **Ler o arquivo existente** — ler o `.astro` atual na íntegra antes de qualquer edição
2. **Identificar o escopo exato** — qual componente/seção/elemento deve ser alterado?
3. **Confirmar o escopo com o usuário se ambíguo** — antes de editar, declarar: "Vou alterar apenas [X]. O restante do artigo permanece intacto."
4. **Aplicar a mudança cirurgicamente** — editar apenas o bloco identificado
5. **Preservar todo o resto** — texto, H2s, introdução, FAQ, estrutura Astro — tudo que não foi pedido permanece idêntico

**Exemplos de escopo:**

```
Pedido: "substitua a tabela por boxes com logo"
Escopo correto: substituir apenas o componente de tabela pelo componente de box
Escopo errado: reescrever introdução + reorganizar H2s + substituir tabela

Pedido: "melhore o H2 sobre taxas"
Escopo correto: reescrever apenas o bloco do H2 de taxas
Escopo errado: reescrever o artigo inteiro com foco em taxas
```

**Anti-padrão crítico:** Nunca interpretar um pedido de modificação como oportunidade de "melhorar o artigo inteiro". Se o usuário pediu trocar a tabela, trocar a tabela.

---

## Tabelas HTML — Obrigatório

Toda tabela no artigo — comparação, taxas, recursos, review — deve seguir os modelos em `data/modelo-html.md`.

**Nunca usar:**
- Tabela markdown (`| col | col |`)
- `<table>` HTML sem estilo inline

**Sempre usar:** o modelo HTML correspondente ao contexto (ver guia de escolha em `data/modelo-html.md`).

Isso se aplica a qualquer layout: `contentlayout.astro`, `reviewlayout.astro` e `bloglayout.astro`.

---

## Destino do Arquivo por Layout

Para referência de destino e formato final, consultar

| Layout | Destino final |
|--------|--------------|
| `contentlayout.astro` | `src/pages/{slug}.astro` |
| `reviewlayout.astro` | `src/pages/{slug}.astro` |


## Imagem

quando escolher contentlayout.astro no final do artigo precisa chamar squads/squad-conteudo/tasks/gerar-capa.md

