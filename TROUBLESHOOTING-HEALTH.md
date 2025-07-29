# 🚨 TROUBLESHOOTING: Container anpd-postgres-dev is unhealthy

## ❌ Erro Reportado

````
Failed to deploy a stack: compose u### 6. 🎯 Solução Rápida Recomendada

**🚀 SOLUÇÃO RÁPIDA PARA BANCOS FALTANDO:**

Se apenas alguns bancos não foram criados devido ao volume existente:

```bash
# 1. Entre no console do container postgres no Portainer
# 2. Execute:
bash /app/scripts/run-sql-files.sh

# OU execute individualmente:
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/10-create-backlog-db.sql
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/11-create-controladores-db.sql
````

**Health Check Temporário:**
Se o health check ainda falha, comente temporariamente:eration failed: dependency failed to start: container anpd-postgres-dev is unhealthy

````

## 🔍 Possíveis Causas e Soluções

### 1. 🕐 Timeout de Inicialização

**Problema:** PostgreSQL pode estar demorando mais que 30s para inicializar completamente

**Solução aplicada:**

- ✅ Aumentado `start_period` para 30s
- ✅ Reduzido `interval` para 10s para checks mais frequentes
- ✅ Health check melhorado para incluir usuário específico

### 2. 🔐 Variáveis de Ambiente Obrigatórias

**Verifique se no Portainer Stack estão definidas:**

```bash
# OBRIGATÓRIAS
POSTGRES_USER=admin
POSTGRES_PASSWORD=SUA_SENHA_SEGURA
POSTGRES_DB=postgres

# PARA GITOPS (se usando apps do config/apps.conf)
BACKLOG_PASSWORD=senha_backlog_segura
CONTROLADORES_PASSWORD=senha_controladores_segura

# OPCIONAIS (mas recomendadas)
PGADMIN_DEFAULT_EMAIL=admin@anpd.gov.br
PGADMIN_DEFAULT_PASSWORD=senha_pgadmin_segura
````

### 3. 📁 Arquivos SQL Corrigidos

**Problema resolvido:** Caracteres especiais (\*) nas senhas quebravam geração SQL

**Status:** ✅ CORRIGIDO

- Scripts de geração com escape de caracteres especiais
- SQLs regenerados e validados

**Problema crítico encontrado:** Comando `\connect` nos SQLs

**Status:** ✅ CORRIGIDO

- ❌ Comando `\connect` não funciona em `/docker-entrypoint-initdb.d/`
- ✅ Removido `\connect` e permissões complexas dos templates
- ✅ SQLs simplificados para evitar travamentos na inicialização

### 4. �️ Volume Persistente - Scripts Não Executam

**Problema muito comum:** Volume PostgreSQL já existe de deploy anterior

**Sintomas:**

```
PostgreSQL Database directory appears to contain a database; Skipping initialization
ℹ️ [generate-gitops-sql.sh] Arquivo init/10-create-backlog-db.sql já existe - pulando
```

**Explicação:**

- PostgreSQL só executa scripts em `/docker-entrypoint-initdb.d/` na **primeira inicialização**
- Se o volume `anpd_postgres_data` já existe, os scripts são ignorados
- Os bancos das aplicações não são criados

**✅ SOLUÇÕES:**

**Opção A - Remover Volume e Reiniciar (RECOMENDADO):**

```bash
# No Portainer:
# 1. Parar o stack
# 2. Remover volumes:
docker volume rm anpd_postgres_data anpd_pgadmin_data
# 3. Fazer deploy do stack novamente
```

**Opção B - Criar Bancos Manualmente:**

```bash
# Execute no console do container postgres:
bash /app/scripts/check-databases.sh  # Para verificar bancos existentes

# Se necessário, execute os SQLs manualmente:
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/10-create-backlog-db.sql
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/11-create-controladores-db.sql
```

**Opção C - Forçar Recriação (CUIDADO - PERDE DADOS):**

```bash
# No console do container postgres:
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<EOF
DROP DATABASE IF EXISTS backlog_dim_dev;
DROP DATABASE IF EXISTS controladores_api_dev;
DROP USER IF EXISTS backlog_user_db;
DROP USER IF EXISTS controladores_user;
EOF

# Depois execute os SQLs:
bash /docker-entrypoint-initdb.d/../scripts/run-sql-files.sh
```

### 5. �🐳 Problemas no Container

**Passos para diagnóstico no Portainer:**

1. **Verificar logs do container:**

   - Vá em Containers → anpd-postgres-dev → Logs
   - Procure por erros de inicialização

2. **Verificar health check:**

   - Se o container está rodando mas marcado como "unhealthy"
   - Logs devem mostrar falhas no comando `pg_isready`

3. **Testar manualmente:**
   - Entre no container: `docker exec -it anpd-postgres-dev bash`
   - Execute: `pg_isready -h localhost -p 5432 -U admin`

### 5. 🎯 Solução Rápida Recomendada

**Opção A - Health Check Mais Simples:**
Temporariamente, comente o health check no docker-compose.yml:

```yaml
# healthcheck:
#   test: ['CMD-SHELL', 'pg_isready -h localhost -p 5432 -U ${POSTGRES_USER:-admin}']
#   interval: 10s
#   timeout: 5s
#   retries: 5
#   start_period: 30s
```

**Opção B - Aguardar Mais Tempo:**
Se a infraestrutura é lenta, aumente o `start_period`:

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -h localhost -p 5432']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 90s # 1.5 minutos
```

### 6. 🔧 Script de Debug Incluído

Execute o script de diagnóstico no container:

```bash
# No Portainer Console do container postgres:
bash /docker-entrypoint-initdb.d/../scripts/debug-health.sh
```

### 7. 📋 Checklist de Verificação

- [ ] Variáveis POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB definidas
- [ ] Senhas não contêm caracteres que quebram shell (como aspas simples)
- [ ] Container tem recursos suficientes (CPU/RAM)
- [ ] Rede Docker está funcionando
- [ ] Portas não estão em conflito
- [ ] Volume postgres_data não está corrompido

## 🚀 Próximos Passos

1. **Verificar logs** do container no Portainer
2. **Testar health check** manualmente no container
3. **Se necessário**, desabilitar temporariamente o health check
4. **Após funcionamento**, reabilitar o health check gradualmente

---

**Arquivo gerado em:** $(date)
**Versão docker-compose:** Híbrida com health check otimizado
