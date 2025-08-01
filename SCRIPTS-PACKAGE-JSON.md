# 📦 Templates de Scripts para package.json (Cross-Platform)

Este arquivo contém templates **verdadeiramente cross-platform** que funcionam perfeitamente em Windows, macOS e Linux.

## 🌍 **NOVIDADE: Scripts Cross-Platform**

Agora todos os scripts funcionam em **qualquer OS que rode Node.js!** 🎉

> **⚠️ IMPORTANTE para projetos ES Modules:**  
> Se seu projeto usa `"type": "module"` no package.json, use nosso **auto-setup** que detecta automaticamente e configura as extensões corretas:
>
> ```bash
> curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
> ```

## 🚨 **Problemas Comuns e Soluções**

### **Problema: PowerShell cria pasta `-p`**

❌ **Comando antigo** (criava pasta `-p`):

```bash
mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul
```

✅ **Solução**: Usar apenas `curl` direto (pasta `.infra` criada automaticamente):

```bash
curl -sSL https://url -o .infra/arquivo.js
```

### **Problema: ES Modules (`"type": "module"`)**

❌ **Erro comum**:

```
Error [ERR_REQUIRE_ESM]: require() of ES modules is not supported
```

✅ **Solução**: Auto-setup detecta e usa extensão `.cjs`:

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

### **Setup Inicial (Primeira vez)**

```bash
npm run infra:setup      # Baixa helpers + configura infraestrutura
npm run dev              # Inicia desenvolvimento (inclui infra:db:init)
```

### **Desenvolvimento Diário**

```bash
npm run infra:up         # Só subir banco (se já configurado)
npm run dev              # Desenvolvimento (já inclui banco)
```

### **Reset Completo**

````bash
npm run infra:db:fresh   # Reset banco + migrations + seed
npm run dev              # Desenvolvimento
```do Node.js! 🎉

## **🎯 Templates Recomendados por Cenário**

### **1. Projeto Basic (Mínimo essencial)**

```json
{
  "scripts": {
    "infra:setup": "curl -fsSL https://raw.githubusercontent.com/seu-usuario/docker-infra-pg/main/setup-cross-platform.js | node",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:reset": "node .infra/docker-helper.js reset",
    "dev": "npm run infra:up && npm run start:dev",
    "start:dev": "nodemon src/index.js"
  }
}
````

**💡 Ainda mais fácil:** Use o auto-setup

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

## 🚀 Scripts Completos (Recomendado) - Cross-Platform

Para desenvolvimento profissional com todas as funcionalidades:

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js -o .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js -o .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js -o .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:setup:manual": "node .infra/setup-cross-platform.js --manual",
    "infra:setup:force": "node .infra/setup-cross-platform.js --force --auto",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:reset": "node .infra/docker-helper.js reset",
    "infra:clean": "node .infra/docker-helper.js clean",
    "infra:psql": "node .infra/docker-helper.js psql",
    "infra:status": "node .infra/docker-helper.js status",
    "infra:backup": "node .infra/docker-helper.js backup",
    "infra:db:init": "node .infra/db-helper.js setup",
    "infra:db:fresh": "node .infra/db-helper.js fresh",
    "infra:db:migrate": "node .infra/db-helper.js migrate",
    "infra:db:seed": "node .infra/db-helper.js seed",
    "infra:db:studio": "node .infra/db-helper.js studio",
    "infra:db:reset": "node .infra/db-helper.js reset",
    "dev": "npm run infra:db:init && next dev"
  }
}
```

## 🏢 Scripts para CI/CD e Produção - Cross-Platform

Para ambientes automatizados e produção:

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js -o .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js -o .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js -o .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:setup:ci": "node .infra/setup-cross-platform.js --force --auto",
    "infra:setup:test": "node .infra/setup-cross-platform.js --force --db-name=test_db --auto",
    "infra:setup:prod": "node .infra/setup-cross-platform.js --force --db-name=prod_db --db-user=prod_user --db-password=${PROD_DB_PASSWORD}",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:reset": "node .infra/docker-helper.js reset",
    "infra:backup": "node .infra/docker-helper.js backup",
    "infra:restore": "node .infra/docker-helper.js restore",
    "infra:db:init": "node .infra/db-helper.js setup",
    "infra:db:fresh": "node .infra/db-helper.js fresh",
    "infra:db:migrate": "node .infra/db-helper.js migrate",
    "infra:db:seed": "node .infra/db-helper.js seed",
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
    "dev": "npm run infra:db:init && next dev",
    "build": "next build",
    "start": "next start",
    "infra:setup": "mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:setup:manual": "node .infra/setup-cross-platform.js --manual",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:reset": "node .infra/docker-helper.js reset",
    "infra:clean": "node .infra/docker-helper.js clean",
    "infra:db:init": "node .infra/db-helper.js setup",
    "infra:db:fresh": "node .infra/db-helper.js fresh",
    "infra:db:migrate": "node .infra/db-helper.js migrate",
    "infra:db:seed": "node .infra/db-helper.js seed",
    "infra:db:studio": "node .infra/db-helper.js studio",
    "infra:db:reset": "node .infra/db-helper.js reset",
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
    "dev": "npm run infra:db:init && nodemon src/server.js",
    "start": "node src/server.js",
    "infra:setup": "mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:reset": "node .infra/docker-helper.js reset",
    "infra:db:init": "node .infra/db-helper.js setup",
    "infra:db:fresh": "node .infra/db-helper.js fresh",
    "infra:db:migrate": "node .infra/db-helper.js migrate",
    "infra:db:seed": "node .infra/db-helper.js seed",
    "infra:db:studio": "node .infra/db-helper.js studio",
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
    "infra:setup": "mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:setup:ci": "node .infra/setup-cross-platform.js --force --auto",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:db:init": "node .infra/db-helper.js setup",
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

    "infra:setup": "mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:setup:manual": "node .infra/setup-cross-platform.js --manual",
    "infra:setup:force": "node .infra/setup-cross-platform.js --force --auto",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:reset": "node .infra/docker-helper.js reset",
    "infra:clean": "node .infra/docker-helper.js clean",
    "infra:psql": "node .infra/docker-helper.js psql",
    "infra:status": "node .infra/docker-helper.js status",
    "infra:backup": "node .infra/docker-helper.js backup",
    "infra:db:init": "node .infra/db-helper.js setup",
    "infra:db:fresh": "node .infra/db-helper.js fresh"
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

### ✅ **Organização de Arquivos**

- Helpers ficam na pasta `.infra/` (ignorada pelo Git)
- Infraestrutura fica na pasta `infra-db/` (ignorada pelo Git)
- Projeto principal permanece limpo
- Fácil remoção: apenas delete as pastas `.infra/` e `infra-db/`

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
node .infra/setup-cross-platform.js --force --auto

# Comandos Docker
node .infra/docker-helper.js up
node .infra/docker-helper.js down
node .infra/docker-helper.js logs
node .infra/docker-helper.js reset
node .infra/docker-helper.js psql
node .infra/docker-helper.js backup

# Comandos de Banco
node .infra/db-helper.js setup
node .infra/db-helper.js fresh
node .infra/db-helper.js migrate
node .infra/db-helper.js seed
node .infra/db-helper.js studio
```

### **Download Manual dos Helpers:**

Se preferir baixar os helpers manualmente:

```bash
# Criar pasta .infra
mkdir -p .infra    # Unix/macOS
mkdir .infra       # Windows

# Windows PowerShell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js" -OutFile ".infra/setup-cross-platform.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js" -OutFile ".infra/docker-helper.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js" -OutFile ".infra/db-helper.js"

# macOS/Linux
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js
```

### **Customizar para seu projeto:**

1. **Altere o nome do banco:**

```bash
node .infra/setup-cross-platform.js --force --db-name=meu_projeto_especifico
```

2. **Use variáveis de ambiente:**

```json
{
  "scripts": {
    "infra:setup:prod": "node .infra/setup-cross-platform.js --force --db-name=$PROJECT_NAME --db-user=$DB_USER --db-password=$DB_PASSWORD"
  }
}
```

3. **Adicione validações:**

```json
{
  "scripts": {
    "predev": "npm run infra:db:init",
    "prebuild": "npm run infra:db:migrate"
  }
}
```

4. **Integre com outros tools:**

```json
{
  "scripts": {
    "dev:full": "npm run infra:db:init && concurrently \"npm run dev\" \"npm run infra:db:studio\"",
    "test:full": "npm run infra:db:fresh && npm run test && npm run test:e2e"
  }
}
```

---

## 🚨 **Solução de Problemas**

### **Erro "Cannot find module" em projetos ES Modules**

Se você receber o erro:

```
Error: Cannot find module '.infra/setup-cross-platform.js'
```

**Causa:** Seu projeto usa `"type": "module"` no package.json, mas os helpers são CommonJS.

**Solução:** Use o auto-setup que detecta automaticamente:

```bash
# Solução automática (recomendada)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node

# Ou atualização manual dos scripts existentes
node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); Object.keys(pkg.scripts).forEach(key => { if (key.startsWith('infra:') && pkg.scripts[key].includes('.js')) { pkg.scripts[key] = pkg.scripts[key].replace(/\.js/g, '.cjs'); } }); fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"
```

### **Comando mkdir não reconhecido no PowerShell**

**Causa:** O PowerShell não reconhece `mkdir -p` nem redirecionamentos Unix.

**Solução:** Use PowerShell nativo ou o auto-setup:

```powershell
# PowerShell nativo
if (-not (Test-Path .infra)) { New-Item -ItemType Directory -Path .infra -Force }
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js' -OutFile '.infra/setup-cross-platform.cjs' -UseBasicParsing

# Ou use o auto-setup (recomendado)
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js' -OutFile 'temp-setup.js' -UseBasicParsing; node temp-setup.js; Remove-Item temp-setup.js
```

---

**Escolha o template que melhor se adapta ao seu projeto e personalize conforme necessário! 🚀**
