# 📋 Guia Completo - Docker PostgreSQL Infrastructure

## 🎯 Conceito

Esta infraestrutura é **100% genérica** e se adapta automaticamente ao seu projeto:

- ✅ **Preserva dados existentes** no .env
- ✅ **Detecta dados faltantes** inteligentemente
- ✅ **Detecção inteligente de porta** - sem conflitos entre projetos
- ✅ **Oferece opções flexíveis** (auto, manual, parar)
- ✅ **Sincroniza automaticamente** seu .env
- ✅ **Funciona via pipe** (`curl | node`) ou local
- ✅ **Cross-platform** - Windows, macOS, Linux
- ✅ Funciona com **qualquer projeto ANPD**

## 🚀 Setup Rápido

### **Opção 1: Auto-Setup (Recomendado)**

Um comando que configura tudo automaticamente:

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

### **Opção 2: Cross-Platform Auto-Detect**

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-setup.js | node
```

### **Opção 3: Setup com Scripts NPM**

Depois do auto-setup, você terá os scripts disponíveis:

```bash
npm run infra:setup        # Setup automático
npm run infra:setup:manual # Setup manual (escolhe configurações)
npm run infra:setup:force  # Força recreação completa
```

## 🔌 Múltiplos Projetos (NOVO!)

### Sistema de Detecção Inteligente de Porta

Quando você tem múltiplos projetos na mesma VM, o sistema automaticamente:

- ✅ **Detecta portas em uso** por outros projetos
- ✅ **Encontra porta disponível** automaticamente
- ✅ **Salva configuração** para próximas execuções
- ✅ **Isola completamente** containers, redes e volumes

**Exemplo prático:**

```bash
# VM com múltiplos projetos
Projeto A (backlog-dim):      localhost:5432
Projeto B (controladores):    localhost:5433  # ← detectado automaticamente
Projeto C (transparencia):    localhost:5434  # ← detectado automaticamente
```

### Como Funciona

1. **Primeira instalação**: usa porta 5432
2. **Segunda instalação**: detecta 5432 em uso → usa 5433
3. **Terceira instalação**: detecta 5432, 5433 em uso → usa 5434
4. **Configuração salva** em `.infra/port-config.json`
5. **Restaura automaticamente** a porta em próximas execuções

## 📦 Comandos Essenciais

### Setup e Configuração

```bash
# Setup inicial (detecta porta automaticamente)
npm run infra:setup

# Setup forçado (regenera tudo, nova porta se necessário)
npm run infra:setup:force

# Setup manual (escolhe porta)
npm run infra:setup:manual
```

### Atualização Inteligente (NOVO!)

```bash
# 🧠 Atualização completa - atualiza scripts E package.json
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node

# Atualização apenas dos scripts
npm run infra:update
```

### Solução de Problemas

```bash
# Diagnosticar problemas (credenciais, portas, containers)
npm run infra:debug

# Corrigir credenciais e containers
npm run infra:fix
```

### Gerenciamento Diário

```bash
# Subir banco
npm run infra:up

# Parar banco
npm run infra:down

# Ver logs
npm run infra:logs

# Reset completo (remove volumes)
npm run infra:reset

# Status dos containers
npm run infra:status

# Conectar via psql
npm run infra:psql
```

### Database Management

```bash
# Setup inicial do banco
npm run infra:db:init

# Reset do banco (mantém estrutura)
npm run infra:db:fresh

# Executar migrations
npm run infra:db:migrate

# Executar seeds
npm run infra:db:seed

# Abrir Prisma Studio
npm run infra:db:studio

# Reset completo do banco
npm run infra:db:reset
```

## 🏗️ Estrutura Gerada

### Estrutura de Arquivos

```bash
seu-projeto/
├── package.json          # Scripts NPM adicionados
├── .env                  # Sincronizado automaticamente
├── .infra/              # Scripts locais (git ignored)
│   ├── setup-cross-platform.js
│   ├── docker-helper.js
│   ├── db-helper.js
│   ├── port-manager.js
│   └── port-config.json  # Configuração de porta salva
└── infra-db/            # Infraestrutura PostgreSQL
    ├── docker-compose.yml  # Com porta personalizada
    └── .env               # Credenciais da infraestrutura
```

### Docker Compose Gerado

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: seu_projeto-postgres # Nome único
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-seu_projeto_dev}
      POSTGRES_USER: ${POSTGRES_USER:-dev_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - '5433:5432' # Porta detectada inteligentemente
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - seu_projeto_network # Rede isolada

volumes:
  postgres_data:

networks:
  seu_projeto_network:
    driver: bridge
```

### Arquivo .env Sincronizado

```bash
# Seu projeto/.env (sincronizado automaticamente)
POSTGRES_DB=seu_projeto_dev
POSTGRES_USER=dev_user
POSTGRES_PASSWORD=ABC123xyz789
POSTGRES_HOST=localhost
POSTGRES_PORT=5433  # Porta detectada automaticamente
DATABASE_URL="postgresql://dev_user:ABC123xyz789@localhost:5433/seu_projeto_dev"
```

## 🔐 Segurança

### Geração de Senhas

- ✅ **Senhas seguras** geradas com `crypto.randomBytes()`
- ✅ **16 caracteres** alfanuméricos
- ✅ **Preserva senhas existentes** (não sobrescreve)
- ✅ **--force sobrescreve** quando necessário

### Isolamento

- ✅ **Containers únicos** por projeto
- ✅ **Redes isoladas** por projeto
- ✅ **Volumes separados** por projeto
- ✅ **Portas diferentes** por projeto

### Arquivos Ignorados

```bash
# .gitignore (adicionado automaticamente)
.infra/
infra-db/
```

## 🧪 Exemplo Completo

### Passo 1: Setup Inicial

```bash
# No seu projeto
cd meu-projeto-anpd

# Auto-setup
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

**Saída esperada:**

```bash
🚀 Configurando Infraestrutura PostgreSQL ANPD
📦 Projeto Node.js detectado
✅ Projeto: meu-projeto-anpd
✅ 20 scripts adicionados ao package.json
✅ .gitignore configurado
✅ Pasta .infra criada

🎉 Configuração concluída!

📋 Próximos passos:
  1. npm run infra:setup     # Configurar infraestrutura
  2. npm run dev             # Iniciar desenvolvimento
```

### Passo 2: Configurar Infraestrutura

```bash
npm run infra:setup
```

**Saída esperada:**

```bash
🐳 Configurando infraestrutura PostgreSQL...
✅ Docker encontrado
✅ Docker Compose encontrado
✅ Pasta infra-db criada
📖 Lendo variáveis existentes do .env do projeto
🔍 Detectando porta disponível...
📊 Portas PostgreSQL já em uso: 5432
🎯 Porta selecionada: 5433
💾 Configuração de porta salva: 5433
💡 Usando valores otimizados com porta inteligente e senha segura
✅ docker-compose.yml criado com porta personalizada
✅ .env da infraestrutura criado
✅ .env do projeto sincronizado

🎉 Infraestrutura configurada com sucesso!

📋 Configuração:
  🗄️  Database: meu_projeto_anpd_dev
  👤 User: dev_user
  🔌 Port: 5433
  🔒 Password: ABC1****

🚀 Próximos passos:
  npm run infra:up
  npx prisma migrate dev
```

### Passo 3: Subir Banco e Testar

```bash
# Subir PostgreSQL
npm run infra:up

# Testar com Prisma
npx prisma migrate dev
```

### Passo 4: Segundo Projeto (Mesma VM)

```bash
# Em outro projeto na mesma VM
cd outro-projeto-anpd

# Mesmo comando
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
npm run infra:setup
```

**Saída esperada:**

```bash
🔍 Detectando porta disponível...
📊 Portas PostgreSQL já em uso: 5432, 5433
🎯 Porta selecionada: 5434  # ← Próxima disponível!
💾 Configuração de porta salva: 5434
```

## 🚨 Solução de Problemas

### Erro: "Port already in use"

```bash
# 1. Ver que portas estão sendo usadas
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

# 2. Corrigir credenciais automaticamente
npm run infra:fix

# 3. Testar novamente
npx prisma migrate dev
```

### Erro: "Missing script: infra:fix"

```bash
# Atualização inteligente (adiciona scripts novos)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node

# Agora deve funcionar
npm run infra:fix
```

### Container não inicia

```bash
# Ver logs detalhados
npm run infra:logs

# Reset completo
npm run infra:down
npm run infra:reset
npm run infra:setup:force
```

## 🔄 Atualização de Projetos Existentes

### Para projetos que já usavam versões antigas:

```bash
# 1. Atualização inteligente (NOVO!)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node

# 2. Regenerar infraestrutura com detecção de porta
npm run infra:setup:force

# 3. Testar
npm run infra:up
npx prisma migrate dev
```

### O que a atualização inteligente faz:

- ✅ **Adiciona comandos novos** (`infra:fix`, `infra:debug`)
- ✅ **Atualiza comandos existentes** com melhorias
- ✅ **Corrige extensões** (`.js` ↔ `.cjs` para ES modules)
- ✅ **Baixa scripts novos** (`port-manager.js`)
- ✅ **Mostra relatório** detalhado das mudanças

## 🎯 Modos de Operação

### Modo Automático (Padrão)

- ✅ Detecta credenciais existentes e preserva
- ✅ Detecta porta disponível automaticamente
- ✅ Gera senha segura se não existir
- ✅ Zero interação necessária

### Modo Manual

```bash
npm run infra:setup:manual
```

- ✅ Pergunta cada configuração
- ✅ Permite escolher porta específica
- ✅ Controle total sobre credenciais

### Modo Força

```bash
npm run infra:setup:force
```

- ✅ Regenera tudo do zero
- ✅ Novas credenciais (inclusive senha)
- ✅ Nova detecção de porta
- ✅ Sobrescreve configuração existente

## 🌍 Cross-Platform

### Windows

- ✅ PowerShell, CMD, Git Bash
- ✅ Docker Desktop
- ✅ Implementação Node.js nativa

### macOS/Linux

- ✅ Terminal nativo
- ✅ Docker ou Podman
- ✅ Fallback para script bash

### CI/CD

- ✅ GitHub Actions
- ✅ GitLab CI
- ✅ Jenkins
- ✅ Qualquer ambiente com Node.js + Docker

## 📊 Benefícios

- ✅ **Zero Configuração Manual** - Tudo automatizado
- ✅ **Múltiplos Projetos** - Detecção inteligente de porta
- ✅ **Isolamento Total** - Cada projeto independente
- ✅ **Segurança** - Senhas criptográficas, não hardcoded
- ✅ **Flexibilidade** - Auto, manual ou força
- ✅ **Cross-Platform** - Funciona em qualquer SO
- ✅ **Atualização Inteligente** - Sempre na versão mais recente
- ✅ **Diagnóstico Avançado** - Identifica problemas automaticamente

## 🤝 Suporte

- **[Documentação Completa](./index.md)** - Índice de toda documentação
- **[Gerenciamento de Portas](./port-management.md)** - Detalhes sobre o sistema de portas
- **[Issues](https://github.com/anpdgovbr/docker-infra-pg/issues)** - Reportar bugs
- **[Discussions](https://github.com/anpdgovbr/docker-infra-pg/discussions)** - Tirar dúvidas
