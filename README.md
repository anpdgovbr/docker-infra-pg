# 🐘 Docker PostgreSQL Infrastructure ANPD

> **Infraestrutura PostgreSQL padronizada para projetos da ANPD com setup automatizado e detecção inteligente de porta.**

## 🌟 **NOVO v2.0: Detecção Inteligente de Porta!**

Agora você pode ter **múltiplos projetos na mesma VM** sem conflitos! O sistema automaticamente:

- ✅ **Detecta portas em uso** por outros projetos PostgreSQL
- ✅ **Encontra porta disponível** automaticamente (5432, 5433, 5434...)
- ✅ **Salva configuração** para próximas execuções
- ✅ **Isola completamente** containers, redes e volumes por projeto

```bash
# Exemplo: 3 projetos na mesma VM
Projeto A (backlog-dim):      localhost:5432  ✅
Projeto B (controladores):    localhost:5433  ✅ (detectado automaticamente)
Projeto C (transparencia):    localhost:5434  ✅ (detectado automaticamente)
```

## 🌍 **Cross-Platform Completo**

Funciona perfeitamente em **Windows, macOS e Linux** usando Node.js:

- ✅ **Windows** (PowerShell, CMD, Git Bash)
- ✅ **macOS** (Terminal, iTerm)
- ✅ **Linux** (bash, zsh, fish)
- ✅ **CI/CD** (GitHub Actions, GitLab, Jenkins)

## 🚀 Setup Rápido (1 Comando)

### **🤖 Auto-Setup (Mais Fácil)**

Um comando que configura tudo automaticamente:

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

**Para projetos ES Module (`"type": "module"`):**

```bash
# Windows (PowerShell/CMD)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && del temp-setup.cjs

# macOS/Linux
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && rm temp-setup.cjs
```

### **⚡ Universal Auto-Detect**

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-setup.js | node
```

**✅ Sem Conflitos**: Scripts usam prefixo `infra:*` - não interferem com scripts existentes do Prisma, Next.js, etc.

### **Resultado:**

```bash
npm run infra:setup  # Configura infraestrutura (com detecção automática de porta)
npm run dev          # Seu projeto funcionando!
```

## 📚 Documentação Completa

- 📖 **[Guia Completo](./docs/guia-completo.md)** - Tutorial passo a passo
- 🔌 **[Gerenciamento de Portas](./docs/port-management.md)** - Sistema de detecção inteligente
- 📋 **[Comandos Disponíveis](./docs/comandos.md)** - Referência de todos os scripts NPM
- 🌍 **[Cross-Platform](./docs/cross-platform.md)** - Suporte Windows, macOS, Linux
- 🚀 **[CI/CD](./docs/ci-cd.md)** - Automação e pipelines
- 🚨 **[Troubleshooting](./docs/troubleshooting.md)** - Solução de problemas
- 📚 **[Índice Completo](./docs/index.md)** - Toda documentação

## 🔧 Pré-requisitos

- 🐳 **Docker** e **Docker Compose**
- 📦 **Node.js** (para helpers cross-platform)
- 🟢 **npm** ou **yarn**

Seu projeto deve ter:

1. **package.json** com nome do projeto
2. **.env** com configuração atual do banco (pode estar vazio):
   ```bash
   POSTGRES_DB=meu_projeto_dev
   DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"
   ```

## 🎯 Como Funciona

1. **Script lê seu projeto** (package.json + .env)
2. **Detecta dados faltantes** (nome, usuário, senha do banco)
3. **🆕 Detecta porta disponível** automaticamente
4. **Oferece opções inteligentes** (auto-gerar, manual, ou parar)
5. **Clona esta infraestrutura** para pasta `infra-db/`
6. **Configura tudo** baseado no seu projeto
7. **Sincroniza seu .env** com dados finais

> **💡 Isolamento:** Cada projeto tem containers, redes e volumes únicos (`projeto-postgres`, `projeto_network`)

## 🧠 Atualização Inteligente (NOVO!)

Para projetos já configurados, use a **atualização inteligente** que detecta automaticamente:

- ✅ **Novos scripts** (como `infra:fix`, `infra:debug`)
- ✅ **Scripts desatualizados** (comandos melhorados)
- ✅ **Extensões incorretas** (`.js` vs `.cjs` para ES modules)
- ✅ **Arquivos de infraestrutura** (scripts na pasta `.infra/`)

```bash
# 🧠 Atualização inteligente completa
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node

# OU apenas scripts (sem atualizar package.json)
npm run infra:update
```

**Perfeito para resolver:** "npm error Missing script: infra:fix"

## ✅ Resultado Final

- ✅ PostgreSQL isolado para seu projeto
- ✅ **Porta única automaticamente detectada** (5432, 5433, 5434...)
- ✅ Credenciais únicas e seguras (preserva existentes)
- ✅ Zero configuração manual
- ✅ Banco pronto para Prisma/migrations
- ✅ Sincronização automática do .env
- ✅ **Múltiplos projetos na mesma VM sem conflitos**

## 📋 Comandos Essenciais

### Setup e Configuração

```bash
# Setup inicial (detecta porta automaticamente)
npm run infra:setup

# Setup forçado - regenera tudo (nova porta se necessário)
npm run infra:setup:force

# Setup manual (escolha porta)
npm run infra:setup:manual

# 🧠 Atualização Inteligente (NOVO!) - atualiza scripts E package.json
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node

# Atualizar apenas scripts (quando há melhorias no repo)
npm run infra:update

# Debug de configuração (quando há problemas de conexão)
npm run infra:debug

# Corrigir credenciais (quando container tem credenciais diferentes)
npm run infra:fix

# Desenvolvimento diário
npm run db:setup && npm run dev

# Gerenciar infraestrutura
npm run infra:up          # Subir banco
npm run infra:down        # Parar banco
npm run infra:logs        # Ver logs
npm run infra:reset       # Reset completo
npm run infra:status      # Status dos containers
npm run infra:psql        # Conectar via psql
```

## 🔌 Detecção Inteligente de Porta

### Como Detecta

O sistema analisa:

- ✅ **Containers Docker PostgreSQL** ativos na máquina
- ✅ **Arquivos `.env`** de outros projetos ANPD
- ✅ **Arquivos `docker-compose.yml`** existentes
- ✅ **Portas realmente disponíveis** no sistema operacional

### Como Salva

```bash
.infra/port-config.json
{
  "port": 5433,
  "project": "meu-projeto",
  "createdAt": "2025-08-11T15:30:00.000Z",
  "updatedAt": "2025-08-11T15:30:00.000Z"
}
```

### Exemplo Prático

```bash
# Primeiro projeto
cd projeto-a
npm run infra:setup
# 🎯 Porta selecionada: 5432

# Segundo projeto (mesma VM)
cd ../projeto-b
npm run infra:setup
# 🔍 Detectando porta disponível...
# 📊 Portas PostgreSQL já em uso: 5432
# 🎯 Porta selecionada: 5433

# Terceiro projeto (mesma VM)
cd ../projeto-c
npm run infra:setup
# 🔍 Detectando porta disponível...
# 📊 Portas PostgreSQL já em uso: 5432, 5433
# 🎯 Porta selecionada: 5434
```

## 🔧 Modos de Execução

### 🤖 **Modo Automático (Recomendado)**

```bash
npm run infra:setup
```

- ✅ Detecta credenciais existentes e preserva
- ✅ **Detecta porta disponível automaticamente**
- ✅ Gera senha segura se não existir
- ✅ Zero interação necessária

### ✏️ **Modo Manual (Controle Total)**

```bash
npm run infra:setup:manual
```

- ✅ Pergunta cada configuração
- ✅ **Permite escolher porta específica**
- ✅ Controle total sobre credenciais

### 💪 **Modo Força (Reset Completo)**

```bash
npm run infra:setup:force
```

- ✅ Regenera tudo do zero
- ✅ **Nova detecção de porta**
- ✅ Novas credenciais seguras
- ✅ Sobrescreve configuração existente

## 🧪 Exemplo Completo (Múltiplos Projetos)

### VM com 3 Projetos

```bash
# Projeto 1: backlog-dim
cd /home/anpdadmin/backlog-dim
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
npm run infra:setup
# 🎯 Porta: 5432

# Projeto 2: controladores-api
cd /home/anpdadmin/controladores-api
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
npm run infra:setup
# 🎯 Porta: 5433 (detectado automaticamente!)

# Projeto 3: transparencia
cd /home/anpdadmin/transparencia
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
npm run infra:setup
# 🎯 Porta: 5534 (detectado automaticamente!)
```

### Resultado

```bash
# Containers isolados rodando simultaneamente com stacks únicas
docker ps --filter "name=postgres"

CONTAINER ID   IMAGE         PORTS                    NAMES
abc123def456   postgres:15   0.0.0.0:5432->5432/tcp   backlog_dim_postgres
def456ghi789   postgres:15   0.0.0.0:5433->5432/tcp   controladores_api_postgres
ghi789jkl012   postgres:15   0.0.0.0:5434->5432/tcp   transparencia_postgres
```

```bash
# Stacks Docker Compose isoladas
docker compose ls

NAME                     STATUS    CONFIG FILES
backlog-dim-stack        running   /home/anpdadmin/backlog-dim/infra-db/docker-compose.yml
controladores-api-stack  running   /home/anpdadmin/controladores-api/infra-db/docker-compose.yml
transparencia-stack      running   /home/anpdadmin/transparencia/infra-db/docker-compose.yml
```

### Arquivos .env Gerados

```bash
# backlog-dim/.env
DATABASE_URL="postgresql://dev_user:ABC123@localhost:5432/backlog_dim_dev"

# controladores-api/.env
DATABASE_URL="postgresql://dev_user:XYZ789@localhost:5433/controladores_api_dev"

# transparencia/.env
DATABASE_URL="postgresql://dev_user:DEF456@localhost:5434/transparencia_dev"
```

### docker-compose.yml com Stack Única

````yaml
name: backlog-dim-stack  # ← Nome único da stack!

services:
  postgres:
    image: postgres:15
    container_name: backlog_dim_postgres
    # ... resto da configuração
```## 🚨 Solução de Problemas

### Erro: "includes invalid characters for a local volume name"

Este erro acontece quando o nome do volume começa com underscore (\_). **Correção automática:**

```bash
# 🔧 Quick Fix - Corrige nomes inválidos automaticamente
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-fix-volumes.js | node

# Depois suba a infraestrutura normalmente
npm run infra:up
````

### Problema: Projetos se sobrepõem (último que sobe é o único que fica)

Este problema acontece quando múltiplos projetos usam a mesma **stack do Docker Compose**. **Correção automática:**

```bash
# 🔧 Fix Stack Conflict - Resolve conflitos entre projetos
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/fix-stack-conflict.js | node

# Agora cada projeto terá sua própria stack isolada
npm run infra:status  # Verificar se está funcionando
```

**Como funciona:** Adiciona `name: projeto-stack` no docker-compose.yml, garantindo que cada projeto tenha containers, volumes e networks completamente isolados.

### Erro: "Port already in use"

```bash
# 1. Ver diagnóstico completo
npm run infra:debug

# 2. Forçar nova detecção de porta
npm run infra:setup:force

# 3. Verificar containers ativos
docker ps --filter "name=postgres"
```

### Erro: "Authentication failed"

```bash
# 1. Diagnosticar credenciais
npm run infra:debug

# 2. Corrigir automaticamente
npm run infra:fix

# 3. Testar Prisma
npx prisma migrate dev
```

### Script não encontrado: "infra:fix"

```bash
# Atualização inteligente (adiciona scripts novos ao package.json)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node

# Agora deve funcionar
npm run infra:fix
```

## 🎊 Benefícios v2.0

- ✅ **Zero Configuração Manual** - Tudo automatizado
- ✅ **🆕 Múltiplos Projetos** - Detecção inteligente de porta sem conflitos
- ✅ **🆕 Isolamento Total** - Containers, redes e volumes únicos por projeto
- ✅ **Segurança** - Senhas geradas com crypto.randomBytes()
- ✅ **Cross-Platform** - Windows, macOS, Linux
- ✅ **🆕 Atualização Inteligente** - Smart update que adiciona comandos novos
- ✅ **🆕 Diagnóstico Avançado** - infra:debug e infra:fix
- ✅ **Configuração Persistente** - Lembra da porta em próximas execuções

## 🤝 Suporte e Contribuição

- **[Issues](https://github.com/anpdgovbr/docker-infra-pg/issues)** - Reportar bugs ou sugerir melhorias
- **[Discussions](https://github.com/anpdgovbr/docker-infra-pg/discussions)** - Tirar dúvidas e discutir ideias
- **[Documentação Completa](./docs/index.md)** - Índice de toda documentação disponível
