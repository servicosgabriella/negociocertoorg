---
task: Redigir Artigo
responsavel: "@copywriter-seo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - briefing: Documento de briefing do @head-de-conteudo (obrigatório)
  - keyword: Keyword principal (obrigatório)
  - intencao: Tipo de intenção de busca (obrigatório)
  - layout: bloglayout | contentlayout | reviewlayout (obrigatório)
  - h2s: Lista de H2s validados em ordem (obrigatório)
  - estrutura_introducao: ponte | cpp | pdp (obrigatório)
  - tamanho_alvo: Faixa de palavras alvo (obrigatório)
Saida: |
  - slug: URL/slug validado (sem números, anos, datas — 3 a 5 palavras)
  - conteudo: Corpo do artigo em Markdown puro (SEM frontmatter — frontmatter é responsabilidade do *montar-arquivo)
Checklist:
  - "[ ] Slug definido e validado ANTES de criar o arquivo (sem números, anos, datas)"
  - "[ ] Briefing lido na íntegra"
  - "[ ] Estrutura de introdução selecionada"
  - "[ ] H1 com keyword + intenção clara gerado"
  - "[ ] Introdução: keyword nos primeiros 100 palavras"
  - "[ ] Introdução: sem definição como abertura"
  - "[ ] Introdução: termina com promessa clara"
  - "[ ] Todos os H2s do briefing desenvolvidos"
  - "[ ] Para review/transacional: cada variante do mapa de variantes aparece ≥1x (H2 ou corpo)?"
  - "[ ] Nenhuma seção usa a mesma variante da keyword que o H1 (variação distribuída)?"
  - "[ ] Ritmo variado (sem efeito escada)"
  - "[ ] Tom 80/20 (técnico com personalidade)"
  - "[ ] 'Você' usado com frequência"
  - "[ ] Nenhum travessão (—) no meio de frases — use parênteses, vírgulas ou bullets"
  - "[ ] Nenhum conectivo/clichê da Lista Negra"
  - "[ ] Conclusão com próximo passo concreto (não 'esperamos ter ajudado')"
  - "[ ] FAQ preparado se +7 H2s ou artigo review: para bloglayout, entregar pares Q&A para o *montar-arquivo (NÃO escrever seção ## FAQ no corpo); para contentlayout/reviewlayout, escrever seção ## FAQ no corpo normalmente"
  - "[ ] Artigo enviado para @qa-conteudo"
---

# *redigir-artigo

Redige artigo SEO completo seguindo o briefing e as regras do squad.

## Uso

```
@copywriter-seo

*redigir-artigo --briefing briefing-maquininha-mei.md
*redigir-artigo "maquininha para MEI" --intencao comercial --layout reviewlayout --estrutura ponte
```

---

## Escopo desta Task (CRÍTICO)

`*redigir-artigo` entrega **apenas o corpo do artigo em Markdown puro**, sem frontmatter.

- **NÃO** buscar arquivos existentes no repositório para inferir frontmatter
- **NÃO** criar o arquivo final — isso é feito pelo `*montar-arquivo`
- **NÃO** incluir bloco `---` de frontmatter no output
- **NÃO** escrever seção `## FAQ` no corpo quando o layout for `bloglayout` — o BlogLayout renderiza o FAQ a partir do campo `faq:` do frontmatter; incluir FAQ no corpo causaria duplicação visual

O frontmatter (title, description, pubDate, coverImage, faq, etc.) é de responsabilidade exclusiva de `tasks/montar-arquivo.md`, que contém os templates completos para cada layout.

### Regra do FAQ por layout

| Layout | FAQ no corpo? | FAQ no frontmatter? |
|--------|--------------|---------------------|
| `bloglayout` | ❌ NÃO escrever `## FAQ` no corpo | ✅ Entregar pares Q&A para o `*montar-arquivo` colocar no campo `faq:` |
| `contentlayout` | ✅ Escrever `## FAQ` no corpo | ❌ Não usar campo `faq:` |
| `reviewlayout` | ✅ Escrever `## FAQ` no corpo | ❌ Não usar campo `faq:` |

Após redigir, executar `*montar-arquivo` passando o corpo produzido aqui.

## Destino do Arquivo por Layout

Para referência de destino e formato final, consultar `tasks/montar-arquivo.md`:

| Layout | Destino final |
|--------|--------------|
| `bloglayout.astro` | `src/content/blog/{slug}.md` |
| `contentlayout.astro` | `src/pages/{slug}.astro` |
| `reviewlayout.astro` | `src/pages/{slug}.astro` |

## Estruturas de Introdução

### ponte — Modelo de Ponte (comercial)
```
Imagine que você pudesse [situação desejada].
Mas agora mesmo, aqui está você. [dor atual]
Neste artigo você vai [promessa concreta].
```

### cpp — Concorde > Prometa > Preveja (informacional)
```
[Concordar com a dificuldade.] Não é?
[Prometida: tem solução.] Não é tão difícil quanto parece.
Neste artigo você vai ver [2-3 pontos].
```

### pdp — Pergunta + Dor + Promessa (informacional claro)
```
[Pergunta direta sobre o tema]?
[Consequência de errar.]
Neste guia você vai [promessa específica].
```

## Padrão de Ritmo Obrigatório

```
✅ CORRETO:
Bloco de 2-3 linhas desenvolvendo ideia completa.

Frase de impacto curta.

Outro bloco médio avançando o raciocínio.
```

```
❌ PROIBIDO:
Ponto um.

Ponto dois.

Ponto três.
```

---

**Travessão:** NUNCA use (—) para quebrar frases. Use parênteses, vírgula ou ponto. Ver `config/style-guide.md` — seção Pontuação.
