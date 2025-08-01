# 🐘 Infraestrutura PostgreSQL ANPD

> \*\*I## 📚 Documentação Completa

- 📖 **[REPLICAR-EM-PROJETOS.md](./REPLICAR-EM-PROJETOS.md)** - Guia completo de uso
- 📋 **[SCRIPTS-PACKAGE-JSON.md](./SCRIPTS-PACKAGE-JSON.md)** - Templates prontos para package.json
- 🔗 **[INTEGRACAO-PROJETO-EXISTENTE.md](./INTEGRACAO-PROJETO-EXISTENTE.md)** - Como integrar em projetos que já existem
- 🌍 **[CROSS-PLATFORM.md](./CROSS-PLATFORM.md)** - Helpers cross-platform (Node.js)
- 🚀 **[CI-CD.md](./CI-CD.md)** - Automação e pipelines de CI/CD
- 🔧 **[docs/](./docs/)** - Documentação técnica detalhada

## 📋 Pré-requisitos

- 🐳 **Docker** e **Docker Compose**
- 📦 **Node.js** (para helpers cross-platform)
- 🟢 **npm** ou **yarn**
- 🐧 **Bash** (Windows: Git Bash ou WSL)rutura PostgreSQL padronizada para projetos da ANPD com setup automatizado.\*\*

## 🌍 **NOVO: 100% Cross-Platform!**

Agora funciona perfeitamente em **Windows, macOS e Linux** usando Node.js! 🎉

- ✅ **Windows** (PowerShell, CMD, Git Bash)
- ✅ **macOS** (Terminal, iTerm)
- ✅ **Linux** (bash, zsh, fish)
- ✅ **CI/CD** (GitHub Actions, GitLab, Jenkins)

## 🚀 Setup Rápido (Universal)

### **🤖 Opção 1: Auto-Setup (Mais Fácil)**

Um comando que configura tudo automaticamente:

**Para projetos CommonJS (padrão):**

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

**Para projetos ES Module (`"type": "module"`):**

```bash
# 🚀 Cross-Platform Auto-Detect (Recomendado)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-setup.js | node

# Manual por SO:
# Windows (PowerShell/CMD)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && del temp-setup.cjs

# macOS/Linux
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && rm temp-setup.cjs
```

**🎯 O que faz automaticamente:**
O auto-setup detecta o tipo do projeto e configura arquivos `.cjs` para compatibilidade.

Isso irá:

- ✅ Adicionar scripts `infra:*` ao package.json (sem conflitos)
- ✅ Configurar .gitignore automaticamente
- ✅ Criar estrutura de pastas `.infra/`
- ✅ Detectar ES modules e configurar extensões corretas
- ✅ Não modificar scripts existentes

```bash
npm run infra:setup  # Configura infraestrutura
npm run dev          # Seu projeto funcionando!
```

### **📝 Opção 2: Manual (Para quem quer controle)**

```json
{
  "scripts": {
    "infra:setup": "mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:db:init": "node .infra/db-helper.js setup"
  }
}
```

**✅ Sem Conflitos**: Scripts usam prefixo `infra:*` - não interferem com scripts existentes do Prisma, Next.js, etc.

```bash
npm run infra:setup  # Configura infraestrutura
npm run dev          # Seu projeto funcionando!
```

### **Opção 3: Comando Direto (Bash)**

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash
```

**Pronto!** Seu projeto agora tem uma infraestrutura PostgreSQL isolada e configurada.

## � Documentação Completa

- 📖 **[REPLICAR-EM-PROJETOS.md](./REPLICAR-EM-PROJETOS.md)** - Guia completo de uso
- �📋 **[SCRIPTS-PACKAGE-JSON.md](./SCRIPTS-PACKAGE-JSON.md)** - Templates prontos para package.json
- 🌍 **[CROSS-PLATFORM.md](./CROSS-PLATFORM.md)** - Helpers cross-platform (Node.js)
- 🚀 **[CI-CD.md](./CI-CD.md)** - Automação e pipelines de CI/CD
- 🔧 **[docs/](./docs/)** - Documentação técnica detalhada

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
3. **Oferece opções inteligentes** (auto-gerar, manual, ou parar)
4. **Clona esta infraestrutura** para pasta `infra-db/`
5. **Configura tudo** baseado no seu projeto
6. **Sincroniza seu .env** com dados finais

> **💡 Nota:** A pasta local sempre será `infra-db/` independente do nome do repositório, garantindo que todos os comandos funcionem consistentemente em qualquer projeto.

## ✅ Resultado

- ✅ PostgreSQL isolado para seu projeto
- ✅ Credenciais únicas e seguras (preserva existentes)
- ✅ Zero configuração manual
- ✅ Banco pronto para Prisma/migrations
- ✅ Sincronização automática do .env

## 🔧 Modos de Execução

### 🤖 **Modo Automático (Recomendado para CI/CD)**

```bash
# Via curl (detecta pipe automaticamente)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash

# Local com parâmetros
./setup-infra.sh --force --auto
```

### ✏️ **Modo Manual (Controle Total)**

```bash
# Download primeiro
wget https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh
chmod +x setup-infra.sh

# Execução interativa
./setup-infra.sh --manual

# Ou com dados específicos
./setup-infra.sh --force --db-name=meudb --db-user=meuuser --db-password=minhasenha
```

### 📚 **Parâmetros Disponíveis**

```bash
--force               # Sobrescrever infra-db sem perguntar
--auto                # Gerar dados faltantes automaticamente
--manual              # Pedir dados faltantes via prompt
--db-name=NOME        # Nome do banco
--db-user=USER        # Usuário do banco
--db-password=PASS    # Senha do banco
--help, -h            # Mostrar ajuda
```

## 📖 Scripts Recomendados para package.json

Adicione ao seu `package.json`:

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:setup:manual": "wget -q -O setup-infra.sh https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh && chmod +x setup-infra.sh && ./setup-infra.sh --manual && rm setup-infra.sh",
    "infra:setup:force": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --auto",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "infra:reset": "cd infra-db && docker-compose down -v && docker-compose up -d",
    "infra:clean": "npm run infra:down && rm -rf infra-db",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed",
    "db:fresh": "npm run infra:reset && sleep 10 && npm run db:setup"
  }
}
```

### 🎮 **Comandos de Uso Diário**

```bash
# Setup inicial (primeira vez)
npm run infra:setup

# Setup com controle manual
npm run infra:setup:manual

# Setup forçado (CI/CD)
npm run infra:setup:force

# Atualizar scripts (quando há melhorias no repo)
npm run infra:update

# Desenvolvimento diário
npm run db:setup && npm run dev

# Gerenciar infraestrutura
npm run infra:up          # Subir banco
npm run infra:down        # Parar banco
npm run infra:logs        # Ver logs
npm run infra:reset       # Reset completo

# Reset do banco (quando necessário)
npm run db:fresh

# Limpar tudo
npm run infra:clean
```

## 🔧 Scripts Avançados (Opcionais)

Para projetos com necessidades específicas:

```json
{
  "scripts": {
    "infra:setup:prod": "wget -q -O setup-infra.sh https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh && chmod +x setup-infra.sh && ./setup-infra.sh --force --db-name=meu_projeto_prod --db-user=prod_user --db-password=$PROD_DB_PASSWORD && rm setup-infra.sh",
    "infra:setup:test": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --db-name=test_db --auto",
    "infra:backup": "cd infra-db && docker-compose exec postgres pg_dump -U admin postgres > backup.sql",
    "infra:restore": "cd infra-db && docker-compose exec -T postgres psql -U admin postgres < backup.sql"
  }
}
```

## 🔒 Segurança

- ✅ **Zero senhas hardcoded** no código
- ✅ **Credenciais sempre únicas** por projeto/execução
- ✅ **Bancos isolados** entre projetos
- ✅ **Senhas geradas** com criptografia forte

## 📚 Documentação

- **[COMO USAR](REPLICAR-EM-PROJETOS.md)** - Guia completo de uso
- **[SCRIPTS PACKAGE.JSON](SCRIPTS-PACKAGE-JSON.md)** - Templates prontos para diferentes projetos
- **[docs/](docs/)** - Documentação técnica detalhada

---

**Uma infraestrutura. Todos os projetos ANPD. Zero configuração manual.** 🎉
