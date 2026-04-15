---
type: handoff-ativo
description: >
  Arquivo de transferência entre fases do pipeline. Sobrescrito ao final de
  cada fase. A fase seguinte carrega apenas este arquivo + seus próprios agentes.
  Consultar file/handoff-template.md para o formato completo de cada seção.
---

```yaml
fase: 4→concluido
arquivo_gerado: "src/pages/melhores-sistemas-nota-fiscal.astro"
keyword: "melhores sistemas de emissão de nota fiscal eletrônica"
slug: "/melhores-sistemas-nota-fiscal/"
layout: "reviewlayout"

checklist_fase4:
  artigo_acessivel: true          # HTTP 200 em /melhores-sistemas-nota-fiscal/
  title_tag_presente: true        # "Melhores Sistemas de NF-e, NFS-e e NFC-e (Atualizado 2026)"
  meta_description_presente: true
  subcategoria_registrada: true   # estrutura.ts > gestao > nfe
  pagina_autor_atualizada: true   # gabriella-fernandes.astro atualizado
  imagem_capa: "n/a"              # ReviewLayout não exige imagem de capa

notas_publicacao: >
  Pipeline completo concluído. Artigo publicado em /melhores-sistemas-nota-fiscal/
  com 5 review-containers completos (Bling, Spedy, Asaas, Emitte, NFE+), FAQ de 6
  perguntas, H2s editoriais sobre tipos de NF-e, certificado digital A1/A3 e
  Reforma Tributária 2026. Autora: Gabriella Fernandes.
```
