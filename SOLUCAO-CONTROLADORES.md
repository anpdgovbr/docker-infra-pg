# 🔥 SOLUÇÃO RÁPIDA: Banco controladores_api_dev não criado

## 🎯 Problema Identificado

Você está vendo estes logs:

```
ℹ️ [generate-gitops-sql.sh] Arquivo init/11-create-controladores-db.sql já existe - pulando
PostgreSQL Database directory appears to contain a database; Skipping initialization
```

**O que está acontecendo:**

- PostgreSQL detecta volume existente e **NÃO executa** scripts de inicialização
- Apenas o banco `backlog_dim_dev` foi criado em deploy anterior
- O banco `controladores_api_dev` ficou faltando

## ✅ SOLUÇÃO IMEDIATA

### Passo 1: Verificar estado atual

No **console do container postgres** no Portainer:

```bash
bash /app/scripts/debug-quick.sh
```

### Passo 2: Criar banco controladores (se faltando)

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

Para evitar esse problema no futuro:

**Opção A - Limpeza completa:**

```bash
# 1. Parar stack no Portainer
# 2. Remover volumes:
docker volume rm anpd_postgres_data anpd_pgadmin_data
# 3. Deploy novamente (vai criar tudo do zero)
```

**Opção B - Usar script automático:**

```bash
# No console do container postgres:
bash /app/scripts/run-sql-files.sh
```

## 📋 Checklist de Verificação

- [ ] `CONTROLADORES_PASSWORD` definida no Portainer Stack
- [ ] Container postgres está saudável (green/healthy)
- [ ] Variáveis obrigatórias definidas
- [ ] Script de debug executado: `bash /app/scripts/debug-quick.sh`
- [ ] Banco controladores_api_dev criado com sucesso

---

**Arquivo criado:** 29/07/2025
**Situação:** Problema específico do banco controladores faltando
