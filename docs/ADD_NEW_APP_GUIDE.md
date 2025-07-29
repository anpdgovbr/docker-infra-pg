# 📝 GUIA: Como Adicionar uma Nova Aplicação (appX)

## 🎯 **Estado Atual do Sistema**

O projeto está configurado para **dual-mode**:

- 🏠 **Local**: Usa `.env` com `APPS_CONFIG` (formato completo)
- 🚀 **GitOps**: Usa `config/apps.conf` + variables de ambiente

## 🔧 **Para Adicionar appX - Passo a Passo**

### 1️⃣ **Para Desenvolvimento Local** (.env)

Edite o arquivo `.env`:

```bash
# ANTES:
APPS_CONFIG=backlog:backlog_dim_dev:backlog_user_db:backXxcNn*Ch5HVSb,controladores:controladores_api_dev:controladores_user:contrXxcNn*Ch5HVSb

# DEPOIS (adicionar appX):
APPS_CONFIG=backlog:backlog_dim_dev:backlog_user_db:backXxcNn*Ch5HVSb,controladores:controladores_api_dev:controladores_user:contrXxcNn*Ch5HVSb,appx:appx_dev:appx_user:appx_senha_123
```

### 2️⃣ **Para GitOps/Portainer** (config/apps.conf)

Edite o arquivo `config/apps.conf`:

```bash
# Aplicação: API de Controladores LGPD
controladores:controladores_api_dev:controladores_user

# Aplicação: Sistema AppX (NOVA)
appx:appx_dev:appx_user
```

### 3️⃣ **Senhas para GitOps** (.env para teste local do GitOps)

Adicione no `.env` (seção GitOps):

```bash
# Senhas das aplicações (para GitOps/Portainer)
BACKLOG_PASSWORD=backXxcNn*Ch5HVSb
CONTROLADORES_PASSWORD=contrXxcNn*Ch5HVSb
APPX_PASSWORD=appx_senha_123  # ✅ NOVA
```

### 4️⃣ **Variáveis no Portainer Stack**

No Portainer, adicione a variável de ambiente:

```bash
APPX_PASSWORD=appx_senha_secreta_producao
```

## 🚀 **Comandos de Execução**

### 🏠 **Modo Local:**

```bash
# Regenera SQLs com nova app
bash scripts/generate-local-sql.sh

# Reinicia containers
docker-compose down
docker-compose up -d
```

### 🚀 **Modo GitOps:**

```bash
# Commit da mudança em apps.conf
git add config/apps.conf
git commit -m "feat: adiciona aplicação appX"
git push

# No Portainer: Update Stack ou Redeploy
# Usa o MESMO docker-compose.yml unificado
```

## 📋 **Checklist Completo**

### ✅ **Para Modo Local:**

- [ ] Adicionar `appx:appx_dev:appx_user:senha` no `APPS_CONFIG` (`.env`)
- [ ] Executar `bash scripts/generate-local-sql.sh`
- [ ] Reiniciar containers: `docker-compose down && docker-compose up -d`

### ✅ **Para Modo GitOps:**

- [ ] Adicionar `appx:appx_dev:appx_user` no `config/apps.conf`
- [ ] Configurar `APPX_PASSWORD` no Portainer
- [ ] Commit + Push do `apps.conf`
- [ ] Update/Redeploy Stack no Portainer

### ✅ **Verificação:**

- [ ] pgAdmin mostra novo banco `appx_dev`
- [ ] Usuário `appx_user` criado com permissões
- [ ] Conexão funciona com credenciais configuradas

## 🔒 **Salvaguardas Automáticas**

Se esquecer de configurar a senha:

```bash
⚠️  Senha não encontrada para appx (variável APPX_PASSWORD)
    No Portainer, configure a variável de ambiente: APPX_PASSWORD
```

O sistema **não quebra** - outras apps continuam funcionando! 🛡️

## 📁 **Arquivos Modificados**

| Modo       | Arquivos Alterados                      |
| ---------- | --------------------------------------- |
| **Local**  | `.env` (APPS_CONFIG)                    |
| **GitOps** | `config/apps.conf` + Portainer Env Vars |

---

**🎯 Processo Otimizado**: Apenas **1 arquivo** por modo + configuração de senha!
