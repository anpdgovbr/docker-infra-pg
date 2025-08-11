# 🎯 Integração em Projeto Existente (@anpdgovbr/backlog-dim)

Este guia mostra como adicionar a infraestrutura PostgreSQL em um projeto ANPD que já existe, **sem quebrar nada**.

## 📋 Estado Atual do Projeto

Seu `package.json` atual:

```json
{
  "name": "@anpdgovbr/backlog-dim",
  "scripts": {
    "build": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=1 npx prisma generate && next build",
    "dev": "npm run build-routes && next dev --turbopack",
    "prisma:migrate": "npx prisma migrate dev --name init",
    "prisma:seed": "npx prisma db seed",
    "prisma:studio": "npx prisma studio",
    "db:reset": "npx prisma migrate reset --force",
    "db:seed": "npx tsx prisma/seed.ts"
  }
}
```

## ✅ Integração Sem Conflitos

## ✅ Integração Sem Conflitos

### **Escolha sua Abordagem:**

#### **🤖 Opção 0: Auto-Setup (Mais Fácil)**

Setup automático com um comando:

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

Isso irá:

- ✅ Adicionar todos os scripts `infra:*` ao package.json
- ✅ Configurar .gitignore automaticamente
- ✅ Criar pasta `.infra`
- ✅ Não modificar nenhum script existente

#### **🔒 Opção 1: Pasta `.infra` (Recomendada - Não versionada)**

Helpers ficam em pasta separada, ignorada pelo Git:

```json
{
  "scripts": {
    // ... todos os seus scripts existentes ficam iguais ...

    // Novos scripts da infraestrutura (sem conflitos):
    "infra:setup": "mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js && node .infra/setup-cross-platform.js",
    "infra:setup:manual": "node .infra/setup-cross-platform.js --manual",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:psql": "node .infra/docker-helper.js psql",
    "infra:db:init": "node .infra/db-helper.js setup"
  }
}
```

#### **📦 Opção 2: Via `postinstall` (Versionada)**

Helpers baixados automaticamente no `npm install`:

```json
{
  "scripts": {
    // ... todos os seus scripts existentes ficam iguais ...

    "postinstall": "mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js",
    "infra:setup": "node .infra/setup-cross-platform.js",
    "infra:setup:manual": "node .infra/setup-cross-platform.js --manual",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:logs": "node .infra/docker-helper.js logs",
    "infra:psql": "node .infra/docker-helper.js psql",
    "infra:db:init": "node .infra/db-helper.js setup"
  }
}
```

#### **🌐 Opção 3: Download Dinâmico (Sem arquivos locais)**

Baixa e executa na hora, sem criar arquivos:

```json
{
  "scripts": {
    // ... todos os seus scripts existentes ficam iguais ...

    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "infra:psql": "cd infra-db && docker-compose exec postgres psql -U admin postgres"
  }
}
```

### **Passo 1: Adicionar Scripts da Infraestrutura**

Escolha uma das opções acima e adicione ao seu `package.json` existente.

### **Passo 2: Modificar Apenas o Script `dev` (Opcional)**

Se quiser que o banco suba automaticamente no `dev`:

**Para Opção 1 (.infra):**

```json
{
  "scripts": {
    "dev": "npm run build-routes && npm run infra:db:init && next dev --turbopack"
  }
}
```

**Para Opção 2 (postinstall):**

```json
{
  "scripts": {
    "dev": "npm run build-routes && npm run infra:db:init && next dev --turbopack"
  }
}
```

**Para Opção 3 (bash):**

```json
{
  "scripts": {
    "dev": "npm run build-routes && npm run infra:up && next dev --turbopack"
  }
}
```

**Ou manter como está** e subir o banco manualmente quando preciso.

### **Passo 3: Configurar .gitignore**

#### **Para Opção 1 (.infra - Recomendado):**

```gitignore
# Infraestrutura PostgreSQL ANPD (não versionada)
.infra/
infra-db/
```

#### **Para Opção 2 (postinstall - Versionada):**

```gitignore
# Infraestrutura PostgreSQL ANPD
infra-db/

# Opcional: Se não quiser versionar os helpers
setup-cross-platform.js
docker-helper.js
db-helper.js
```

#### **Para Opção 3 (bash - Mínima):**

```gitignore
# Infraestrutura PostgreSQL ANPD
infra-db/
```

## 📊 **Comparação das Opções**

| Aspecto             | Auto-Setup              | Opção 1 (.infra)    | Opção 2 (postinstall)  | Opção 3 (bash)       |
| ------------------- | ----------------------- | ------------------- | ---------------------- | -------------------- |
| **Facilidade**      | 🥇 **Um comando**       | ✅ Simples          | ✅ Simples             | ⚠️ Manual            |
| **Git Cleanliness** | ✅ Muito limpo          | ✅ Muito limpo      | ⚠️ Helpers versionados | ✅ Muito limpo       |
| **Cross-Platform**  | ✅ Perfeito             | ✅ Perfeito         | ✅ Perfeito            | ❌ Problemas Windows |
| **Onboarding**      | 🥇 **Instantâneo**      | ✅ Simples          | ✅ Automático          | ⚠️ Requer bash       |
| **CI/CD**           | ✅ Funciona             | ✅ Funciona         | ✅ Funciona            | ⚠️ Limitado          |
| **Manutenção**      | ✅ Baixa                | ✅ Baixa            | ✅ Baixa               | ⚠️ Manual            |
| **Recomendação**    | 🥇 **Para preguiçosos** | 🥈 Primeira escolha | � Segunda escolha      | ❌ Evitar            |

## 💡 **Recomendações por Cenário**

### **🏢 Projetos Corporativos ANPD (Como backlog-dim)**

**Use Auto-Setup ou Opção 1 (.infra)**

- ✅ Git limpo e profissional
- ✅ Setup em segundos
- ✅ Funciona em qualquer máquina

### **👥 Projetos de Equipe**

**Use Auto-Setup**

- ✅ Onboarding instantâneo
- ✅ Consistência automática entre desenvolvedores
- ✅ Zero configuração manual

### **🚀 Protótipos/MVPs**

**Use Auto-Setup**

- ✅ Setup mais rápido possível
- ✅ Funciona em qualquer plataforma

### **🔧 CI/CD Pipelines**

**Use Auto-Setup ou Opção 1 (.infra)**

- ✅ Máxima compatibilidade
- ✅ Setup determinístico

## 🚀 Uso no Dia a Dia

### **Primeira Vez (Setup)**

```bash
npm run infra:setup
```

### **Desenvolvimento (Opção 1 - Automático)**

Se modificou o script `dev`:

```bash
npm run dev  # Banco sobe automaticamente
```

### **Desenvolvimento (Opção 2 - Manual)**

Se manteve o script `dev` original:

```bash
npm run infra:up     # Subir banco
npm run dev          # Desenvolvimento
```

### **Comandos Disponíveis**

Você tem **duas opções** para cada operação:

#### **Comandos Prisma Nativos (seus scripts atuais):**

```bash
npm run prisma:studio    # Prisma Studio
npm run prisma:migrate   # Migrações Prisma
npm run prisma:seed      # Seed Prisma
npm run db:reset         # Reset Prisma
npm run db:seed          # Seed customizado
```

#### **Comandos da Infraestrutura (novos):**

```bash
npm run infra:up         # Subir PostgreSQL
npm run infra:down       # Parar PostgreSQL
npm run infra:logs       # Ver logs
npm run infra:psql       # Conectar ao banco
npm run infra:db:init    # Setup completo (up + migrate + seed)
```

## 🎯 Vantagens da Integração

### ✅ **Sem Conflitos**

- Scripts da infraestrutura usam prefixo `infra:*`
- Seus scripts atuais funcionam exatamente como antes
- Nenhum script existente é modificado

### ✅ **Flexibilidade Total**

- Use comandos Prisma nativos quando quiser
- Use comandos da infraestrutura quando for conveniente
- Alterne entre os dois conforme a necessidade

### ✅ **Banco Isolado**

- PostgreSQL roda em Docker (isolado)
- Não interfere com instalações locais
- Configuração automática (usuário, senha, database)

### ✅ **Cross-Platform**

- Funciona no Windows, macOS, Linux
- Mesmo comportamento para toda a equipe
- Sem problemas de ambiente

## 📊 Comparação de Comandos

| Operação | Comando Atual            | Comando Infraestrutura                           |
| -------- | ------------------------ | ------------------------------------------------ |
| Studio   | `npm run prisma:studio`  | `npm run infra:db:init && npm run prisma:studio` |
| Migrate  | `npm run prisma:migrate` | `npm run infra:up && npm run prisma:migrate`     |
| Seed     | `npm run db:seed`        | `npm run infra:up && npm run db:seed`            |
| Reset    | `npm run db:reset`       | `npm run infra:up && npm run db:reset`           |

## 🔧 Casos de Uso Específicos

### **Desenvolvimento Solo**

```bash
npm run infra:up      # Uma vez por sessão
npm run dev           # Desenvolvimento normal
```

### **Onboarding de Novo Desenvolvedor**

```bash
git clone projeto
npm install
npm run infra:setup   # Configura tudo automaticamente
npm run dev           # Funciona imediatamente
```

### **CI/CD**

```bash
npm run infra:setup:ci  # Setup automático sem interação
npm run test            # Testes com banco funcionando
```

### **Problema no Banco**

```bash
npm run infra:down && npm run infra:up  # Restart limpo
npm run infra:db:init                   # Reconfigurar
```

## 🛠️ Troubleshooting

### **Se der conflito com algum script:**

1. Renomeie o script da infraestrutura
2. Por exemplo: `infra:db:init` → `infra:db:setup`

### **Se quiser remover a infraestrutura:**

1. Delete os scripts que começam com `infra:`
2. Delete os arquivos `*-helper.js`
3. Delete a pasta `infra-db`

### **Se quiser usar só Prisma nativo:**

1. Execute `npm run infra:up` uma vez
2. Use seus comandos normais: `npm run prisma:studio`, etc.

---

**Integração 100% compatível com projetos ANPD existentes! 🎉**
