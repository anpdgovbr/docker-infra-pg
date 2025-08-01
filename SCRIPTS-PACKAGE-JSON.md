# 📦 Templates de Scripts para package.json (Cross-Platform)

Este arquivo contém templates **verdadeiramente cross-platform** que funcionam perfeitamente em Windows, macOS e Linux.

## 🌍 **NOVIDADE: Scripts Cross-Platform**

Agora todos os scripts funcionam em **qualquer plataforma** usando Node.js! 🎉

## 🎯 Scripts Básicos (Mínimo Necessário)

Para projetos simples que só precisam do essencial:

```json
{
  "scripts": {
    "postinstall": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js",
    "infra:setup": "node setup-cross-platform.js",
    "infra:up": "node docker-helper.js up",
    "infra:down": "node docker-helper.js down",
    "db:setup": "node db-helper.js setup"
  }
}
```

## 🚀 Scripts Completos (Recomendado) - Cross-Platform

Para desenvolvimento profissional com todas as funcionalidades:

```json
{
  "scripts": {
    "postinstall": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js",
    "infra:setup": "node setup-cross-platform.js",
    "infra:setup:manual": "node setup-cross-platform.js --manual",
    "infra:setup:force": "node setup-cross-platform.js --force --auto",
    "infra:up": "node docker-helper.js up",
    "infra:down": "node docker-helper.js down",
    "infra:logs": "node docker-helper.js logs",
    "infra:reset": "node docker-helper.js reset",
    "infra:clean": "node docker-helper.js clean",
    "infra:psql": "node docker-helper.js psql",
    "infra:status": "node docker-helper.js status",
    "infra:backup": "node docker-helper.js backup",
    "db:setup": "node db-helper.js setup",
    "db:fresh": "node db-helper.js fresh",
    "db:migrate": "node db-helper.js migrate",
    "db:seed": "node db-helper.js seed",
    "db:studio": "node db-helper.js studio",
    "db:reset": "node db-helper.js reset",
    "dev": "npm run db:setup && next dev"
  }
}
```

## 🏢 Scripts para CI/CD e Produção - Cross-Platform

Para ambientes automatizados e produção:

```json
{
  "scripts": {
    "postinstall": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js",
    "infra:setup": "node setup-cross-platform.js",
    "infra:setup:ci": "node setup-cross-platform.js --force --auto",
    "infra:setup:test": "node setup-cross-platform.js --force --db-name=test_db --auto",
    "infra:setup:prod": "node setup-cross-platform.js --force --db-name=prod_db --db-user=prod_user --db-password=${PROD_DB_PASSWORD}",
    "infra:up": "node docker-helper.js up",
    "infra:down": "node docker-helper.js down",
    "infra:logs": "node docker-helper.js logs",
    "infra:reset": "node docker-helper.js reset",
    "infra:backup": "node docker-helper.js backup",
    "infra:restore": "node docker-helper.js restore",
    "db:setup": "node db-helper.js setup",
    "db:fresh": "node db-helper.js fresh",
    "db:migrate": "node db-helper.js migrate",
    "db:seed": "node db-helper.js seed",
    "test:integration": "npm run infra:setup:test && npm run test",
    "build:prod": "npm run infra:setup:prod && npm run build"
  }
}
```

## 📱 Next.js + Prisma (Template ANPD Padrão) - Cross-Platform

Para projetos Next.js com Prisma (mais comum na ANPD):

```json
{
  "name": "@anpdgovbr/meu-projeto",
  "scripts": {
    "postinstall": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js",
    "dev": "npm run db:setup && next dev",
    "build": "next build",
    "start": "next start",
    "infra:setup": "node setup-cross-platform.js",
    "infra:setup:manual": "node setup-cross-platform.js --manual",
    "infra:up": "node docker-helper.js up",
    "infra:down": "node docker-helper.js down",
    "infra:logs": "node docker-helper.js logs",
    "infra:reset": "node docker-helper.js reset",
    "infra:clean": "node docker-helper.js clean",
    "db:setup": "node db-helper.js setup",
    "db:fresh": "node db-helper.js fresh",
    "db:migrate": "node db-helper.js migrate",
    "db:seed": "node db-helper.js seed",
    "db:studio": "node db-helper.js studio",
    "db:reset": "node db-helper.js reset",
    "prisma:migrate": "npx prisma migrate dev",
    "prisma:seed": "npx prisma db seed",
    "prisma:studio": "npx prisma studio",
    "prisma:reset": "npx prisma migrate reset --force"
  }
}
```

## 🔧 Node.js/Express + Prisma - Cross-Platform

Para APIs e backends:

```json
{
  "name": "@anpdgovbr/minha-api",
  "scripts": {
    "postinstall": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js",
    "dev": "npm run db:setup && nodemon src/server.js",
    "start": "node src/server.js",
    "infra:setup": "node setup-cross-platform.js",
    "infra:up": "node docker-helper.js up",
    "infra:down": "node docker-helper.js down",
    "infra:logs": "node docker-helper.js logs",
    "infra:reset": "node docker-helper.js reset",
    "db:setup": "node db-helper.js setup",
    "db:fresh": "node db-helper.js fresh",
    "db:migrate": "node db-helper.js migrate",
    "db:seed": "node db-helper.js seed",
    "db:studio": "node db-helper.js studio",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:integration": "npm run infra:setup:test && npm run test"
  }
}
```

## 🐳 Docker + GitHub Actions (CI/CD) - Cross-Platform

Para projetos com pipeline automatizado:

```json
{
  "scripts": {
    "postinstall": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js",
    "infra:setup": "node setup-cross-platform.js",
    "infra:setup:ci": "node setup-cross-platform.js --force --auto",
    "infra:up": "node docker-helper.js up",
    "infra:down": "node docker-helper.js down",
    "db:setup": "node db-helper.js setup",
    "db:setup:ci": "npm run infra:setup:ci && npm run db:setup",
    "test": "jest",
    "test:ci": "npm run db:setup:ci && npm run test",
    "build": "next build",
    "build:ci": "npm run db:setup:ci && npm run build",
    "deploy": "npm run build && npm run deploy:vercel"
  }
}
```

## 🌍 **VANTAGENS dos Scripts Cross-Platform**

### ✅ **Funcionam em Qualquer Plataforma**

- 🪟 **Windows** (PowerShell, CMD, Git Bash)
- 🍎 **macOS** (Terminal, iTerm)
- 🐧 **Linux** (bash, zsh, fish)

### ✅ **Detecção Automática**

- Detecta automaticamente a plataforma
- Usa o melhor método para cada SO
- Fallbacks inteligentes para máxima compatibilidade

### ✅ **Sem Dependências Externas**

- Não precisa de `wget`, `curl`, `bash` específicos
- Usa apenas Node.js (que já está instalado)
- Funciona em qualquer ambiente de desenvolvimento

### ✅ **Tratamento de Erros Robusto**

- Mensagens claras em português
- Verificações de pré-requisitos
- Logs coloridos e informativos

````

## 🎯 Scripts por Caso de Uso

### **Setup Inicial (Primeira vez)**

```bash
npm run infra:setup      # Automático via curl
npm run dev              # Inicia desenvolvimento
````

### **Desenvolvimento Diário**

```bash
npm run infra:up         # Só subir banco (se já configurado)
npm run dev              # Desenvolvimento
```

### **Reset Completo**

```bash
npm run db:fresh         # Reset banco + migrations + seed
npm run dev              # Desenvolvimento
```

### **Limpeza Total**

```bash
npm run infra:clean      # Remove tudo da infra
npm run infra:setup      # Setup do zero
```

### **CI/CD**

```bash
npm run infra:setup:ci   # Setup automático forçado
npm run test             # Testes
npm run build            # Build
```

## 💡 Dicas de Personalização

### **Helpers Individuais:**

Você pode usar os helpers diretamente no terminal:

```bash
# Setup da infraestrutura
node setup-cross-platform.js --force --auto

# Comandos Docker
node docker-helper.js up
node docker-helper.js down
node docker-helper.js logs
node docker-helper.js reset
node docker-helper.js psql
node docker-helper.js backup

# Comandos de Banco
node db-helper.js setup
node db-helper.js fresh
node db-helper.js migrate
node db-helper.js seed
node db-helper.js studio
```

### **Download Manual dos Helpers:**

Se preferir baixar os helpers manualmente:

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js" -OutFile "setup-cross-platform.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js" -OutFile "docker-helper.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js" -OutFile "db-helper.js"

# macOS/Linux
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js
```

### **Customizar para seu projeto:**

1. **Altere o nome do banco:**

```bash
./setup-infra.sh --force --db-name=meu_projeto_especifico
```

2. **Use variáveis de ambiente:**

```json
{
  "scripts": {
    "infra:setup:prod": "curl -sSL https://raw.../setup-infra.sh | bash -s -- --force --db-name=$PROJECT_NAME --db-user=$DB_USER --db-password=$DB_PASSWORD"
  }
}
```

3. **Adicione validações:**

```json
{
  "scripts": {
    "predev": "npm run db:setup",
    "prebuild": "npm run prisma:migrate"
  }
}
```

4. **Integre com outros tools:**

```json
{
  "scripts": {
    "dev:full": "npm run db:setup && concurrently \"npm run dev\" \"npm run prisma:studio\"",
    "test:full": "npm run db:fresh && npm run test && npm run test:e2e"
  }
}
```

---

**Escolha o template que melhor se adapta ao seu projeto e personalize conforme necessário! 🚀**
