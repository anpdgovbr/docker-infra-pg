# � Referência de Comandos

> **Objetivo**: Guia completo de todos os comandos disponíveis, organizados por função e com exemplos práticos.

## 🚀 Quick Reference

### Comandos Essenciais (Uso Diário)

```bash
npm run infra:up            # Subir PostgreSQL
npm run infra:down          # Parar PostgreSQL
npm run infra:logs          # Ver logs
npm run dev                 # Desenvolvimento (inclui banco)
```

### Setup e Configuração

```bash
npm run infra:setup         # Setup automático
npm run infra:setup:manual  # Setup manual (escolher configurações)
npm run infra:setup:force   # Reconfigurar do zero
```

### Banco de Dados

```bash
npm run infra:db:init       # Setup completo (up + migrate + seed)
npm run infra:db:fresh      # Reset + migrate + seed
npm run infra:psql          # Conectar ao PostgreSQL
```

## 📦 Comandos por Categoria

### 🔧 Setup e Configuração

| Comando              | Descrição                              | Uso                                            |
| -------------------- | -------------------------------------- | ---------------------------------------------- |
| `infra:setup`        | Setup automático com detecção de porta | Primeira vez ou depois de mudanças             |
| `infra:setup:manual` | Setup manual com controle total        | Quando quiser escolher cada configuração       |
| `infra:setup:force`  | Força regeneração completa             | Para resolver problemas ou mudar configurações |

**Exemplos:**

```bash
# Setup padrão (recomendado)
npm run infra:setup

# Escolher porta específica e credenciais
npm run infra:setup:manual

# Resolver problemas ou mudar de porta
npm run infra:setup:force
```

### 🐳 Gerenciamento de Containers

| Comando         | Descrição                          | Uso                                 |
| --------------- | ---------------------------------- | ----------------------------------- |
| `infra:up`      | Subir PostgreSQL + pós-up opcional | Início de sessão de desenvolvimento |
| `infra:down`    | Parar PostgreSQL                   | Fim de sessão                       |
| `infra:status`  | Ver status dos containers          | Verificar se está rodando           |
| `infra:logs`    | Ver logs do PostgreSQL             | Debug de problemas                  |
| `infra:restart` | Restart completo                   | Resolver problemas de conexão       |

**Exemplos:**

```bash
# Subir banco (com pós-up automático se configurado)
npm run infra:up

# Subir banco em modo manual (pergunta antes do pós-up)
npm run infra:up:manual

# Ver se está rodando
npm run infra:status

# Debug de problemas
npm run infra:logs
```

### 🗄️ Banco de Dados

| Comando            | Descrição                            | Uso                                         |
| ------------------ | ------------------------------------ | ------------------------------------------- |
| `infra:db:init`    | Setup completo: up + migrate + seed  | Primeira vez ou depois de changes no schema |
| `infra:db:fresh`   | Reset + migrate + seed (PERDE DADOS) | Limpar banco e recriar                      |
| `infra:db:migrate` | Apenas migrações                     | Aplicar mudanças no schema                  |
| `infra:db:seed`    | Apenas seed                          | Popular com dados iniciais                  |
| `infra:psql`       | Conectar ao PostgreSQL               | Comandos SQL diretos                        |

**Exemplos:**

```bash
# Setup completo para desenvolvimento
npm run infra:db:init

# Limpar tudo e recriar (cuidado!)
npm run infra:db:fresh

# Só aplicar migrações
npm run infra:db:migrate

# Conectar diretamente ao banco
npm run infra:psql
```

### 🛠️ Manutenção e Utilitários

| Comando         | Descrição                             | Uso                           |
| --------------- | ------------------------------------- | ----------------------------- |
| `infra:fix`     | Corrigir problemas automaticamente    | Quando algo não funciona      |
| `infra:update`  | Atualizar scripts                     | Pegar versão mais recente     |
| `infra:clean`   | Remover tudo (infra-db/)              | Limpeza completa              |
| `infra:reset`   | Reset com preservação de configuração | Limpar dados mas manter setup |
| `infra:backup`  | Criar backup do banco                 | Antes de mudanças importantes |
| `infra:restore` | Restaurar backup                      | Depois de problemas           |

**Exemplos:**

```bash
# Resolver problemas automaticamente
npm run infra:fix

# Atualizar para versão mais recente
npm run infra:update

# Limpeza total (remove pasta infra-db)
npm run infra:clean

# Reset mantendo configuração
npm run infra:reset
```

## 🎮 Fluxos de Trabalho Comuns

### Primeira vez no projeto

```bash
# 1. Setup automático (só uma vez)
npm run infra:setup

# 2. Desenvolvimento
npm run dev  # Inclui setup do banco automaticamente
```

### Desenvolvimento diário

```bash
# Opção 1: Manual
npm run infra:up && npm run dev

# Opção 2: Automático (se configurou no script dev)
npm run dev  # Banco sobe automaticamente
```

### Depois de pull/mudanças no schema

```bash
npm run infra:db:init  # Aplica migrações + seed
npm run dev
```

### Resolver problemas

```bash
npm run infra:fix      # Corrige automaticamente
npm run infra:logs     # Debug se necessário
```

### Reset completo (última opção)

```bash
npm run infra:clean    # Remove tudo
npm run infra:setup    # Reconfigura
npm run dev
```

## 🚀 Integração com Frameworks

### Next.js + Prisma

```json
{
  "scripts": {
    "dev": "npm run infra:db:init && next dev",
    "build": "npx prisma generate && next build",
    "start": "next start"
  }
}
```

### NestJS + TypeORM

```json
{
  "scripts": {
    "start:dev": "npm run infra:db:init && nest start --watch",
    "start:debug": "npm run infra:up && nest start --debug --watch"
  }
}
```

### Express + Prisma

```json
{
  "scripts": {
    "dev": "npm run infra:up && nodemon src/server.js",
    "test": "npm run infra:db:init && jest"
  }
}
```

## 🔧 Flags e Opções Avançadas

### Flags Globais

- `--show-secrets`: Mostrar senhas e URLs completas (para debug)
- `--verbose`: Mostrar logs detalhados e stack traces
- `--manual`: Modo manual (pergunta antes de executar)

**Exemplos:**

```bash
# Ver URL completa durante debug
npm run infra:setup -- --show-secrets

# Logs detalhados para troubleshooting
npm run infra:up -- --verbose

# Modo manual para pós-up
npm run infra:up -- --manual
```

### Variáveis de Ambiente

| Variável                | Descrição                  | Valores          | Exemplo                                                  |
| ----------------------- | -------------------------- | ---------------- | -------------------------------------------------------- |
| `INFRA_POST_UP_DISABLE` | Desabilita pós-up hook     | `1`              | `INFRA_POST_UP_DISABLE=1 npm run infra:up`               |
| `INFRA_UP_MODE`         | Modo do pós-up             | `auto`, `manual` | `INFRA_UP_MODE=manual npm run infra:up`                  |
| `INFRA_POST_UP_CMD`     | Comando pós-up customizado | comando shell    | `INFRA_POST_UP_CMD="docker compose -f custom.yml up -d"` |
| `SHOW_SECRETS`          | Mostrar credenciais        | `1`              | `SHOW_SECRETS=1 npm run infra:setup`                     |
| `VERBOSE`               | Logs detalhados            | `1`              | `VERBOSE=1 npm run infra:debug`                          |

**Exemplos:**

```bash
# Desabilitar pós-up completamente
INFRA_POST_UP_DISABLE=1 npm run infra:up

# Pós-up manual (pergunta antes)
INFRA_UP_MODE=manual npm run infra:up

# Comando pós-up customizado
INFRA_POST_UP_CMD="docker compose -f keycloak.yml up -d" npm run infra:up

# Debug com credenciais visíveis
SHOW_SECRETS=1 VERBOSE=1 npm run infra:debug
```

## 🌍 Compatibilidade Cross-Platform

### Windows

```bash
# PowerShell
npm run infra:setup

# CMD
npm run infra:setup

# Git Bash
npm run infra:setup
```

### macOS/Linux

```bash
# Qualquer terminal
npm run infra:setup
```

### Projetos ES Modules

```bash
# Auto-setup para ES Modules (type: "module")
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs
node temp-setup.cjs
rm temp-setup.cjs
```

## 🔍 Debugging e Diagnóstico

### Comandos de diagnóstico

```bash
npm run infra:debug      # Diagnóstico completo
npm run infra:status     # Status dos containers
npm run infra:logs       # Logs do PostgreSQL
```

### Verificação manual

```bash
# Ver containers rodando
docker ps --filter "name=postgres"

# Ver portas em uso
netstat -an | grep 5432  # Linux/macOS
netstat -an | findstr 5432  # Windows

# Testar conexão
npm run infra:psql
```

### Logs detalhados

```bash
# Com timestamps
docker logs $(docker ps -q --filter "name=postgres") -t

# Seguir logs em tempo real
npm run infra:logs
```

## 📊 Templates de package.json por Cenário

### Básico (Essencial)

```json
{
  "scripts": {
    "infra:setup": "node .infra/setup-cross-platform.js",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:db:init": "node .infra/db-helper.js setup",
    "dev": "npm run infra:db:init && next dev"
  }
}
```

### Completo (Recomendado)

```json
{
  "scripts": {
    "infra:setup": "node .infra/setup-cross-platform.js",
    "infra:setup:manual": "node .infra/setup-cross-platform.js --manual",
    "infra:setup:force": "node .infra/setup-cross-platform.js --force",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:up:manual": "node .infra/docker-helper.js up --manual",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:status": "node .infra/docker-helper.js status",
    "infra:psql": "node .infra/docker-helper.js psql",
    "infra:db:init": "node .infra/db-helper.js setup",
    "infra:db:fresh": "node .infra/db-helper.js fresh",
    "infra:db:migrate": "node .infra/db-helper.js migrate",
    "infra:db:seed": "node .infra/db-helper.js seed",
    "infra:fix": "node .infra/setup-cross-platform.js --fix",
    "infra:update": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node",
    "dev": "npm run infra:db:init && next dev"
  }
}
```

### CI/CD

```json
{
  "scripts": {
    "infra:setup:ci": "node .infra/setup-cross-platform.js --force --auto",
    "test:integration": "npm run infra:setup:ci && npm run test",
    "build:ci": "npm run infra:setup:ci && npm run build"
  }
}
```

## 💡 Dicas e Boas Práticas

### Para desenvolvimento diário

1. **Configure uma vez**: Use `npm run infra:setup`
2. **Use automático**: Modifique script `dev` para incluir `infra:db:init`
3. **Mantenha simples**: Comandos `infra:up` e `infra:down` para controle manual

### Para equipes

1. **Documente no README**: Inclua comandos de setup
2. **Use auto-setup**: Facilita onboarding de novos desenvolvedores
3. **Configure CI**: Use `infra:setup:ci` em pipelines

### Para troubleshooting

1. **Use diagnóstico**: `npm run infra:debug` mostra tudo
2. **Use fix**: `npm run infra:fix` resolve problemas comuns
3. **Use verbose**: Adicione `--verbose` para ver detalhes

### Para múltiplos projetos

1. **Deixe automático**: Sistema detecta portas automaticamente
2. **Use force quando necessário**: `infra:setup:force` para reconfigurar
3. **Monitore recursos**: `docker system df` para ver uso de espaço

---

**💡 Lembre-se**: Todos os comandos `infra:*` são opcionais e não interferem com comandos existentes. Você pode usar em paralelo com comandos nativos do Prisma, Docker, etc.\*\*

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
