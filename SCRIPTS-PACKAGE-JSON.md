# 📦 Templates de Scripts para package.json (Cross-Platform)

Este arquivo contém templates **verdadeiramente cross-platform** que funcionam perfeitamente em Windows, macOS e Linux.

## 🌍 **NOVIDADE: Scripts Cross-Platform**

Agora todos os scripts funcionam em **qualquer plataforma** usando Node.js! 🎉

## 🎯 Scripts Básicos (Mínimo Necessário)

Para projetos simples que só precisam do essencial:

```json
{
  "scripts": {
    "infra:setup": "mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:db:init": "node .infra/db-helper.js setup"
  }
}
```

**💡 Ainda mais fácil:** Use o auto-setup

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
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
    "infra:db:init": "node db-helper.js setup",
    "infra:db:fresh": "node db-helper.js fresh",
    "infra:db:migrate": "node db-helper.js migrate",
    "infra:db:seed": "node db-helper.js seed",
    "infra:db:studio": "node db-helper.js studio",
    "infra:db:reset": "node db-helper.js reset",
    "dev": "npm run infra:db:init && next dev"
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
    "infra:db:init": "node db-helper.js setup",
    "infra:db:fresh": "node db-helper.js fresh",
    "infra:db:migrate": "node db-helper.js migrate",
    "infra:db:seed": "node db-helper.js seed",
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
    "dev": "npm run infra:db:init && next dev",
    "build": "next build",
    "start": "next start",
    "infra:setup": "node setup-cross-platform.js",
    "infra:setup:manual": "node setup-cross-platform.js --manual",
    "infra:up": "node docker-helper.js up",
    "infra:down": "node docker-helper.js down",
    "infra:logs": "node docker-helper.js logs",
    "infra:reset": "node docker-helper.js reset",
    "infra:clean": "node docker-helper.js clean",
    "infra:db:init": "node db-helper.js setup",
    "infra:db:fresh": "node db-helper.js fresh",
    "infra:db:migrate": "node db-helper.js migrate",
    "infra:db:seed": "node db-helper.js seed",
    "infra:db:studio": "node db-helper.js studio",
    "infra:db:reset": "node db-helper.js reset",
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
    "dev": "npm run infra:db:init && nodemon src/server.js",
    "start": "node src/server.js",
    "infra:setup": "node setup-cross-platform.js",
    "infra:up": "node docker-helper.js up",
    "infra:down": "node docker-helper.js down",
    "infra:logs": "node docker-helper.js logs",
    "infra:reset": "node docker-helper.js reset",
    "infra:db:init": "node db-helper.js setup",
    "infra:db:fresh": "node db-helper.js fresh",
    "infra:db:migrate": "node db-helper.js migrate",
    "infra:db:seed": "node db-helper.js seed",
    "infra:db:studio": "node db-helper.js studio",
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
    "infra:db:init": "node db-helper.js setup",
    "infra:db:init:ci": "npm run infra:setup:ci && npm run infra:db:init",
    "test": "jest",
    "test:ci": "npm run infra:db:init:ci && npm run test",
    "build": "next build",
    "build:ci": "npm run infra:db:init:ci && npm run build",
    "deploy": "npm run build && npm run deploy:vercel"
  }
}
```

## �️ **Template para Projetos ANPD Existentes**

Para projetos como `@anpdgovbr/backlog-dim` que já têm scripts estabelecidos:

```json
{
  "scripts": {
    "build": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=1 npx prisma generate && next build",
    "dev": "npm run build-routes && npm run infra:db:init && next dev --turbopack",
    "start": "next start",

    "prisma:migrate": "npx prisma migrate dev --name init",
    "prisma:push": "npx prisma db push",
    "prisma:reset": "npx prisma migrate reset --force",
    "prisma:seed": "npx prisma db seed",
    "prisma:studio": "npx prisma studio",

    "db:reset": "npx prisma migrate reset --force",
    "db:seed": "npx tsx prisma/seed.ts",

    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > db-helper.js && node setup-cross-platform.js",
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
    "infra:db:init": "node db-helper.js setup",
    "infra:db:fresh": "node db-helper.js fresh"
  }
}
```

### **✅ Vantagens desta Abordagem:**

1. **Sem Conflitos**: Scripts da infraestrutura usam prefixo `infra:*`
2. **Preserva Scripts Existentes**: Mantém todos os scripts do Prisma e projeto
3. **Integração Simples**: Apenas adiciona `npm run infra:db:init` no script `dev`
4. **Flexibilidade**: Pode usar tanto scripts da infra quanto scripts nativos do Prisma

### **📝 Como Integrar em Projeto Existente:**

1. **Adicione os scripts da infraestrutura** ao seu `package.json` existente
2. **Modifique apenas o script `dev`** para incluir `npm run infra:db:init &&`
3. **Mantenha todos os outros scripts** como estão
4. **Execute uma vez**: `npm run infra:setup` para configurar

### **🎯 Scripts de Uso Diário:**

```bash
# Primeira vez (setup da infraestrutura)
npm run infra:setup

# Desenvolvimento diário
npm run dev  # Já inclui infra:db:init

# Se quiser usar só a infraestrutura
npm run infra:up

# Se quiser usar scripts Prisma nativos
npm run prisma:studio
npm run prisma:migrate
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

### **Uso Misto (Infraestrutura + Prisma Nativo)**

```bash
# Usar infraestrutura para banco local
npm run infra:up

# Usar comandos Prisma nativos
npm run prisma:studio
npm run prisma:migrate
npm run prisma:seed

# Ou usar helpers da infraestrutura
npm run infra:db:studio
npm run infra:db:migrate
npm run infra:db:seed
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
