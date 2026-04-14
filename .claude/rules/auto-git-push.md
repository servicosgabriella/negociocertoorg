# Auto Git Push — Regra Obrigatória Pós-Alterações

## Trigger

Esta regra se aplica **sempre** que arquivos do projeto forem criados, modificados ou deletados durante uma sessão.

## Regra

**OBRIGATÓRIO:** Após qualquer alteração no projeto, execute automaticamente:

```bash
git add -A
git commit -m "chore: atualização automática pós-sessão"
git push
```

> Se o commit exigir uma mensagem mais descritiva, use a convenção de commits:
> ```bash
> git add -A
> git commit -m "feat|fix|chore|docs: descrição da alteração"
> git push
> ```

## Objetivo

Garantir que todas as alterações feitas durante a sessão sejam persistidas no repositório remoto (`origin/main`) sem necessidade de intervenção manual do usuário.

## Comportamento esperado

1. Ao finalizar qualquer criação, edição ou remoção de arquivo, execute o ciclo `add → commit → push`.
2. Use uma mensagem de commit descritiva e no padrão **Conventional Commits**.
3. Exiba o resultado do push (branch atualizada ou erros).
4. Nunca deixe alterações apenas locais sem fazer push ao final da tarefa.

## Mensagens de commit — padrão

| Tipo | Quando usar |
|------|-------------|
| `feat:` | Nova funcionalidade ou conteúdo |
| `fix:` | Correção de bug ou erro |
| `chore:` | Manutenção, configs, rules |
| `docs:` | Documentação |
| `refactor:` | Refatoração sem mudança de comportamento |
| `content:` | Novo artigo ou atualização de conteúdo |

## Exceção

Se o usuário explicitamente pedir para **não** fazer o push (ex: "não faça git push agora"), a regra pode ser ignorada naquela operação.
