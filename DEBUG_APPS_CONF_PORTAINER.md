# 🔍 DEBUG: config/apps.conf no Portainer

## ✅ **Verificações Realizadas**

### 1️⃣ **Git Status:**
```bash
# ✅ apps.conf está commitado e versionado:
git ls-files config/ → config/apps.conf

# ✅ Não está sendo ignorado:
git check-ignore config/apps.conf → (sem output = não ignorado)

# ✅ Histórico de commits existe:
git log config/apps.conf → c2f0e38 feat: Implementação...
```

### 2️⃣ **Arquivos Locais:**
```bash
# ✅ Arquivo existe localmente:
dir config/
apps.conf    1246 bytes    29/07/2025 16:22
servers.json  240 bytes    29/07/2025 16:45
```

### 3️⃣ **Gitignore Limpo:**
```bash
# ✅ Removida referência órfã:
- !.env.portainer.example  # ❌ Arquivo inexistente
+ (removido)

# ✅ apps.conf não está no .gitignore
# ✅ Não há .dockerignore
```

## 🚨 **PROBLEMA IDENTIFICADO**

### **Portainer não está baixando versão atual do repositório**

**Possíveis causas:**
1. **Cache do Git no Portainer**
2. **Auto-update desabilitado** 
3. **Branch incorreta** (não está em main)
4. **Permissões de acesso** ao repositório
5. **Webhook não configurado**

## 🔧 **SOLUÇÕES PARA PORTAINER**

### **Opção 1: Forçar Pull Manual**
```bash
# No Portainer Stack:
1. Settings → GitOps
2. ☑️ Force pull repository
3. Update Stack
```

### **Opção 2: Commit Vazio (Trigger)**
```bash
# Força o Portainer a detectar mudança:
git commit --allow-empty -m "trigger: force Portainer update for apps.conf"
git push origin main
```

### **Opção 3: Verificar Configuração GitOps**
```bash
# No Portainer Stack Settings:
✅ Repository URL: https://github.com/anpdgovbr/docker-infra-pg
✅ Reference: refs/heads/main (não master!)
✅ Compose file: docker-compose.yml
✅ Auto-update: Enabled
✅ Fetch interval: 5m (ou menor)
```

### **Opção 4: Recrear Stack**
```bash
# Em caso extremo:
1. Remove Stack atual
2. Cria novo Stack GitOps
3. Configura repository settings
4. Deploy
```

## 🎯 **WORKAROUND TEMPORÁRIO**

### **Se nada funcionar, adicione volume explícito:**
```yaml
# No docker-compose.yml (temporário):
services:
  init-runner:
    volumes:
      - ./init:/app/init
      - ./config:/app/config
      - ./config/apps.conf:/app/config/apps.conf:ro  # ✅ Força cópia
```

### **Ou use modo local temporariamente:**
```bash
# Environment Variables no Portainer:
GITOPS_MODE=false
APPS_CONFIG=backlog:backlog_dim_dev:backlog_user_db:SENHA1,controladores:controladores_api_dev:controladores_user:SENHA2
```

## 🔍 **VALIDAÇÃO**

### **Para confirmar se resolveu:**
```bash
# Logs esperados do init-runner:
📁 [generate-gitops-sql.sh] Conteúdo de config/:
-rw-r--r-- 1 root root 1246 apps.conf      # ✅ ESTE deve aparecer
-rw-r--r-- 1 root root  240 servers.json

# Se não aparecer:
❌ Portainer ainda não baixou a versão atual do repositório
```

---

**📋 Conclusão: O problema NÃO está no .gitignore ou configuração local. É um problema de sincronização Git no Portainer.**
