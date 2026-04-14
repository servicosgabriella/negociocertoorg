---

esse arquivo fornece instrução de qual layout utilizar antes de começar a escrever a pilar page

---

nós utilizamos 3 principais layouts

## ReviewLayout.astro

**Usar quando:** o artigo compara e recomenda produtos ou serviços específicos com boxes visuais, avaliação por notas, prós/contras e CTAs de afiliado.

**Critério decisivo:** a página apresenta uma lista ranqueada de opções (contabilidades, maquininhas, ferramentas, planos) onde cada opção tem seu próprio box de destaque com botão de ação.

**Exemplos no projeto:**
- `melhores-contabilidades-online.astro` → compara contabilidades online com boxes, notas e CTAs
- `melhores-maquininhas-cartao-voucher-refeicao.astro` → compara maquininhas com boxes, notas e CTAs

**Sinais na keyword:** "melhores X", "top X para Y", "qual melhor Z", "X para MEI", "X para [perfil de negócio]" quando o objetivo é recomendar opções específicas com afiliados.

---

## ContentLayout.astro

**Usar quando:** o artigo é transacional ou comercial mas NÃO apresenta boxes de produtos ranqueados. O conteúdo educa, compara conceitos ou explica custos — sem listar opções com CTAs individuais.

**Exemplos no projeto:**
- `quanto-custa-uma-contabilidade-online.astro` → explica faixas de preço, não recomenda uma contabilidade específica
- `contabilidade-online-ou-presencial.astro` → compara modalidades (conceito vs conceito), não produtos

---

## BlogLayout.astro

**Usar quando:** intenção informacional pura — guias, tutoriais, explicações, passo a passo — sem intenção comercial direta.

---

## Regra de Desempate

Em caso de dúvida entre ReviewLayout e ContentLayout, consulte `src/pages/` e localize um artigo do mesmo nicho (contabilidade, maquininha, etc.) já publicado. Use o mesmo layout do artigo mais similar em estrutura e intenção. **Nunca decida sem verificar o padrão existente.**

