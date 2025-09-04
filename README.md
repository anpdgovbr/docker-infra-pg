[![License](https://img.shields.io/github/license/anpdgovbr/docker-infra-pg)](https://github.com/anpdgovbr/docker-infra-pg/blob/main/LICENSE)
[![Repo size](https://img.shields.io/github/repo-size/anpdgovbr/docker-infra-pg)](https://github.com/anpdgovbr/docker-infra-pg)
[![Node >=14](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%20-blue?logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D13-blue?logo=postgresql)](https://www.postgresql.org/)

---

# 🐘 Docker PostgreSQL Infrastructure ANPD

> **Infraestrutura PostgreSQL padronizada para projetos da ANPD com setup automatizado e detecção inteligente de porta.**

> RBAC (opcional): esta infraestrutura funciona de forma independente do RBAC. Se desejar usar em conjunto com um projeto que possua RBAC, há um guia específico em `docs/rbac-dev-setup.md`, mas não é obrigatório.

## 🌟 **NOVO v0.2.0: Detecção Inteligente de Porta!**

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

### Resultado esperado

Ao executar o Auto-Setup você terá:

- Pasta `.infra/` criada com os helpers (`setup-cross-platform.js`, `docker-helper.js`, `db-helper.js`, etc.).
- Pasta `infra-db/` com `docker-compose.yml` e `.env` da infraestrutura (ignoradas pelo Git).
- `package.json` atualizado com scripts `infra:*` (se você permitir a atualização automática).
- `.gitignore` atualizado para ignorar `.infra/` e `infra-db/`.

Exemplo de uso e saída típica:

```bash
# Na raiz do projeto
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node

🚀 Configurando Infraestrutura PostgreSQL ANPD
📦 Projeto Node.js detectado
✅ Projeto: meu-projeto-anpd
✅ 20 scripts adicionados ao package.json
✅ .gitignore configurado
✅ Pasta .infra criada

🎉 Configuração concluída!

Próximos passos:
	1. npm run infra:setup     # Configurar infraestrutura
	2. npm run dev             # Iniciar desenvolvimento
```

---

## 🔌 Compatibilidade Multi‑Stack (Opcional, via .env.example)

Os scripts agora detectam e preenchem variáveis comuns de banco para stacks populares — somente se essas variáveis existirem no seu `.env.example`. Mantêm valores já existentes no `.env` e preenchem apenas os que estiverem vazios/ausentes.

- Keycloak: `KEYCLOAK_ADMIN_PASSWORD`, `KEYCLOAK_DB_PASSWORD` (senhas seguras geradas)
- Genéricas: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_USERNAME`, `DB_PASSWORD`
- psql: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- NestJS/TypeORM: `TYPEORM_HOST`, `TYPEORM_PORT`, `TYPEORM_USERNAME`, `TYPEORM_PASSWORD`, `TYPEORM_DATABASE`
- Spring Boot: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- Quarkus: `QUARKUS_DATASOURCE_DB_KIND`, `QUARKUS_DATASOURCE_JDBC_URL`, `QUARKUS_DATASOURCE_USERNAME`, `QUARKUS_DATASOURCE_PASSWORD`

Notas:
- Se seu projeto não usa Keycloak ou não declara essas variáveis, nada é alterado.
- A `DATABASE_URL` e `POSTGRES_*` continuam sendo atualizadas como parte do setup da infra local.
- Para exemplos por stack, veja `docs/REPLICAR-EM-PROJETOS.md`.

---

## Índice rápido e detalhado

Use o README para um resumo rápido e os arquivos em `docs/` para detalhes passo-a-passo:

- `docs/guia-completo.md` — Guia completo com exemplos e passo a passo
- `docs/comandos.md` — Templates de scripts `package.json` e casos de uso
- `docs/port-management.md` — Como a detecção de portas funciona
- `docs/cross-platform.md` — Notas sobre compatibilidade e uso em cada SO
- `docs/ci-cd.md` — Exemplos e boas práticas para pipelines
- `docs/troubleshooting.md` — Problemas comuns e soluções rápidas
- `docs/REPLICAR-EM-PROJETOS.md` — Instruções para replicar em múltiplos projetos
  
RBAC (opcional):
- `docs/rbac-dev-setup.md` — Guia de ambiente para projetos que usam RBAC
- `docs/rbac-roadmap.md` — Itens específicos de integração com RBAC

---

## Requisitos

- Docker e Docker Compose
- Node.js (para os helpers em `.infra/`)
- npm ou yarn

Seu projeto deve conter `package.json` na raiz. Um `.env` é recomendado (pode estar vazio inicialmente).

---

## Começando (resumo)

1. Instalar dependências do sistema (Docker + Node).
2. Executar o setup (modo recomendado automático):

```bash
# Forma rápida (baixa e executa o helper):
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node

# Alternativa cross-platform (script detecta SO automaticamente):
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-setup.js | node
```

3. Na raiz do projeto, os scripts npm úteis (adicionados automaticamente) ficam disponíveis como `infra:*`.

### Comandos essenciais (resumo):

```bash
npm run infra:setup         # Setup inicial (detecta porta automaticamente)
npm run infra:setup:manual  # Modo manual para escolher porta/credenciais
npm run infra:setup:force   # Forçar regeneração (nova porta se necessário)
npm run infra:up            # Subir infraestrutura (docker-compose up) + pós-up opcional
npm run infra:down          # Parar infraestrutura
npm run infra:status        # Ver status
npm run infra:logs          # Ver logs
npm run infra:fix           # Corrigir credenciais automaticamente
npm run infra:update        # Atualizar scripts na pasta .infra/
```

Para atualizar os scripts baixando do repositório (sem alterar package.json):

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node
```

---

## Pós-up Hook Opcional (Genérico)

Após `infra:up`, os helpers podem disparar automaticamente um comando pós-subida, ideal para subir serviços que dependem do banco (por exemplo, Keycloak), mantendo o comportamento opcional e seguro.

- Auto: se houver `docker-compose.yml` na raiz do projeto, executa `docker compose up -d` após a infra subir.
- Manual: pergunta antes de executar (útil em ambientes interativos).
- Customizado: defina um comando alternativo via variável de ambiente.

Variáveis de ambiente e flags:

- `INFRA_POST_UP_DISABLE=1` — desabilita completamente o hook pós-up.
- `INFRA_UP_MODE=manual` — ativa modo interativo (pergunta antes de executar).
- `INFRA_UP_MODE=auto` — ativa modo automático (padrão).
- `INFRA_POST_UP_CMD="docker compose -f compose.override.yml up -d"` — comando pós-up customizado.
- Flag `--manual` — equivalente a `INFRA_UP_MODE=manual` (ex.: `node .infra/docker-helper.js up --manual`).

Exemplos:

```bash
# Padrão (auto): sobe infra e, se tiver compose na raiz, sobe serviços
npm run infra:up

# Manual: pergunta antes de rodar o compose da raiz
INFRA_UP_MODE=manual npm run infra:up

# Desabilitar completamente o pós-up
INFRA_POST_UP_DISABLE=1 npm run infra:up

# Comando pós-up customizado
INFRA_POST_UP_CMD="docker compose -f compose.override.yml up -d" npm run infra:up
```


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
