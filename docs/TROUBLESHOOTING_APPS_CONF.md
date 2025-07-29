# 🚨 TROUBLESHOOTING: apps.conf não encontrado no Portainer

## ❌ **Problema Identificado**

```bash
📋 [Dockerfile] Modo GitOps detectado - usando apps.conf + environment variables
total 12
drwxr-xr-x 2 root root 4096 Jul 29 19:54 .
drwxr-xr-x 1 root root 4096 Jul 29 20:11 ..
-rw-r--r-- 1 root root  238 Jul 29 19:54 servers.json
❌ [generate-gitops-sql.sh] Arquivo config/apps.conf não encontrado
```

**Diagnóstico**: O arquivo `config/apps.conf` existe no repositório mas não está sendo incluído no container do Portainer.

## 🔍 **Possíveis Causas**

### 1️⃣ **Cache do Docker Build no Portainer**

- Portainer pode estar usando uma imagem em cache antiga
- Mudanças no repositório não foram aplicadas

### 2️⃣ **Problema de Sincronização Git**

- Portainer pode não ter baixado a versão mais recente
- Auto-update pode não estar funcionando

### 3️⃣ **Problema no Build Context**

- Dockerfile pode não estar copiando o arquivo corretamente
- Volume mount pode estar sobrescrevendo

## ✅ **SOLUÇÕES IMPLEMENTADAS**

### 1️⃣ **Debug Adicionado ao Dockerfile**

```dockerfile
# Garante que apps.conf existe (debug)
RUN ls -la config/ && \
    if [[ ! -f "config/apps.conf" ]]; then \
      echo "❌ apps.conf não encontrado no build!"; \
      exit 1; \
    else \
      echo "✅ apps.conf encontrado no build"; \
    fi
```

### 2️⃣ **Fallback no generate-gitops-sql.sh**

```bash
# Se apps.conf não existir, cria um básico
if [[ ! -f "config/apps.conf" ]]; then
  echo "🔄 Criando apps.conf básico como fallback..."
  cat > config/apps.conf << 'EOF'
backlog:backlog_dim_dev:backlog_user_db
controladores:controladores_api_dev:controladores_user
EOF
fi
```

### 3️⃣ **Diagnóstico Detalhado**

- Lista conteúdo de `config/`
- Busca arquivos `.conf` em todo container
- Logs detalhados para debug

## 🔄 **AÇÕES PARA RESOLVER**

### **Opção 1: Forçar Rebuild no Portainer**

1. No Portainer Stack: **Settings** → **Build**
2. Marcar: ☑️ **Re-pull image**
3. Marcar: ☑️ **Rebuild**
4. **Update Stack**

### **Opção 2: Limpar Cache do Docker**

1. SSH no servidor Portainer
2. Executar:
   ```bash
   docker system prune -a
   docker builder prune -a
   ```
3. Redeploy Stack

### **Opção 3: Commit Dummy para Forçar Update**

```bash
# No repositório local:
git commit --allow-empty -m "force: trigger Portainer rebuild"
git push

# No Portainer: Update Stack
```

### **Opção 4: Criar apps.conf Manualmente (Temporário)**

1. No Portainer Stack: **Editor**
2. Adicionar volume bind explícito:
   ```yaml
   volumes:
     - ./config/apps.conf:/app/config/apps.conf:ro
   ```

## 🎯 **VERIFICAÇÃO PÓS-CORREÇÃO**

Logs esperados após correção:

```bash
🚀 [generate-gitops-sql.sh] Gerando SQLs para GitOps/Portainer...
📁 [generate-gitops-sql.sh] Conteúdo de config/:
-rw-r--r-- 1 root root  XXX apps.conf
-rw-r--r-- 1 root root  238 servers.json
📱 [generate-gitops-sql.sh] Processando aplicação: backlog
✅ [generate-gitops-sql.sh] Todos os SQLs gerados com sucesso!
```

## 🚨 **Se Nada Funcionar**

### **Debug Manual no Container**

```bash
# Acesse o container em execução:
docker exec -it <container-name> /bin/bash

# Verifique arquivos:
ls -la /app/config/
cat /app/config/apps.conf

# Teste manual:
bash /app/scripts/generate-gitops-sql.sh
```

### **Workaround Temporário**

Se nada resolver, use mode LOCAL temporariamente:

```bash
# Environment Variables no Portainer:
GITOPS_MODE=false
APPS_CONFIG=backlog:backlog_dim_dev:backlog_user_db:SENHA1,controladores:controladores_api_dev:controladores_user:SENHA2
```

---

**Nota**: As correções aplicadas incluem fallbacks que devem resolver o problema automaticamente. O apps.conf será criado dinamicamente se não existir.
