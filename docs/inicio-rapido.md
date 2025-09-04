# 🚀 Início Rápido - 5 Minutos para Funcionar

> **Objetivo**: Ter a infraestrutura PostgreSQL funcionando em seu projeto em menos de 5 minutos, com setup automático e detecção inteligente de portas.

## 📋 Pré-requisitos

- ✅ **Docker Desktop** (Windows/macOS) ou **Docker + Docker Compose** (Linux)
- ✅ **Node.js** versão 14 ou superior
- ✅ **npm** ou **yarn**
- ✅ Projeto com `package.json` na raiz

## ⚡ Método 1: Setup Automático (Mais Fácil)

### Passo 1: Executar Auto-Setup

**Para qualquer projeto (recomendado):**

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

**Para projetos ES Module (`"type": "module"` no package.json):**

```bash
# Windows
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && del temp-setup.cjs

# macOS/Linux
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && rm temp-setup.cjs
```

**✅ O que acontece automaticamente:**

- 📦 Adiciona ~20 scripts `infra:*` ao seu `package.json`
- 🔧 Cria pasta `.infra/` com helpers cross-platform
- 📝 Atualiza `.gitignore` para ignorar arquivos da infraestrutura
- 🌟 **Zero conflitos** com scripts existentes

### Passo 2: Configurar Infraestrutura

```bash
npm run infra:setup
```

**✅ Saída esperada:**

```bash
🐳 Configurando infraestrutura PostgreSQL...
✅ Docker encontrado
🔍 Detectando porta disponível...
🎯 Porta selecionada: 5432 (ou 5433, 5434... se outras estiverem em uso)
💾 Configuração de porta salva: 5432
✅ docker-compose.yml criado com porta personalizada
✅ .env do projeto sincronizado

🎉 Infraestrutura configurada com sucesso!

📋 Configuração:
  🗄️  Database: meu_projeto_dev
  👤 User: dev_user
  🔌 Port: 5432
  🔒 Password: ABC1****

🚀 Próximos passos:
  npm run infra:up
```

### Passo 3: Subir o Banco e Testar

```bash
# Subir PostgreSQL
npm run infra:up

# Testar com Prisma (se usando)
npx prisma migrate dev

# Ou testar conexão direta
npm run infra:psql
```

**🎉 Pronto! Seu PostgreSQL está rodando!**

## 🔧 Método 2: Setup Manual (Controle Total)

Se você prefere controlar cada configuração:

```bash
# Após o auto-setup
npm run infra:setup:manual
```

**Você poderá escolher:**

- 🗄️ Nome do banco de dados
- 👤 Usuário do banco
- 🔒 Senha do banco
- 🔌 Porta específica (ex: 5435)

## 📁 Estrutura Criada

Após o setup, seu projeto terá:

```
meu-projeto/
├── package.json          # ✅ Scripts infra:* adicionados
├── .env                  # ✅ DATABASE_URL e credenciais atualizadas
├── .gitignore           # ✅ Ignora .infra/ e infra-db/
├── .infra/              # 🔧 Scripts auxiliares (não versionado)
│   ├── setup-cross-platform.js
│   ├── docker-helper.js
│   ├── db-helper.js
│   └── port-config.json # 💾 Porta salva para próximas execuções
├── infra-db/            # 🐳 Infraestrutura PostgreSQL (não versionado)
│   ├── docker-compose.yml
│   └── .env
└── src/                 # 📂 Seu código (inalterado)
```

## 🎮 Comandos Essenciais

### Uso Diário

```bash
npm run infra:up         # Subir banco
npm run infra:down       # Parar banco
npm run infra:logs       # Ver logs do PostgreSQL
npm run dev              # Seu comando de desenvolvimento (agora inclui banco)
```

### Banco de Dados

```bash
npm run infra:db:init    # Setup completo: up + migrate + seed
npm run infra:db:fresh   # Reset + migrate + seed (perde dados!)
npm run infra:psql       # Conectar ao PostgreSQL via terminal
```

### Utilitários

```bash
npm run infra:status     # Ver status dos containers
npm run infra:fix        # Corrigir problemas automaticamente
npm run infra:update     # Atualizar scripts para versão mais recente
```

## 💡 Integração com Projetos Existentes

### Next.js + Prisma

```json
{
  "scripts": {
    "dev": "npm run infra:db:init && next dev",
    "build": "npx prisma generate && next build"
  }
}
```

### NestJS

```json
{
  "scripts": {
    "start:dev": "npm run infra:db:init && nest start --watch"
  }
}
```

### Node.js/Express

```json
{
  "scripts": {
    "dev": "npm run infra:up && nodemon src/server.js"
  }
}
```

## 🔌 Múltiplos Projetos na Mesma Máquina

O sistema detecta automaticamente portas em uso:

```bash
# Projeto A (primeiro)
cd projeto-a && npm run infra:setup
# → Usa porta 5432

# Projeto B (segundo)
cd ../projeto-b && npm run infra:setup
# → Detecta 5432 em uso, usa 5433 automaticamente

# Projeto C (terceiro)
cd ../projeto-c && npm run infra:setup
# → Detecta 5432,5433 em uso, usa 5434 automaticamente
```

**✅ Isolamento total**: Cada projeto tem containers, redes e volumes únicos.

## 🚨 Problemas Comuns e Soluções

### "Port already in use"

```bash
# Forçar nova detecção de porta
npm run infra:setup:force
```

### "Docker not found"

```bash
# Verificar se Docker está rodando
docker --version
docker-compose --version

# No Windows: Iniciar Docker Desktop
# No Linux: sudo systemctl start docker
```

### "Permission denied" (Linux/macOS)

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Fazer logout/login para aplicar
```

### Scripts não encontrados

```bash
# Executar smart update
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node
```

## 🎯 Próximos Passos

Após completar este guia:

1. **Desenvolvimento diário**: Use `npm run dev` normalmente, o banco sobe automaticamente
2. **Comandos avançados**: Leia [`comandos.md`](comandos.md) para dominar todos os recursos
3. **Múltiplos projetos**: Veja [`gerenciamento-portas.md`](gerenciamento-portas.md) para entender o isolamento
4. **CI/CD**: Configure pipelines com [`ci-cd.md`](ci-cd.md)

## 💬 Precisa de Ajuda?

- 🐛 **Problema técnico**: [GitHub Issues](https://github.com/anpdgovbr/docker-infra-pg/issues)
- ❓ **Dúvida geral**: [GitHub Discussions](https://github.com/anpdgovbr/docker-infra-pg/discussions)
- 📖 **Mais detalhes**: Continue para [`comandos.md`](comandos.md)

---

**🎉 Em 5 minutos você tem PostgreSQL funcionando! Agora é só desenvolver!**
