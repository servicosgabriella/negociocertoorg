---
checklist: Pré-Publicação
responsavel: "@qa-conteudo"
version: 1.0.0
squad: squad-conteudo
fonte: Regra #11 — estilodeconteudo.md
politica: Zero tolerância — qualquer NÃO = VETO imediato
---

# Checklist de Pré-Publicação

Execute cada item. Um único **NÃO** resulta em VETO com indicação do trecho.

## URL / Slug — Verificar PRIMEIRO (veto imediato se falhar)

- [ ] Slug **não contém** números ou anos (ex: 2026, 2025)?
- [ ] Slug **não contém** meses ou datas (ex: janeiro, março)?
- [ ] Slug tem entre **3 e 5 palavras**?
- [ ] Slug tem **menos de 75 caracteres**?
- [ ] Slug usa apenas **letras minúsculas e hífens**?

> Qualquer NÃO aqui = **VETO IMEDIATO** antes de revisar o conteúdo.

## Layout Astro e Destino do Arquivo

- [ ] Intenção Informacional/Navegacional → arquivo em `src/content/blog/{slug}.md`?
- [ ] Intenção Comercial/Transacional + review → arquivo em `src/pages/{slug}.astro` com `ReviewLayout`?
- [ ] Intenção Comercial/Transacional + sem review → arquivo em `src/pages/{slug}.astro` com `ContentLayout`?
- [ ] Arquivo no formato correto para o layout (`.md` para blog, `.astro` para content/review)?

## SEO

- [ ] H1 contém keyword principal com intenção clara?
- [ ] Keyword aparece nos primeiros 100 palavras (de forma natural)?
- [ ] Nenhum H2 é genérico (sem: "O que é", "Benefícios de", "Como funciona", "Vantagens e desvantagens", "Dicas para", "Conclusão")?
- [ ] Links internos têm âncoras descritivas (não "clique aqui")?
- [ ] Intenção de busca está alinhada com o formato do artigo?

## Estilo — Lista Negra (Regra #3)

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

## Estilo — Pontuação e Conectores

- [ ] Texto NÃO contém travessão (—) no meio de frases (quebra de ritmo visual e parsing)?
- [ ] Maiúsculas usadas para destaque, parênteses para complemento, vírgulas para separação?
- [ ] Listas usam bullets (—) ou números quando apropriado, não travessões soltos?

## Estilo — Tom e Voz

- [ ] Tom passa no teste: "parece conversa ou texto robótico"?
- [ ] "Você" usado com frequência adequada?
- [ ] Dados são específicos (não "a maioria", "muitos", "geralmente")?

## Ritmo Visual (Regra #6)

- [ ] Efeito escada ausente (sem 3+ frases de 1 linha seguidas)?
- [ ] Blocos e frases de impacto intercalados?
- [ ] Máximo 3-4 linhas por bloco respeitado?

## Estrutura

- [ ] Introdução começa com gancho (não definição)?
- [ ] Conclusão tem próximo passo concreto (não "esperamos ter ajudado" ou similar)?

## Teste Final

- [ ] Lendo em voz alta, soa como um humano explicando para outro humano?

---

## Resultado

**APROVADO:** Todos os itens marcados ✅ → Entregar para publicação.

**VETADO:** Qualquer item ❌ → Listar itens falhos com trechos específicos e devolver ao `@copywriter-seo`.

---

## Pós-Publicação (responsabilidade do @head-de-conteudo)

> O QA não executa estes itens — apenas verifica se foram feitos antes de encerrar o pipeline.

- [ ] Layout é `reviewlayout.astro` ou `contentlayout.astro`? → obrigatório executar `*atualizar-pos-publicacao`
- [ ] `src/pages/autor/gabriella-fernandes.astro`: novo artigo adicionado no array `articles`?
- [ ] `src/data/estrutura.ts`: nova entrada adicionada no array `paginas` da subcategoria correta?
- [ ] `href` é idêntico nos dois arquivos e no nome do arquivo em `src/pages/`?
