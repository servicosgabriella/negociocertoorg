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
  - arquivo: Arquivo do artigo no formato e destino corretos para o layout definido
Checklist:
  - "[ ] Slug definido e validado ANTES de criar o arquivo (sem números, anos, datas)"
  - "[ ] Briefing lido na íntegra"
  - "[ ] Estrutura de introdução selecionada"
  - "[ ] H1 com keyword + intenção clara gerado"
  - "[ ] Introdução: keyword nos primeiros 100 palavras"
  - "[ ] Introdução: sem definição como abertura"
  - "[ ] Introdução: termina com promessa clara"
  - "[ ] Todos os H2s do briefing desenvolvidos"
  - "[ ] Ritmo variado (sem efeito escada)"
  - "[ ] Tom 80/20 (técnico com personalidade)"
  - "[ ] 'Você' usado com frequência"
  - "[ ] Nenhum travessão (—) no meio de frases — use parênteses, vírgulas ou bullets"
  - "[ ] Nenhum conectivo/clichê da Lista Negra"
  - "[ ] Conclusão com próximo passo concreto (não 'esperamos ter ajudado')"
  - "[ ] FAQ incluído se +7 H2s ou artigo review"
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

## Destino do Arquivo por Layout (CRÍTICO)

O layout define onde o arquivo é criado e qual formato usar. **Referência completa:** `tasks/montar-arquivo.md`.

| Layout | Destino |
|--------|---------|
| `bloglayout.astro` | `src/content/blog/{slug}.md` (Markdown) |
| `contentlayout.astro` | `src/pages/{slug}.astro` (Astro + ContentLayout) |
| `reviewlayout.astro` | `src/pages/{slug}.astro` (Astro + ReviewLayout) |

Após redigir o conteúdo, executar `*montar-arquivo` para criar o arquivo com frontmatter correto.

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
