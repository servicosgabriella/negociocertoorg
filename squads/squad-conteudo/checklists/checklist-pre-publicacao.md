---
checklist: Pré-Publicação
version: 2.0.0
squad: squad-conteudo
politica: Zero tolerância — qualquer NÃO = VETO imediato
---

# Checklist de Pré-Publicação

Execute cada item na ordem. Um único **NÃO** resulta em VETO com indicação do trecho.

Referências de apoio:
- Blacklist completa → `config/blacklist.md`
- Regras de slug → `config/slug-rules.md`
- Templates de veto/aprovação → `templates/feedback-qa-tmpl.md`

---

## Fase 1 — @qa-conteudo: URL/Slug (verificar PRIMEIRO)

> Qualquer NÃO = **VETO IMEDIATO** antes de revisar o conteúdo.

- [ ] Slug **não contém** números ou anos (ex: 2026, 2025)?
- [ ] Slug **não contém** meses ou datas (ex: janeiro, março)?
- [ ] Slug tem entre **3 e 5 palavras**?
- [ ] Slug tem **menos de 75 caracteres**?
- [ ] Slug usa apenas **letras minúsculas e hífens**?

---

## Fase 2 — @copywriter-seo: Layout e Destino do Arquivo

> Verificado pelo copywriter antes de entregar ao QA. QA confirma na auditoria.

- [ ] Intenção Informacional/Navegacional → arquivo em `src/content/blog/{slug}.md`?
- [ ] Intenção Comercial/Transacional + review → arquivo em `src/pages/{slug}.astro` com `ReviewLayout`?
- [ ] Intenção Comercial/Transacional + sem review → arquivo em `src/pages/{slug}.astro` com `ContentLayout`?
- [ ] Arquivo no formato correto para o layout (`.md` para blog, `.astro` para content/review)?

---

## Fase 3 — @qa-conteudo: SEO

- [ ] H1 contém keyword principal com intenção clara?
- [ ] Keyword aparece nos primeiros 100 palavras (de forma natural)?
- [ ] Nenhum H2 é genérico (sem: "O que é", "Benefícios de", "Como funciona", "Vantagens e desvantagens", "Dicas para", "Conclusão")?
- [ ] Links internos têm âncoras descritivas (não "clique aqui")?
- [ ] Intenção de busca está alinhada com o formato do artigo?

---

## Fase 4 — @qa-conteudo: Lista Negra de Linguagem

> Referência completa: `config/blacklist.md`

### Conectivos Proibidos

- [ ] Texto NÃO contém: "Vale ressaltar"?
- [ ] Texto NÃO contém: "É importante notar"?
- [ ] Texto NÃO contém: "Cabe destacar"?
- [ ] Texto NÃO contém: "Além disso" (início de parágrafo)?
- [ ] Texto NÃO contém: "Em suma"?
- [ ] Texto NÃO contém: "Por fim" (introdução de conclusão)?
- [ ] Texto NÃO contém: "Dessa forma"?
- [ ] Texto NÃO contém: "Assim sendo"?
- [ ] Texto NÃO contém: "Portanto" (início de parágrafo)?
- [ ] Texto NÃO contém: "Nesse sentido"?
- [ ] Texto NÃO contém: "No que diz respeito a"?

### Clichês Corporativos Proibidos

- [ ] Texto NÃO contém: "No cenário digital de hoje"?
- [ ] Texto NÃO contém: "No mundo acelerado em que vivemos"?
- [ ] Texto NÃO contém: "Na era da transformação digital"?
- [ ] Texto NÃO contém: "Em tempos de constante mudança"?
- [ ] Texto NÃO contém: "No ambiente competitivo atual"?
- [ ] Texto NÃO contém: "Como todos sabemos"?
- [ ] Texto NÃO contém: "É fundamental que"?

### Palavra Proibida

- [ ] Texto NÃO contém: "Crucial"?

---

## Fase 5 — @qa-conteudo: Pontuação e Tom

- [ ] Texto NÃO contém travessão (—) no meio de frases?
- [ ] NÃO há travessões (linhas cinzas) entre os H2s separando as seções?
- [ ] Tom passa no teste: "parece conversa ou texto robótico"?
- [ ] "Você" usado com frequência adequada?
- [ ] Dados são específicos (não "a maioria", "muitos", "geralmente")?

---

## Fase 6 — @qa-conteudo: Ritmo Visual e Estrutura

- [ ] Efeito escada ausente (sem 3+ frases de 1 linha seguidas)?
- [ ] Blocos e frases de impacto intercalados?
- [ ] Introdução começa com gancho (não definição)?
- [ ] Conclusão tem próximo passo concreto (não "esperamos ter ajudado" ou similar)?

---

## Fase 7 — @qa-conteudo: Teste Final

- [ ] Lendo em voz alta, soa como um humano explicando para outro humano?

---

## Resultado (@qa-conteudo emite veredicto)

**APROVADO:** Todos os itens ✅ → entregar para publicação usando template de `templates/feedback-qa-tmpl.md`.

**VETADO:** Qualquer item ❌ → listar itens falhos com trechos específicos e devolver ao `@copywriter-seo` usando template de `templates/feedback-qa-tmpl.md`.

---

## Fase 8 — @head-de-conteudo: Pós-Publicação (condicional)

> O QA não executa estes itens — apenas verifica se foram feitos antes de encerrar o pipeline.
> Obrigatório apenas para `reviewlayout.astro` ou `contentlayout.astro`.

- [ ] `*atualizar-pos-publicacao` foi executado?
- [ ] `src/pages/autor/gabriella-fernandes.astro`: novo artigo adicionado no array `articles`?
- [ ] `src/data/estrutura.ts`: nova entrada adicionada no array `paginas` da subcategoria correta?
- [ ] `href` é idêntico nos dois arquivos e no nome do arquivo em `src/pages/`?
