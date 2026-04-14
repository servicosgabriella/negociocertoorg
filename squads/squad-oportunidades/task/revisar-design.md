---
task: revisar-design
responsavel: "@revisor-design"
squad: squad-oportunidades
gatilho: >
  Executar sempre que o artigo finalizado pelo @copywriter-pilarpage contiver tabela,
  grid comparativo ou componente visual estruturado.
entrada:
  - Arquivo .astro do artigo finalizado (caminho: src/pages/[slug].astro)
  - URL local para screenshot (http://localhost:4321/[slug]/)
saida:
  - Veredicto: APROVADO | AJUSTE NECESSÁRIO | BLOQUEADO
  - Se AJUSTE: lista de correções específicas por elemento e viewport
---

# Revisar Design — Tabelas e Componentes Visuais

## Antes de executar

Verificar se o artigo contém ao menos um dos elementos abaixo.
**Se nenhum estiver presente, não executar esta task.**

- `<table>` (qualquer tabela HTML)
- `<div class="contabilidade-container">` ou grid comparativo
- Box de produto / card de maquininha
- FAQ em HTML estruturado

---

## Execução

Seguir os 5 passos definidos em `agents/@revisor-design.md` na íntegra:

1. Identificar todos os elementos visuais presentes no artigo
2. Verificar estrutura HTML de cada um contra o padrão do projeto
3. Capturar screenshots desktop (1440px) e mobile (390px) via Playwright se disponível
4. Aplicar checklist de aprovação completo
5. Emitir veredicto com detalhes

---

## Referência de padrões do projeto

- Grid comparativo: ver `src/pages/melhores-contabilidades-online.astro`
- Dados de afiliados: `src/data/afiliados.ts`
- CSS responsivo: `src/styles/global.css`

---

## Fluxo após veredicto

```
APROVADO         → avançar para configuracoes/checklistfinal.md
AJUSTE           → retornar para @copywriter-pilarpage com lista de correções
                   → após correção, executar revisar-design novamente (máx 2x)
BLOQUEADO        → escalar para dono do projeto antes de qualquer ação
```
