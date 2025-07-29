# 🔧 CONFIGURAÇÃO CORRETA PARA PORTAINER

## ❌ **Problemas Encontrados nos Logs**

1. **Health Check PostgreSQL**: Tentando conectar no banco "admin" (inexistente)
2. **Modo GitOps não detectado**: Container executou em modo local
3. **APPS_CONFIG usado no GitOps**: Deveria usar config/apps.conf + senhas individuais

## ✅ **CORREÇÕES APLICADAS**

### 1️⃣ **Health Check Corrigido**

```yaml
# ANTES (❌):
pg_isready -U ${POSTGRES_USER:-admin}

# AGORA (✅):
pg_isready -U ${POSTGRES_USER:-admin} -d ${POSTGRES_DB:-postgres}
```

### 2️⃣ **Detecção de Modo Melhorada**

```bash
# Nova lógica no Dockerfile:
if [[ "$GITOPS_MODE" == "true" ]] || [[ -f "config/apps.conf" && -n "$BACKLOG_PASSWORD" ]]; then
  # Modo GitOps
else
  # Modo Local
fi
```

### 3️⃣ **Variável GITOPS_MODE Adicionada**

```yaml
environment:
  GITOPS_MODE: ${GITOPS_MODE:-false} # Força modo GitOps
```

## 🚀 **CONFIGURAÇÃO PORTAINER STACK**

### **Environment Variables (copie para o Portainer):**

```bash
# ============================================================================
# CONFIGURAÇÃO BÁSICA
# ============================================================================
POSTGRES_USER=admin
POSTGRES_PASSWORD=SENHA_SUPER_SECRETA_PRODUCAO
POSTGRES_DB=postgres
POSTGRES_TIMEZONE=America/Sao_Paulo

# ============================================================================
# PGADMIN
# ============================================================================
PGLADMIN_DEFAULT_EMAIL=admin@anpd.gov.br
PGADMIN_DEFAULT_PASSWORD=SENHA_PGADMIN_PRODUCAO

# ============================================================================
# MODO GITOPS (IMPORTANTE!)
# ============================================================================
GITOPS_MODE=true

# ============================================================================
# SENHAS DAS APLICAÇÕES (baseadas em config/apps.conf)
# ============================================================================
BACKLOG_PASSWORD=senha_backlog_producao_segura
CONTROLADORES_PASSWORD=senha_controladores_producao_segura

# ============================================================================
# OPCIONAIS (use defaults se não especificado)
# ============================================================================
# POSTGRES_PORT=5432
# PGADMIN_PORT=8085
# NETWORK_NAME=anpd_postgres_network
```

### **Stack Configuration:**

```yaml
# Repository URL:
https://github.com/anpdgovbr/docker-infra-pg

# Compose File Path:
docker-compose.yml

# Auto-update:
✅ Enabled
```

## 🎯 **COMPORTAMENTO ESPERADO APÓS CORREÇÃO**

### **Logs do init-runner (corretos):**

```bash
🚀 [Dockerfile] Container iniciado. Detectando modo de operação...
📋 [Dockerfile] Modo GitOps detectado - usando apps.conf + environment variables
🔧 [generate-gitops-sql.sh] Gerando SQLs para GitOps/Portainer...
📱 [generate-gitops-sql.sh] Processando aplicação: backlog
🔧 [generate-gitops-sql.sh] Gerando SQL para backlog
✅ [generate-gitops-sql.sh] Todos os SQLs gerados com sucesso!
```

### **Logs do PostgreSQL (corretos):**

```bash
# Health checks passando:
2025-07-29 19:54:39.984 UTC [77] LOG: connection received
# Sem mais erros "database admin does not exist"
```

## 🔄 **PRÓXIMOS PASSOS**

1. **Commit as correções**: `git add . && git commit -m "fix: corrige health check e detecção GitOps"`
2. **Push**: `git push`
3. **Redeploy no Portainer**: Stack → Update/Redeploy
4. **Configurar variáveis**: Adicionar `GITOPS_MODE=true` nas environment variables
5. **Verificar logs**: Confirmar modo GitOps detectado

## 🛡️ **VALIDAÇÃO**

Após redeploy, verificar nos logs:

- ✅ `📋 [Dockerfile] Modo GitOps detectado`
- ✅ `[generate-gitops-sql.sh]` executando
- ✅ Health checks do PostgreSQL passando
- ✅ pgAdmin funcionando sem erros
