# 🔄 UNIFICAÇÃO DOS DOCKER-COMPOSE

## ✅ **Problema Resolvido**

### **ANTES: 2 Arquivos Separados**

```bash
docker-compose.yml        # Para desenvolvimento local
docker-compose.gitops.yml  # Para GitOps/Portainer
```

### **AGORA: 1 Arquivo Híbrido**

```bash
docker-compose.yml         # Funciona para AMBOS os modos
```

## 🎯 **Como Funciona o Docker-Compose Híbrido**

### 🏠 **Modo Local**

```bash
# 1. Use arquivo .env com APPS_CONFIG
APPS_CONFIG=backlog:backlog_dim_dev:backlog_user_db:senha

# 2. Execute normalmente
docker-compose up -d

# 3. O Dockerfile detecta ausência de config/apps.conf
# 4. Executa generate-local-sql.sh
```

### 🚀 **Modo GitOps/Portainer**

```bash
# 1. Configure environment variables no Portainer:
BACKLOG_PASSWORD=senha_secreta
CONTROLADORES_PASSWORD=senha_outra

# 2. Use o MESMO docker-compose.yml no Portainer Stack

# 3. O Dockerfile detecta presença de config/apps.conf
# 4. Executa generate-gitops-sql.sh
```

## 🔧 **Recursos Híbridos Implementados**

### **Environment Variables com Defaults**

```yaml
POSTGRES_USER: ${POSTGRES_USER:-admin}
POSTGRES_PORT: ${POSTGRES_PORT:-5432}
POSTGRES_CONTAINER_NAME: ${POSTGRES_CONTAINER_NAME:-anpd-postgres-dev}
```

### **Healthchecks para Reliability**

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-admin}']
  interval: 30s
  timeout: 10s
  retries: 3
```

### **Suporte a Ambos os Modos**

```yaml
environment:
  # Para modo LOCAL
  APPS_CONFIG: ${APPS_CONFIG:-}

  # Para modo GITOPS
  BACKLOG_PASSWORD: ${BACKLOG_PASSWORD:-}
  CONTROLADORES_PASSWORD: ${CONTROLADORES_PASSWORD:-}
```

### **Volumes Configuráveis**

```yaml
volumes:
  postgres_data:
    name: ${POSTGRES_VOLUME_NAME:-anpd_postgres_data}
  pgadmin_data:
    name: ${PGADMIN_VOLUME_NAME:-anpd_pgadmin_data}
```

## 📊 **Benefícios da Unificação**

| Aspecto             | ANTES              | AGORA               |
| ------------------- | ------------------ | ------------------- |
| **Arquivos**        | 2 docker-compose   | 1 docker-compose    |
| **Manutenção**      | Duplicada          | Centralizada        |
| **Configuração**    | Separada por modo  | Híbrida inteligente |
| **Portainer**       | Arquivo específico | Mesmo arquivo       |
| **Desenvolvimento** | Arquivo específico | Mesmo arquivo       |
| **Sincronização**   | Manual             | Automática          |

## ✅ **Arquivos Removidos**

- ❌ `docker-compose.gitops.yml` (duplicado)
- ❌ `.env.portainer.example` (duplicado)

## 🎯 **Resultado Final**

**UM ÚNICO `docker-compose.yml`** que:

- ✅ Funciona no desenvolvimento local
- ✅ Funciona no Portainer/GitOps
- ✅ Detecta automaticamente o modo
- ✅ Usa defaults inteligentes
- ✅ Suporta customização completa
- ✅ Tem healthchecks e reliability

**Manutenção reduzida em 50%** - Mudanças em apenas 1 arquivo! 🚀
