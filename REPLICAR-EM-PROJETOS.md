# 📋 COMO USAR - Infraestrutura PostgreSQL ANPD

## 🎯 Conceito

Esta## 📁 Estrutura Final do Projeto

Após executar o setup, seu projeto terá:

```
meu-projeto/
├── package.json
├── .env                    # ⚠️ Atualize com novas credenciais
├── infra-db/              # 📂 Infraestrutura PostgreSQL
│   ├── docker-compose.yml # 🐳 Configuração do banco
│   ├── .env               # 🔧 Credenciais geradas
│   └── init/              # 📜 Scripts de inicialização
├── src/
└── ...
```

**Comandos executam a partir da pasta raiz:**

- ✅ `npm run infra:up` → executa `cd infra-db && docker-compose up -d`
- ✅ `npm run db:setup` → sobe infra + roda migrations
- ✅ Tudo funciona automaticamente

## 🔧 Templates de .env por Tipo de Projetoinfraestrutura é **100% genérica** e se adapta automaticamente ao seu projeto:

- ✅ Lê configuração do **seu projeto real**
- ✅ Gera **credenciais únicas** automaticamente
- ✅ **Zero configuração manual** necessária
- ✅ Funciona com **qualquer projeto ANPD**

## 🚀 Setup Completo

### 1. **No seu projeto, certifique-se que tem:**

```bash
# Obrigatório: package.json com name
{
  "name": "meu-projeto-anpd",
  ...
}

# Obrigatório: .env com config atual do banco
POSTGRES_DB=meu_projeto_dev
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"
```

### 2. **Execute o setup automático:**

```bash
# Uma única linha - setup completo!
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash
```

**O que acontece:**

- ✅ Infraestrutura é clonada para pasta `infra-db/` (nome sempre padronizado)
- ✅ Configuração é gerada automaticamente
- ✅ Credenciais únicas são criadas
- ✅ Banco fica pronto para uso

**💡 Nota:** A pasta local sempre será `infra-db/` independente do nome do repositório, garantindo que todos os comandos funcionem consistentemente.

### 3. **Atualize seu .env com as credenciais geradas e adicione scripts recomendados:**

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "infra:reset": "cd infra-db && docker-compose down -v && docker-compose up -d",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed",
    "db:fresh": "npm run infra:reset && sleep 10 && npm run db:setup"
  }
}
```

### 4. **Workflow de desenvolvimento:**

```bash
# Setup inicial (primeira vez)
npm run infra:setup

# Desenvolvimento diário
npm run db:setup && npm run dev

# Reset do banco (quando necessário)
npm run db:fresh
```

## � Templates de .env.example por Tipo de Projeto

### **Projeto Next.js com Prisma (padrão ANPD):**

```bash
# 📊 BANCO DE DADOS (obrigatório)
POSTGRES_DB=nome_projeto_dev
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# 🔐 AUTENTICAÇÃO
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# 🏢 AZURE AD (se usando auth corporativa)
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# 🌐 DESENVOLVIMENTO
NODE_TLS_REJECT_UNAUTHORIZED=0
NEXT_PUBLIC_APP_NAME=Nome da Aplicação

# 📡 APIs específicas do projeto
# API_BASE_URL=https://api.exemplo.gov.br
```

### **Projeto React/Vite:**

```bash
# � BANCO DE DADOS (obrigatório)
POSTGRES_DB=nome_projeto_dev
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# 🌐 DESENVOLVIMENTO
VITE_APP_NAME=Nome da Aplicação
VITE_API_URL=http://localhost:3001

# Outras variáveis específicas...
```

## 📊 Como Funciona a Auto-Configuração

### 1. **Script lê seu projeto real:**

```bash
# Extrai nome do projeto
PROJECT_NAME=$(node -p "require('./package.json').name")

# Lê configuração atual do banco (do .env real)
DB_CONFIG=$(grep POSTGRES_DB .env)
```

### 2. **Gera credenciais únicas automaticamente:**

```bash
# Senha segura aleatória (SEMPRE nova)
DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

# Usuário baseado no projeto
DB_USER="${PROJECT_NAME}_user_db"
```

### 3. **Cria infraestrutura personalizada:**

- ✅ docker-compose.yml com nome correto
- ✅ .env com credenciais geradas automaticamente
- ✅ Scripts de inicialização do banco
- ✅ DATABASE_URL pronta com credenciais reais

### 4. **Mantém segurança total:**

- 🔒 Nunca usa senhas hardcoded
- 🔒 Sempre gera credenciais únicas
- 🔒 Lê configuração do projeto real (não examples)
- 🔒 Zero risco de vazamento de dados

## ✅ Vantagens Desta Abordagem

### **Para Desenvolvedores:**

- 🚀 Setup em 1 comando
- 🔒 Credenciais sempre seguras
- 🎯 Zero configuração manual
- 📝 Documentação automática

### **Para Projetos:**

- 🔄 Reutilização total
- 🎨 Adaptação automática
- 🛡️ Isolamento garantido
- 📈 Padronização natural

### **Para a ANPD:**

- 🏗️ Infraestrutura unificada
- 🔧 Manutenção centralizada
- 📚 Conhecimento padronizado
- ⚡ Produtividade maximizada

## 💡 Exemplos de Uso Real

### **Qualquer projeto ANPD:**

```bash
# 1. Setup (uma vez)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash

# 2. Desenvolvimento diário
npm run db:setup && npm run dev
```

### **Novo projeto exemplo:**

```bash
# 1. Configure .env.example
POSTGRES_DB=meu_projeto_dev
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# 2. Setup automático
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash

# 3. Banco funcionando!
npm run infra:up
```

## 📝 Notas Importantes

### ✅ **Faça Sempre:**

- Configure `.env.example` completo antes do setup
- Use nomes descritivos para bancos (`projeto_dev`)
- Adicione scripts recomendados ao `package.json`
- Documente variáveis específicas do projeto

### ❌ **Nunca Faça:**

- Commitar arquivo `.env` real
- Usar dados reais em templates
- Modificar a infraestrutura para ser específica
- Hardcoded credenciais nos scripts

### 🛡️ **Segurança:**

- Senhas são sempre geradas automaticamente
- Cada projeto tem credenciais únicas
- Bancos são isolados por projeto
- Templates nunca contêm dados reais

---

## 🎯 Resultado Final

**Qualquer projeto ANPD em 1 comando:**

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash
```

**Zero configuração. Máxima produtividade. Segurança total.** 🚀
