# 🚀 CI/CD e Automação

Este arquivo documenta como usar a infraestrutura PostgreSQL em pipelines de CI/CD e automação.

## 🎯 GitHub Actions

### **Workflow Básico (Next.js + Prisma)**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Database Infrastructure
        run: npm run infra:setup:ci

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build
```

### **Workflow com Matrix (Múltiplas Versões)**

```yaml
name: CI Matrix

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm run infra:setup:ci
      - run: npm run test
```

### **Workflow Completo (Deploy)**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run infra:setup:ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🔧 Scripts de CI/CD para package.json

### **Scripts Básicos para CI**

```json
{
  "scripts": {
    "infra:setup:ci": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --auto",
    "test:ci": "npm run infra:setup:ci && npm run test",
    "build:ci": "npm run infra:setup:ci && npm run build",
    "deploy:ci": "npm run build:ci && npm run deploy"
  }
}
```

### **Scripts Avançados para CI**

```json
{
  "scripts": {
    "infra:setup:ci": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --auto",
    "infra:setup:test": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --db-name=ci_test --auto",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "npm run infra:setup:test && jest --testPathPattern=integration",
    "test:e2e": "npm run infra:setup:ci && playwright test",
    "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "build:ci": "npm run infra:setup:ci && npm run build",
    "quality:check": "npm run lint && npm run typecheck && npm run test:unit"
  }
}
```

## 🐳 Docker

### **Dockerfile com Infraestrutura**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Setup da infraestrutura no build
RUN npm run infra:setup:ci

# Build da aplicação
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### **docker-compose.yml para Development**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp_dev
      POSTGRES_USER: myapp_user
      POSTGRES_PASSWORD: myapp_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## ⚡ Vercel

### **Scripts para Vercel**

```json
{
  "scripts": {
    "build": "npm run infra:setup:ci && next build",
    "vercel-build": "npm run build",
    "start": "next start"
  }
}
```

### **vercel.json**

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

## 🚀 Netlify

### **Scripts para Netlify**

```json
{
  "scripts": {
    "build": "npm run infra:setup:ci && npm run build:static",
    "build:static": "next build && next export"
  }
}
```

### **netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"
```

## 🔄 GitLab CI

### **.gitlab-ci.yml**

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: '18'

cache:
  paths:
    - node_modules/

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run infra:setup:ci
    - npm run test
  artifacts:
    reports:
      junit: junit.xml
      coverage: coverage/

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build:ci
  artifacts:
    paths:
      - .next/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: node:$NODE_VERSION
  script:
    - npm run deploy
  only:
    - main
```

## 🏗️ Jenkins

### **Jenkinsfile**

```groovy
pipeline {
    agent any

    tools {
        nodejs "18"
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Setup Infrastructure') {
            steps {
                sh 'npm run infra:setup:ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'junit.xml'
                    publishCoverageGoberturaReport 'coverage/cobertura-coverage.xml'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run deploy'
            }
        }
    }
}
```

## 🎯 Scripts por Ambiente

### **Desenvolvimento Local**

```json
{
  "scripts": {
    "dev": "npm run infra:setup && npm run dev:next",
    "dev:next": "next dev",
    "dev:db": "npm run infra:up && npm run prisma:studio"
  }
}
```

### **Testing**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "npm run infra:setup:test && jest --testPathPattern=integration",
    "test:e2e": "npm run infra:setup:ci && playwright test"
  }
}
```

### **Staging**

```json
{
  "scripts": {
    "build:staging": "NODE_ENV=staging npm run build",
    "deploy:staging": "npm run build:staging && vercel --target staging"
  }
}
```

### **Production**

```json
{
  "scripts": {
    "build:prod": "NODE_ENV=production npm run build",
    "deploy:prod": "npm run build:prod && vercel --prod"
  }
}
```

## 🔐 Variáveis de Ambiente para CI/CD

### **GitHub Actions Secrets**

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### **Scripts com Variáveis**

```json
{
  "scripts": {
    "infra:setup:prod": "curl -sSL https://raw.../setup-infra.sh | bash -s -- --force --db-name=$PROJECT_NAME --db-user=$DB_USER --db-password=$DB_PASSWORD",
    "deploy:prod": "DATABASE_URL=$PROD_DATABASE_URL npm run build && npm run deploy"
  }
}
```

## 🛠️ Debugging CI/CD

### **Scripts de Debug**

```json
{
  "scripts": {
    "debug:env": "env | grep -E '(DATABASE|NODE|VERCEL)'",
    "debug:db": "npm run infra:up && cd infra-db && docker-compose ps",
    "debug:connection": "npm run infra:up && node -e \"console.log(process.env.DATABASE_URL)\""
  }
}
```

### **Logs Detalhados**

```bash
# No CI, use flags de debug
npm run infra:setup:ci --verbose
npm run test --verbose
npm run build --debug
```

## 📊 Métricas e Monitoramento

### **Scripts de Monitoramento**

```json
{
  "scripts": {
    "health:check": "node scripts/health-check.js",
    "metrics:collect": "node scripts/collect-metrics.js",
    "performance:test": "npm run infra:setup:ci && lighthouse-ci autorun"
  }
}
```

---

**Automatize tudo e desenvolva com tranquilidade! 🚀**
