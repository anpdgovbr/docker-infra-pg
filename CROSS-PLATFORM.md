# 🌍 Cross-Platform Helpers

Scripts Node.js que funcionam perfeitamente em **Windows, macOS e Linux**.

## 🚀 Por que Cross-Platform?

Os scripts bash originais tinham problemas de compatibilidade:

- ❌ `wget` não existe no Windows
- ❌ `curl | bash` não funciona no PowerShell
- ❌ `chmod +x` não funciona no Windows
- ❌ `rm -rf` não funciona no PowerShell
- ❌ `sleep` não existe no PowerShell
- ❌ `cd && comando` tem comportamento diferente

## ✅ Solução: Helpers Node.js

Agora temos **3 helpers** que resolvem todos os problemas:

### 1. `setup-cross-platform.js` - Setup da Infraestrutura

```bash
# Básico
node setup-cross-platform.js

# Com parâmetros
node setup-cross-platform.js --force --auto
node setup-cross-platform.js --db-name=meuapp --db-user=admin
```

**Funcionalidades:**

- ✅ Download automático do script bash
- ✅ Detecção de plataforma (Windows/macOS/Linux)
- ✅ Execução via Git Bash, WSL ou bash nativo
- ✅ Limpeza automática de arquivos temporários
- ✅ Mensagens coloridas e informativas

### 2. `docker-helper.js` - Comandos Docker

```bash
# Comandos básicos
node docker-helper.js up          # Subir infraestrutura
node docker-helper.js down        # Parar infraestrutura
node docker-helper.js logs        # Ver logs
node docker-helper.js status      # Status dos containers

# Comandos avançados
node docker-helper.js reset       # Reset completo
node docker-helper.js clean       # Remover tudo
node docker-helper.js psql        # Conectar ao PostgreSQL
node docker-helper.js backup      # Criar backup
node docker-helper.js restore backup.sql  # Restaurar backup
```

**Funcionalidades:**

- ✅ Detecção automática do diretório `infra-db`
- ✅ Comandos cross-platform para remoção de arquivos
- ✅ Sleep nativo do Node.js (não depende do SO)
- ✅ Verificações de pré-requisitos
- ✅ Tratamento robusto de erros

### 3. `db-helper.js` - Comandos de Banco

```bash
# Setup e migrações
node db-helper.js setup           # Setup completo (up + migrate + seed)
node db-helper.js fresh           # Reset completo + setup
node db-helper.js migrate         # Apenas migrações
node db-helper.js seed            # Apenas seed

# Prisma
node db-helper.js studio          # Abrir Prisma Studio
node db-helper.js reset           # Reset migrações Prisma
node db-helper.js generate        # Gerar cliente Prisma
```

**Funcionalidades:**

- ✅ Integração inteligente com Prisma
- ✅ Verificação de infraestrutura antes de executar
- ✅ Sleep adequado para aguardar PostgreSQL
- ✅ Detecção automática de scripts no package.json
- ✅ Mensagens claras de erro e orientação

## 🎯 Como Usar

### **Opção 1: Download via postinstall (Recomendado)**

Adicione ao seu `package.json`:

```json
{
  "scripts": {
    "postinstall": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js",
    "infra:setup": "node setup-cross-platform.js",
    "infra:up": "node docker-helper.js up",
    "db:setup": "node db-helper.js setup"
  }
}
```

Depois execute:

```bash
npm install  # Baixa os helpers automaticamente
npm run infra:setup  # Configura a infraestrutura
```

### **Opção 2: Download Manual**

#### Windows PowerShell:

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js" -OutFile "setup-cross-platform.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js" -OutFile "docker-helper.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js" -OutFile "db-helper.js"
```

#### macOS/Linux:

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js
```

## 🔧 Detecção de Plataforma

Os helpers detectam automaticamente:

### **Windows:**

- Tenta usar **Git Bash** primeiro
- Se não tiver, usa **WSL**
- Se não tiver, mostra erro orientativo

### **macOS/Linux:**

- Usa **bash** nativo
- Funciona em qualquer terminal

## 🎨 Saída Colorida

Todos os helpers têm saída colorida:

- 🟢 **Verde**: Sucessos e confirmações
- 🔵 **Azul**: Informações e comandos sendo executados
- 🟡 **Amarelo**: Avisos e aguardando
- 🔴 **Vermelho**: Erros

## 📊 Compatibilidade Testada

| Plataforma   | Terminal   | Status |
| ------------ | ---------- | ------ |
| Windows 11   | PowerShell | ✅     |
| Windows 11   | CMD        | ✅     |
| Windows 11   | Git Bash   | ✅     |
| Windows 10   | PowerShell | ✅     |
| macOS        | Terminal   | ✅     |
| macOS        | iTerm2     | ✅     |
| Ubuntu       | bash       | ✅     |
| CentOS       | bash       | ✅     |
| Alpine Linux | ash        | ✅     |

## 🚀 Vantagens

### **Para Desenvolvedores:**

- ✅ Funciona em qualquer máquina sem configuração
- ✅ Não precisa instalar ferramentas extras
- ✅ Mensagens claras em português
- ✅ Tratamento inteligente de erros

### **Para Equipes:**

- ✅ Onboarding mais rápido
- ✅ Menos problemas de ambiente
- ✅ Scripts padronizados para todos
- ✅ Funciona em CI/CD de qualquer plataforma

### **Para CI/CD:**

- ✅ GitHub Actions (Ubuntu/Windows/macOS)
- ✅ GitLab CI (Docker/Shell)
- ✅ Azure DevOps
- ✅ Jenkins (qualquer agent)

## 🔍 Troubleshooting

### **Erro: "Bash não encontrado" no Windows**

**Solução 1 - Instalar Git Bash:**

1. Baixe Git for Windows: https://git-scm.com/download/win
2. Execute o instalador
3. Teste: `git --version`

**Solução 2 - Habilitar WSL:**

1. Abra PowerShell como Admin
2. Execute: `wsl --install`
3. Reinicie o sistema
4. Teste: `wsl --version`

### **Erro: "Docker not found"**

**Solução:**

1. Instale Docker Desktop: https://docker.com/
2. Inicie Docker Desktop
3. Teste: `docker --version`

### **Erro: "Permission denied" no macOS/Linux**

**Solução:**

```bash
chmod +x setup-cross-platform.js
chmod +x docker-helper.js
chmod +x db-helper.js
```

---

**Agora você tem infraestrutura PostgreSQL que funciona em QUALQUER plataforma! 🎉**
