# 🔥 SOLUÇÃO RÁPIDA: Banco controladores_api_dev não criado

## 🎯 Problema Identificado

Você está vendo estes logs:

```
ℹ️ [generate-gitops-sql.sh] Arquivo init/11-create-controladores-db.sql já existe - pulando
PostgreSQL Database directory appears to contain a database; Skipping initialization
```

**O que está acontecendo:**

- ✅ Scripts SQL estão sendo gerados corretamente (`init/11-create-controladores-db.sql`)
- ✅ Container init-runner executa sem erros
- ❌ PostgreSQL detecta volume existente e **NÃO executa** scripts de inicialização
- ❌ Apenas o banco `backlog_dim_dev` foi criado em deploy anterior
- ❌ O banco `controladores_api_dev` ficou faltando

**Por que deletar volumes não resolve:**

O PostgreSQL só executa scripts em `/docker-entrypoint-initdb.d/` se:

1. O volume estiver **completamente vazio** OU
2. Você executar os scripts **manualmente** no container ativo

## ✅ SOLUÇÃO IMEDIATA

### Problema: Os arquivos SQL existem mas não são executados

Quando você vê `"Arquivo init/11-create-controladores-db.sql já existe - pulando"`, significa:

- ✅ O arquivo SQL foi gerado corretamente
- ❌ Mas o PostgreSQL **NÃO executou** ele (volume existente)

### Passo 1: Verificar estado atual

No **console do container postgres** no Portainer:

```bash
bash /app/scripts/debug-quick.sh
```

### Passo 2: Executar SQLs manualmente (SOLUÇÃO DEFINITIVA)

```bash
# Executa TODOS os SQLs pendentes automaticamente
bash /app/scripts/run-sql-files.sh
```

**OU execute apenas o banco específico:**

```bash
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/11-create-controladores-db.sql
```

### Passo 3: Verificar novamente

```bash
bash /app/scripts/debug-quick.sh
```

**Resultado esperado:**

```
✅ backlog_dim_dev EXISTE
✅ controladores_api_dev EXISTE
✅ backlog_user_db EXISTE
✅ controladores_user EXISTE
```

## 🔧 Variáveis de Ambiente Necessárias

Verifique no **Portainer Stack Environment Variables:**

```bash
# OBRIGATÓRIAS
POSTGRES_USER=admin
POSTGRES_PASSWORD=sua_senha_super_segura
POSTGRES_DB=postgres

# SENHAS DAS APLICAÇÕES
BACKLOG_PASSWORD=senha_backlog_123
CONTROLADORES_PASSWORD=senha_controladores_456

# EMAILS PGADMIN
PGADMIN_DEFAULT_EMAIL=admin@anpd.gov.br
PGADMIN_DEFAULT_PASSWORD=senha_pgadmin
```

## 🚀 Solução Definitiva (para próximos deploys)

### 🤖 Opção A - Auto-Sync Inteligente (RECOMENDADA)

**Habilite auto-sync no Portainer Stack:**

```bash
# Adicione esta variável nas Environment Variables do Stack:
AUTO_SYNC_DATABASES=true
```

**Como funciona:**

- ✅ **Detecção automática** de novas aplicações em `apps.conf`
- ✅ **Criação automática** de bancos faltantes
- ✅ **Idempotente** - pode rodar múltiplas vezes
- ✅ **Executa durante deploy** do stack
- ✅ **Detecta adições** sem necessidade de intervenção manual

**Execução manual (quando necessário):**

```bash
# No console do container postgres:
bash /app/scripts/auto-sync-databases.sh
```

### 🔧 Opção B - Execução manual (método atual)

Use sempre que os SQLs existem mas não foram executados:

```bash
# No console do container postgres:
bash /app/scripts/run-sql-files.sh
```

### 🧹 Opção C - Limpeza completa (se necessário)

⚠️ **ATENÇÃO**: Vai apagar TODOS os dados!

```bash
# 1. Parar stack no Portainer
# 2. Remover volumes NOMEADOS corretamente:
docker volume rm anpd_postgres_data anpd_pgadmin_data

# Se não funcionar, liste e identifique os volumes:
docker volume ls | grep postgres
docker volume ls | grep pgadmin

# Exemplo para stacks com nomes específicos:
docker volume rm nomestack_anpd_postgres_data nomestack_anpd_pgadmin_data

# 3. Deploy novamente (vai criar tudo do zero)
```

### 🔄 Opção D - Monitoramento contínuo

Para ambientes que adicionam aplicações frequentemente:

```bash
# Execute periodicamente (ex: cronjob):
bash /app/scripts/monitor-apps.sh
```

## 📋 Checklist de Verificação

- [ ] `CONTROLADORES_PASSWORD` definida no Portainer Stack
- [ ] `AUTO_SYNC_DATABASES=true` definida no Portainer Stack (recomendado)
- [ ] Container postgres está saudável (green/healthy)
- [ ] Variáveis obrigatórias definidas
- [ ] Script de debug executado: `bash /app/scripts/debug-quick.sh`
- [ ] Banco controladores_api_dev criado com sucesso

## 🎯 Vantagens da Solução Auto-Sync

### 🤖 Automação Completa

- **Zero intervenção manual** após configuração inicial
- **Detecta automaticamente** novas aplicações adicionadas ao `apps.conf`
- **Executa durante deploys** do stack no Portainer

### 🛡️ Robustez

- **Idempotente**: pode executar múltiplas vezes sem problemas
- **Resiliente**: detecta e corrige inconsistências automaticamente
- **Inteligente**: só cria o que realmente está faltando

### 🔄 Flexibilidade

- **Modo automático**: `AUTO_SYNC_DATABASES=true`
- **Modo manual**: scripts individuais disponíveis
- **Monitoramento**: verificação periódica opcional

### 📈 Escalabilidade

- **Suporta quantas aplicações** forem adicionadas
- **Não requer modificação** de código para novas apps
- **Mantém configuração versionada** em `apps.conf`

## 🔍 Debugging Avançado

### Se ainda não funciona após deletar volumes:

1. **Verificar nomes reais dos volumes:**

   ```bash
   docker volume ls | grep -E "(postgres|pgadmin)"
   ```

2. **Verificar se PostgreSQL realmente inicializou limpo:**

   ```bash
   # No container postgres, verificar se diretório está vazio:
   ls -la /var/lib/postgresql/data/
   # Deve ter poucos arquivos se for inicialização limpa
   ```

3. **Verificar logs do container postgres durante inicialização:**

   ```bash
   # Logs devem mostrar:
   # "PostgreSQL init process complete; ready for start up."
   # E NÃO: "PostgreSQL Database directory appears to contain a database"
   ```

4. **Forçar execução manual mesmo com volume limpo:**
   ```bash
   # No container postgres:
   bash /app/scripts/run-sql-files.sh
   ```

---

**Arquivo criado:** 29/07/2025
**Situação:** Problema específico do banco controladores faltando
