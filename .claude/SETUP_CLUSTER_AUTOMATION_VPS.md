# Setup - Cluster Daily Architect na VPS

## 📋 Pré-requisitos

✅ Node.js 18+ instalado
✅ Git configurado na VPS
✅ Variáveis de ambiente disponíveis:
- `TELEGRAM_TOKEN`
- `TELEGRAM_CHAT_ID`
- `GITHUB_TOKEN`
- `GITHUB_USER`
- `VALUESERP_API_KEY`

---

## 🔧 1. Configurar Variáveis de Ambiente

### Opção A: Arquivo `.env` na VPS

```bash
cd /Users/vitormuller/negociocertoorg
nano .env
```

Adicione:
```
TELEGRAM_TOKEN=seu_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
GITHUB_TOKEN=seu_github_token_aqui
GITHUB_USER=seu_usuario_github
VALUESERP_API_KEY=sua_chave_valueserp
LOCAL_DEV_PORT=4321
```

Salve com `Ctrl+O` → `Enter` → `Ctrl+X`

---

### Opção B: Variáveis de Ambiente do Sistema

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
export TELEGRAM_TOKEN="seu_token_aqui"
export TELEGRAM_CHAT_ID="seu_chat_id_aqui"
export GITHUB_TOKEN="seu_github_token_aqui"
export GITHUB_USER="seu_usuario_github"
export VALUESERP_API_KEY="sua_chave_valueserp"

# Depois
source ~/.bashrc  # ou ~/.zshrc
```

---

## ⏰ 2. Configurar Cron Job

```bash
crontab -e
```

Adicione a linha (roda diariamente às 9:00 AM):

```bash
0 9 * * * cd /Users/vitormuller/negociocertoorg && source .env && /usr/bin/node .aiox-core/scripts/cluster-daily-architect.js >> /var/log/cluster-architect.log 2>&1
```

**Ou se estiver usando variáveis de ambiente do sistema:**

```bash
0 9 * * * /usr/bin/node /Users/vitormuller/negociocertoorg/.aiox-core/scripts/cluster-daily-architect.js >> /var/log/cluster-architect.log 2>&1
```

Salve com `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 📝 3. Criar Log Directory

```bash
mkdir -p /Users/vitormuller/negociocertoorg/.aiox-core/logs
mkdir -p /Users/vitormuller/negociocertoorg/.aiox
chmod 755 /Users/vitormuller/negociocertoorg/.aiox-core/logs
chmod 755 /Users/vitormuller/negociocertoorg/.aiox
```

---

## 🧪 4. Teste Manual

Teste se o script roda sem erros:

```bash
# Com variáveis de ambiente
export TELEGRAM_TOKEN="seu_token"
export TELEGRAM_CHAT_ID="seu_chat_id"
export GITHUB_TOKEN="seu_token"
export GITHUB_USER="seu_user"
export VALUESERP_API_KEY="sua_chave"

/usr/bin/node /Users/vitormuller/negociocertoorg/.aiox-core/scripts/cluster-daily-architect.js
```

**Saída esperada:**
```
[timestamp] [INFO] 🚀 Iniciando Cluster Daily Architect
[timestamp] [INFO] 📂 Lendo cluster-master.md...
[timestamp] [SUCCESS] ✅ 6 artigos encontrados
[timestamp] [INFO] 🎯 Artigo selecionado: Vale refeição e vale alimentação...
[timestamp] [INFO] 🔍 Buscando SERP para: "Vale refeição e vale alimentação"
[timestamp] [SUCCESS] ✅ 3 resultados obtidos do ValueSERP
[timestamp] [INFO] 📤 Mensagem Telegram enviada
[timestamp] [INFO] ⏳ Aguardando sua aprovação no Telegram...
```

---

## 📱 5. Configurar Webhook do Telegram (Opcional)

Se quiser que o bot **responda automaticamente** aos botões do Telegram (sem rodar o script manualmente):

### 5.1 Criar Endpoint Webhook

Você precisa de um servidor web que receba callbacks do Telegram. Exemplo com Node.js:

```javascript
// webhook.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook/telegram', (req, res) => {
  const { callback_query } = req.body;

  if (callback_query) {
    const { data } = callback_query;
    // Executar handler de aprovação
    require('child_process').exec(
      `/usr/bin/node /Users/vitormuller/negociocertoorg/.aiox-core/scripts/cluster-daily-architect.js --webhook "${data}"`
    );
  }

  res.json({ ok: true });
});

app.listen(3001, () => console.log('Webhook listening on :3001'));
```

### 5.2 Registrar Webhook no Telegram

```bash
curl -X POST "https://api.telegram.org/botSEU_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://seu-dominio.com/webhook/telegram"}'
```

**Nota:** O webhook é opcional. Sem ele, você aprova manualmente rodando o script com `--webhook`.

---

## ✅ Verificar Status

```bash
# Ver se cron job está configurado
crontab -l

# Ver logs do último run
tail -50 /var/log/cluster-architect.log

# Ver estado da automação
cat /Users/vitormuller/negociocertoorg/.aiox/cluster-architect-state.json

# Ver artigos processados
cat /Users/vitormuller/negociocertoorg/.aiox-core/logs/cluster-architect.log | grep "Artigo"
```

---

## 🚀 Resultado Esperado

**Diariamente às 9:00 AM:**

1. ✅ Script inicia automaticamente
2. ✅ Lê `cluster-master.md`
3. ✅ Busca SERP via ValueSERP API
4. ✅ Chama @arquiteto-cluster (estrutura H2s)
5. ✅ Chama @copywriter-cluster (redação)
6. ✅ Detecta tabelas (chama @revisor-design se necessário)
7. ✅ Usa skill texto-ancora (consulta anchor-master.md)
8. ✅ **Envia preview para Telegram**
9. ✅ **Aguarda sua aprovação** (botões ✅/❌/👁️)
10. ✅ Git commit + push (após aprovação)
11. ✅ Atualiza anchor-master.md
12. ✅ Remove artigo de cluster-master.md
13. ✅ Notifica conclusão no Telegram

---

## 🐛 Troubleshooting

### Cron job não roda

**Verificar:**
```bash
# Ver se cron está ativo
sudo service cron status  # Linux
sudo launchctl list | grep cron  # macOS

# Ver erros do cron
log show --predicate 'process == "cron"' --last 1h  # macOS
sudo tail -100 /var/log/syslog | grep CRON  # Linux
```

### Script roda mas Telegram não recebe mensagem

**Verificar:**
- `TELEGRAM_TOKEN` está correto?
- `TELEGRAM_CHAT_ID` está correto?
- Internet está funcionando na VPS?

```bash
# Testar conexão
curl -s "https://api.telegram.org/botSEU_TOKEN/getMe" | jq .
```

### ValueSERP API retorna erro

**Verificar:**
- `VALUESERP_API_KEY` está correto?
- Quota de API não foi esgotada?

```bash
# Testar API
curl "https://api.valueserp.com/search?q=test&api_key=SUA_CHAVE"
```

### Git push falha

**Verificar:**
- `GITHUB_TOKEN` está correto e tem permissão `repo`?
- `GITHUB_USER` é o nome de usuário correto?
- Repositório é privado ou público?

```bash
# Testar credenciais
git ls-remote "https://GITHUB_USER:GITHUB_TOKEN@github.com/GITHUB_USER/negociocerto.org.git"
```

---

## 📊 Monitoramento Contínuo

Para monitorar a saúde do script, você pode:

1. **Ver logs em tempo real:**
```bash
tail -f /var/log/cluster-architect.log
```

2. **Verificar estado de pendências:**
```bash
cat /Users/vitormuller/negociocertoorg/.aiox/cluster-architect-state.json | jq '.pendingApprovals'
```

3. **Contar artigos processados:**
```bash
cat /Users/vitormuller/negociocertoorg/.aiox/cluster-architect-state.json | jq '.processedArticles | length'
```

---

## 🎯 Próximos Passos

Após setup:

1. ✅ Teste manual primeira vez
2. ✅ Aprove o primeiro artigo no Telegram
3. ✅ Verifique se git push funcionou
4. ✅ Verifique se anchor-master.md foi atualizado
5. ✅ Verifique se artigo foi removido de cluster-master.md
6. ✅ Cron rodará automaticamente amanhã às 9:00 AM

Qualquer dúvida, verifique os logs!
