[![License](https://img.shields.io/github/license/anpdgovbr/docker-infra-pg)](https://github.com/anpdgovbr/docker-infra-pg/blob/main/LICENSE)
[![Docker](https://img.shields.io/badge/docker-%20-blue?logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D13-blue?logo=postgresql)](https://www.postgresql.org/)
[![Node >=14](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](https://nodejs.org/)

# 🐘 Docker PostgreSQL Infrastructure ANPD

> **Infraestrutura PostgreSQL padronizada para projetos da ANPD com setup automatizado, detecção inteligente de porta e isolamento completo por projeto.**

## ✨ Principais Recursos

- 🚀 **Setup em 1 comando**: Configuração automática completa
- 🔌 **Detecção inteligente de portas**: Múltiplos projetos na mesma VM sem conflitos
- 🌍 **100% cross-platform**: Windows, macOS e Linux
- 🔒 **Isolamento total**: Containers, redes e volumes únicos por projeto
- ⚡ **Zero configuração manual**: Funciona automaticamente em qualquer projeto ANPD

## 🚀 Quick Start

### Para novos projetos

```bash
# Método recomendado (100% compatível)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-setup.js | node

# Método alternativo (download direto)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o setup.js && node setup.js && rm setup.js

# Configurar infraestrutura
npm run infra:setup

# Iniciar desenvolvimento
npm run dev
```

### Para projetos existentes

```bash
# Setup automático (preserva configurações existentes)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-setup.js | node

# Método alternativo se necessário
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o setup.js && node setup.js && rm setup.js

# Configurar (preserva dados do .env existente)
npm run infra:setup

# Desenvolvimento normal
npm run dev  # Agora inclui o banco automaticamente
```

## � Múltiplos Projetos, Zero Conflitos

**Exemplo prático: 3 projetos na mesma VM**

```bash
Projeto A (backlog-dim):     localhost:5432  ✅
Projeto B (controladores):   localhost:5433  ✅ (auto-detectado)
Projeto C (transparencia):   localhost:5434  ✅ (auto-detectado)
```

✅ **Isolamento completo**: Cada projeto tem containers, redes e volumes únicos  
✅ **Detecção automática**: Sistema encontra a próxima porta disponível  
✅ **Configuração persistente**: Lembra da porta escolhida para sempre

## 📋 Comandos Essenciais

### Setup e configuração

```bash
npm run infra:setup         # Setup automático com detecção de porta
npm run infra:setup:manual  # Controle total sobre configurações
npm run infra:setup:force   # Regenerar tudo do zero
```

### Uso diário

```bash
npm run infra:up            # Subir infraestrutura + pós-up opcional
npm run infra:down          # Parar infraestrutura
npm run infra:logs          # Ver logs do PostgreSQL
npm run infra:status        # Status dos containers
```

### Desenvolvimento

```bash
npm run dev                 # Inicia desenvolvimento (inclui banco)
npm run infra:db:init       # Setup completo do banco
npm run infra:db:fresh      # Reset + migrations + seed
```

### Utilitários

```bash
npm run infra:psql          # Conectar ao PostgreSQL
npm run infra:fix           # Corrigir problemas automaticamente
npm run infra:update        # Atualizar scripts
```

> 💡 **Dica**: Os scripts usam prefixo `infra:*` para não interferir com comandos existentes do Prisma, Next.js, etc.

## 🌍 Multi-Stack e Cross-Platform

### Compatibilidade automática com frameworks

- **Next.js + Prisma**: Integração nativa
- **NestJS + TypeORM**: Variáveis detectadas automaticamente
- **Spring Boot**: Datasource configurado automaticamente
- **Keycloak**: Senhas seguras geradas automaticamente

### Suporte completo a plataformas

- ✅ **Windows** (PowerShell, CMD, Git Bash)
- ✅ **macOS** (Terminal, iTerm2)
- ✅ **Linux** (bash, zsh, fish)
- ✅ **CI/CD** (GitHub Actions, GitLab CI, Jenkins)

## 📚 Documentação Detalhada

### 🟢 Iniciante

- [`docs/inicio-rapido.md`](docs/inicio-rapido.md) - Primeiros passos detalhados
- [`docs/instalacao-projetos.md`](docs/instalacao-projetos.md) - Como usar em projetos existentes

### 🟡 Intermediário

- [`docs/comandos.md`](docs/comandos.md) - Referência completa de comandos
- [`docs/gerenciamento-portas.md`](docs/gerenciamento-portas.md) - Como funciona a detecção de portas
- [`docs/compatibilidade.md`](docs/compatibilidade.md) - Detalhes sobre cross-platform

### 🔴 Avançado

- [`docs/guia-completo.md`](docs/guia-completo.md) - Guia técnico completo
- [`docs/ci-cd.md`](docs/ci-cd.md) - Integração com pipelines
- [`docs/solucao-problemas.md`](docs/solucao-problemas.md) - Troubleshooting avançado

## ⚡ Recursos Avançados

### Pós-up Hook Automático

- **Auto**: Se houver `docker-compose.yml` na raiz, executa automaticamente após subir a infra
- **Manual**: Use `--manual` para controle total
- **Customizado**: Defina `INFRA_POST_UP_CMD` para comandos específicos

### Segurança Integrada

- **Senhas criptográficas**: Geradas automaticamente com `crypto.randomBytes()`
- **Mascaramento de logs**: Credenciais nunca aparecem em terminais/CI
- **Isolamento total**: Cada projeto tem containers, redes e volumes únicos

### Correções Automáticas

```bash
npm run infra:fix           # Corrige credenciais automaticamente
npm run infra:update        # Atualiza scripts para versão mais recente
```

## 📞 Suporte e Contribuição

- 🐛 **Issues**: [GitHub Issues](https://github.com/anpdgovbr/docker-infra-pg/issues)
- � **Discussões**: [GitHub Discussions](https://github.com/anpdgovbr/docker-infra-pg/discussions)
- 📖 **Wiki**: [`docs/`](docs/) - Documentação completa

---

**Uma infraestrutura. Todos os projetos ANPD. Zero configuração manual.** 🎉

_v0.2.1 - Documentação modernizada e consolidada_

## Segurança — mascaramento de secrets

Por padrão os scripts mascaram senhas e a `DATABASE_URL` nos logs para evitar vazamento de segredos em CI/terminals. Se precisar exibir a URL completa use explicitamente:

```bash
# CLI flag
node .infra/setup-cross-platform.cjs --show-secrets

# Ou variável de ambiente
SHOW_SECRETS=1 node .infra/setup-cross-platform.cjs
```

Logs coloridos e `--verbose`:

- Mensagens padrão são colorizadas para legibilidade.
- Use `--verbose` ou `VERBOSE=1` para ver stacks/erros completos quando necessário.

---

## Compatibilidade CJS / ESM (port-manager)

O projeto fornece variantes dos helpers para evitar erros como `require is not defined` em projetos ESM. Estratégia:

- `setup-cross-platform` tenta carregar a variante mais adequada em runtime.
- Preferência: `.cjs` quando `require` existe, `.mjs` via `import()` em runtimes ESM.
- Há um fallback para `port-manager.cjs` quando necessário.

Isso permite rodar os helpers em projetos com `type: "module"` ou CommonJS sem alterações manuais.

---

## Ferramentas de correção rápidas

- `quick-fix-volumes` — corrige nomes de volumes inválidos (underscore no início).
- `fix-stack-conflict` — adiciona `name: <projeto>-stack` ao `infra-db/docker-compose.yml` para isolar stacks.
- `fix-credentials` — regenera `docker-compose.yml` e `.env` da infra com credenciais corretas.

Exemplos:

---

## Sobre scripts de inicialização (init)

- Os projetos consumidores geram dinamicamente `infra-db/init/01-create-app-database.sh` durante o `infra:setup`.
- Este repositório não mantém scripts `init/` versionados para evitar acoplamento e credenciais fixas.
- O bind `./init:/docker-entrypoint-initdb.d` permanece; se a pasta estiver vazia, o PostgreSQL apenas ignora.

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-fix-volumes.js | node
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/fix-stack-conflict.js | node
```

---

## Boas práticas para desenvolvimento

- Mantenha `package.json` na raiz do projeto — os scripts `infra:*` são adicionados automaticamente.
- Use `.env` para configurar `DATABASE_URL` quando for necessário manter conexão local.
- Para contribuir, execute o linter/formatador localmente:

```bash
npm run lint
npm run format
```

O repositório inclui configuração recomendada do VS Code (`.vscode/`) com Prettier e EditorConfig.

---

## Troubleshooting rápido

- Porta em uso: `npm run infra:setup:force` ou `npm run infra:debug`.
- Erro de autenticação: `npm run infra:fix`.
- Script npm faltando: execute `smart-update` (acima) para popular `package.json`.

Para problemas mais complexos veja `docs/`:

- `docs/guia-completo.md` — passo a passo
- `docs/port-management.md` — detalhes da detecção de portas
- `docs/troubleshooting.md` — problemas comuns e soluções

---

## Contribuição e suporte

- Issues: https://github.com/anpdgovbr/docker-infra-pg/issues
- Discussions: https://github.com/anpdgovbr/docker-infra-pg/discussions
- Documentação completa em `docs/`

---

Versão atual: v0.2.0 — documentação consolidada para uso local e CI.
