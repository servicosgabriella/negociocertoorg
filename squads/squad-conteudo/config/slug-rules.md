---
config: slug-rules
title: Regras de URL e Slug
version: 1.0.0
squad: squad-conteudo
---

# Regras de URL e Slug

**Single source of truth.** Todos os agentes e checklists referenciam este arquivo. Não duplicar em nenhum outro lugar.

## Regras Inegociáveis

- **Máximo 75 caracteres**
- **NUNCA use números, anos ou datas** — nem "2026", "2025", "janeiro", "março", "abril"
- **Entre 3 e 5 palavras**
- Apenas letras minúsculas e hífens

## Como Extrair o Slug Ideal

Inspire-se nos top 3 da SERP para a keyword — os slugs que já rankam bem são referência direta.

## Exemplos Corretos

| Título do artigo | ✅ Slug correto | ❌ Slug proibido |
|-----------------|----------------|-----------------|
| Melhores Maquininhas para MEI em 2026 | `melhores-maquininhas-mei` | `melhores-maquininhas-para-mei-em-2026` |
| Como Abrir um MEI em 2026 | `como-abrir-um-mei` | `como-abrir-um-mei-em-2026` |
| Contabilidade Online ou Presencial: Qual Escolher? | `contabilidade-online-ou-presencial` | `contabilidade-online-ou-presencial-2026` |

## Checklist de Validação (@copywriter-seo — antes de criar o arquivo)

- [ ] Tem entre 3 e 5 palavras?
- [ ] Sem números, anos ou datas?
- [ ] Menos de 75 caracteres?
- [ ] Apenas letras minúsculas e hífens?

## Critérios de Veto Imediato (@qa-conteudo — auditoria automática)

| Violação | Exemplo proibido | Correção |
|----------|-----------------|----------|
| Contém número ou ano | `como-abrir-mei-2026` | `como-abrir-mei` |
| Contém mês ou data | `lancamentos-janeiro` | `lancamentos-maquininhas` |
| Mais de 5 palavras | `como-abrir-uma-empresa-de-forma-online` | `como-abrir-empresa-online` |
| Menos de 3 palavras | `mei` | `abrir-mei` |
| Mais de 75 caracteres | *(qualquer slug longo)* | Encurtar |

## Mensagem de Veto (template para @qa-conteudo)

```
🚫 ARTIGO VETADO — @copywriter-seo

Motivo: URL/slug inválido
Slug recebido: "{slug-com-problema}"
Violação: [número/ano | data | palavras demais | palavras de menos | muito longo]

Corrija o slug para: "{slug-sugerido}"
Reenvie após correção.
```
