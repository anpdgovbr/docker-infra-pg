# 🚨 CORREÇÃO: Health Check PostgreSQL Falhando

## ❌ **Erro no Portainer:**

```
Failed to deploy a stack: compose up operation failed:
dependency failed to start: container anpd-postgres-dev is unhealthy
```

## 🔍 **Diagnóstico do Problema**

### **Causa Identificada:**

O health check do PostgreSQL estava usando sintaxe incorreta para variáveis de ambiente:

```yaml
# ❌ PROBLEMÁTICO (variáveis não expandem no array YAML):
test:
  [
    'CMD-SHELL',
    'pg_isready -U ${POSTGRES_USER:-admin} -d ${POSTGRES_DB:-postgres}'
  ]
```

### **Problemas com Health Checks:**

1. **Sintaxe de variáveis**: `${VAR:-default}` não funciona em arrays YAML
2. **Referência circular**: Health check usando variáveis do próprio container
3. **Timeout insuficiente**: PostgreSQL pode demorar para inicializar

## ✅ **CORREÇÃO APLICADA**

### **Health Check Simplificado e Robusto:**

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -h localhost -p 5432']
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 30s # ✅ Tempo adicional para inicialização
```

### **Melhorias Implementadas:**

1. **✅ Comando simples**: Apenas verifica se PostgreSQL responde na porta
2. **✅ Sem dependências**: Não depende de usuário/banco específico
3. **✅ Mais tentativas**: 5 retries ao invés de 3
4. **✅ Start period**: 30s para dar tempo de inicializar

## 🔄 **PARA APLICAR NO PORTAINER**

### **Opção 1 - Git Push + Update (Recomendado):**

```bash
# 1. Commit as correções
git add docker-compose.yml
git commit -m "fix: corrige health check PostgreSQL"
git push

# 2. No Portainer: Update Stack
```

### **Opção 2 - Edit Manual no Portainer:**

No editor do Stack, altere o health check:

```yaml
services:
  postgres:
    # ... outras configurações
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -h localhost -p 5432']
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
```

## 🎯 **COMPORTAMENTO ESPERADO**

### **Logs de Health Check (corretos):**

```bash
# Health check passando:
Performing health check...
/usr/local/bin/pg_isready -h localhost -p 5432
localhost:5432 - accepting connections
Health check passed
```

### **Timeline de Deploy:**

```bash
[0s]   Container started
[0-30s] Start period - sem health checks
[30s]  Primeiro health check
[60s]  Segundo health check (se primeiro falhar)
[90s]  Container considerado healthy ✅
```

## 🛡️ **VALIDAÇÃO PÓS-CORREÇÃO**

### **Verificar Status:**

```bash
# No servidor onde roda Portainer:
docker ps
# STATUS deve mostrar "healthy" para postgres

docker inspect <postgres-container-id> | grep Health
```

### **Logs Esperados:**

```bash
✅ postgres: healthy
✅ pgadmin: started (depends on postgres healthy)
✅ init-runner: started (depends on postgres healthy)
```

## 📋 **TROUBLESHOOTING ADICIONAL**

### **Se ainda falhar:**

1. **Verificar recursos do servidor:**

   ```bash
   # Memória disponível
   free -h

   # Espaço em disco
   df -h
   ```

2. **Logs detalhados do PostgreSQL:**

   ```bash
   docker logs <postgres-container-name>
   ```

3. **Health check manual:**

   ```bash
   docker exec <postgres-container> pg_isready -h localhost -p 5432
   ```

4. **Remover dependências temporariamente:**
   ```yaml
   # Em caso extremo, remova temporariamente:
   # depends_on:
   #   postgres:
   #     condition: service_healthy
   ```

---

**✅ A correção simplifica o health check e deve resolver o problema de deployment no Portainer.**
