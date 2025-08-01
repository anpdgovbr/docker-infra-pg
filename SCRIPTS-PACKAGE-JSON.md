# 📦 Templates de Scripts para package.json

Este arquivo contém templates prontos para diferentes tipos de projetos ANPD.

## 🎯 Scripts Básicos (Mínimo Necessário)

Para projetos simples que só precisam do essencial:

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate"
  }
}
```

## 🚀 Scripts Completos (Recomendado)

Para desenvolvimento profissional com todas as funcionalidades:

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
    "infra:psql": "cd infra-db && docker-compose exec postgres psql -U admin postgres",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed",
    "db:fresh": "npm run infra:reset && sleep 10 && npm run db:setup",
    "dev": "npm run db:setup && next dev"
  }
}
```

## 🏢 Scripts para CI/CD e Produção

Para ambientes automatizados e produção:

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:setup:ci": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --auto",
    "infra:setup:test": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --db-name=test_db --auto",
    "infra:setup:prod": "wget -q -O setup-infra.sh https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh && chmod +x setup-infra.sh && ./setup-infra.sh --force --db-name=prod_db --db-user=prod_user --db-password=$PROD_DB_PASSWORD && rm setup-infra.sh",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "infra:reset": "cd infra-db && docker-compose down -v && docker-compose up -d",
    "infra:backup": "cd infra-db && docker-compose exec postgres pg_dump -U admin postgres > backup.sql",
    "infra:restore": "cd infra-db && docker-compose exec -T postgres psql -U admin postgres < backup.sql",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed",
    "db:fresh": "npm run infra:reset && sleep 10 && npm run db:setup",
    "test:integration": "npm run infra:setup:test && npm run test",
    "build:prod": "npm run infra:setup:prod && npm run build"
  }
}
```

## 📱 Next.js + Prisma (Template ANPD Padrão)

Para projetos Next.js com Prisma (mais comum na ANPD):

```json
{
  "name": "@anpdgovbr/meu-projeto",
  "scripts": {
    "dev": "npm run db:setup && next dev",
    "build": "next build",
    "start": "next start",
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:setup:manual": "wget -q -O setup-infra.sh https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh && chmod +x setup-infra.sh && ./setup-infra.sh --manual && rm setup-infra.sh",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "infra:reset": "cd infra-db && docker-compose down -v && docker-compose up -d",
    "infra:clean": "npm run infra:down && rm -rf infra-db",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed",
    "db:fresh": "npm run infra:reset && sleep 10 && npm run db:setup",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset --force"
  }
}
```

## 🔧 Node.js/Express + Prisma

Para APIs e backends:

```json
{
  "name": "@anpdgovbr/minha-api",
  "scripts": {
    "dev": "npm run db:setup && nodemon src/server.js",
    "start": "node src/server.js",
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "infra:reset": "cd infra-db && docker-compose down -v && docker-compose up -d",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed",
    "db:fresh": "npm run infra:reset && sleep 10 && npm run db:setup",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:integration": "npm run infra:setup:test && npm run test"
  }
}
```

## 🐳 Docker + GitHub Actions (CI/CD)

Para projetos com pipeline automatizado:

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:setup:ci": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --auto",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate",
    "db:setup:ci": "npm run infra:setup:ci && npm run db:setup",
    "test": "jest",
    "test:ci": "npm run db:setup:ci && npm run test",
    "build": "next build",
    "build:ci": "npm run db:setup:ci && npm run build",
    "deploy": "npm run build && npm run deploy:vercel"
  }
}
```

## 🎯 Scripts por Caso de Uso

### **Setup Inicial (Primeira vez)**

```bash
npm run infra:setup      # Automático via curl
npm run dev              # Inicia desenvolvimento
```

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

## 💡 Dicas de Personalização

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
