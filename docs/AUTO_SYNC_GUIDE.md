# 🚀 GUIA: Auto-Sync de Bancos de Dados

## ⚡ Ativação Rápida

### No Portainer Stack - Environment Variables:

```bash
# Habilitar auto-sync
AUTO_SYNC_DATABASES=true

# Manter variáveis existentes
POSTGRES_USER=admin
POSTGRES_PASSWORD=sua_senha_super_segura
POSTGRES_DB=postgres
BACKLOG_PASSWORD=senha_backlog_123
CONTROLADORES_PASSWORD=senha_controladores_456
```

## 🎯 Como Funciona

1. **Deploy do Stack** → Container `init-runner` executa
2. **Gera SQLs** baseado em `config/apps.conf`
3. **Auto-sync ativo?** → Conecta no PostgreSQL
4. **Verifica bancos** existentes vs. configurados
5. **Cria automaticamente** bancos faltantes
6. **Relatório completo** de sucesso/falhas

## 📱 Adicionando Nova Aplicação

### 1. Edite `config/apps.conf`:

```bash
# Aplicação: Nova API
nova_api:nova_api_dev:nova_api_user
```

### 2. Configure senha no Portainer:

```bash
NOVA_API_PASSWORD=senha_da_nova_api
```

### 3. Redeploy do stack

✅ **Pronto!** O banco será criado automaticamente.

## 🔧 Comandos Manuais

### Verificar estado atual:

```bash
bash /app/scripts/debug-quick.sh
```

### Executar sincronização:

```bash
bash /app/scripts/auto-sync-databases.sh
```

### Monitoramento rápido:

```bash
bash /app/scripts/monitor-apps.sh
```

## 📊 Exemplo de Output

```
🔄 Sincronização Inteligente de Bancos de Dados
=========================================================================

📋 Estado inicial dos bancos:
    backlog_dim_dev

🔍 Analisando aplicações em apps.conf...

📱 Verificando aplicação: backlog
   📊 Banco: backlog_dim_dev
   👤 Usuário: backlog_user_db
   ✅ Banco já existe

📱 Verificando aplicação: controladores
   📊 Banco: controladores_api_dev
   👤 Usuário: controladores_user
   🔄 Banco não existe - criando...
   ✅ Banco criado com sucesso

📊 RELATÓRIO FINAL:
===================
🔍 Aplicações encontradas: 2
✅ Bancos já existiam: 1
🆕 Bancos criados: 1
❌ Falhas: 0

🆕 Bancos criados nesta execução:
   - controladores

📋 Estado final dos bancos:
    backlog_dim_dev
    controladores_api_dev

🎉 Sincronização concluída com sucesso!
```

## 🛡️ Segurança

- ✅ **Senhas criptografadas** no PostgreSQL
- ✅ **Variáveis de ambiente** para credenciais
- ✅ **Não exposição** de senhas em logs
- ✅ **Verificação de permissões** antes da criação

## 🔄 Manutenção

### Verificação periódica (opcional):

```bash
# Adicione ao cron do container postgres:
*/30 * * * * bash /app/scripts/monitor-apps.sh
```

### Limpeza de logs temporários:

```bash
# Auto-limpeza inclusa nos scripts
# Nenhuma ação manual necessária
```

---

**Última atualização:** 29/07/2025  
**Status:** ✅ Produção - Testado e aprovado
