# 📋 COMO USAR - Infraestrutura PostgreSQL ANPD

## 🎯 Conceito

Esta infraestrutura é **100% genérica** e se adapta automaticamente ao seu projeto:

- ✅ **Preserva dados existentes** no .env
- ✅ **Detecta dados faltantes** inteligentemente
- ✅ **Oferece opções flexíveis** (auto, manual, parar)
- ✅ **Sincroniza automaticamente** seu .env
- ✅ **Funciona via pipe** (`curl | node`) ou local
- ✅ Funciona com **qualquer projeto ANPD**

## 🚀 Setup Completo

### 1. **No seu projeto, certifique-se que tem:**

```bash
# Obrigatório: package.json com name
{
  "name": "meu-projeto-anpd",
  ...
}

# Obrigatório: arquivo .env (pode ter dados vazios ou completos)
POSTGRES_DB=meu_projeto_dev  # ou vazio: POSTGRES_DB=
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"  # ou vazio
```

### 2. **Execute o setup automático:**

```bash
# Uma única linha - setup completo!
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

**O que acontece automaticamente:**

- ⚡ **Detecta tipo de projeto**: ES Module ou CommonJS
- 🔍 **Adiciona scripts necessários**: Todos os comandos `infra:*`
- ⚠️ **Configura .gitignore**: Ignora pastas `.infra/` e `infra-db/`
- 🤖 **Cria estrutura**: Pasta `.infra/` para arquivos auxiliares
- � **Preserva arquivos existentes**: Não sobrescreve scripts existentes
- 🔄 **Compatibilidade total**: Windows, macOS, Linux

### 3. **Workflows por Cenário:**

#### 🎯 **Projeto Novo (Recomendado)**

```bash
# Crie .env básico (pode estar vazio)
echo 'POSTGRES_DB=' > .env
echo 'DATABASE_URL=' >> .env

# Execute setup
npm run infra:setup

# Resultado: Tudo gerado automaticamente!
# DB_NAME: meu-projeto-anpd_dev
# DB_USER: meu-projeto-anpd_user_db
# DB_PASSWORD: [gerada criptograficamente]
```

#### 🔧 **Projeto Existente (Preservar Dados)**

```bash
# Seu .env já tem dados
POSTGRES_DB=meu_projeto_prod
DATABASE_URL="postgresql://admin:senha123@localhost:5432/meu_projeto_prod?schema=public"

# Execute setup
npm run infra:setup

# Resultado: Dados preservados integralmente!
# DB_NAME: meu_projeto_prod (preservado)
# DB_USER: admin (preservado)
# DB_PASSWORD: senha123 (preservada)
```

#### ✏️ **Controle Manual Completo**

```bash
# Download para controle local
npm run infra:setup:manual

# Ou especificar dados exatos
wget https://raw.../setup-infra.sh
chmod +x setup-infra.sh
./setup-infra.sh --force --db-name=custom --db-user=myuser --db-password=mypass
```

## 📁 Estrutura Final do Projeto

Após executar o setup, seu projeto terá:

```
meu-projeto/
├── package.json
├── .env                    # ✅ Atualizado automaticamente
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

## 📖 Scripts Completos para package.json

### 🎮 **Scripts Básicos (Essenciais)**

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed"
  }
}
```

### 🚀 **Scripts Avançados (Recomendados)**

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

### 🔧 **Scripts Especializados (Opcionais)**

```json
{
  "scripts": {
    "infra:setup:test": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash -s -- --force --db-name=test_db --auto",
    "infra:setup:prod": "wget -q -O setup-infra.sh https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh && chmod +x setup-infra.sh && ./setup-infra.sh --force --db-name=prod_db --db-user=prod_user --db-password=$PROD_DB_PASSWORD && rm setup-infra.sh",
    "infra:backup": "cd infra-db && docker-compose exec postgres pg_dump -U admin postgres > backup.sql",
    "infra:restore": "cd infra-db && docker-compose exec -T postgres psql -U admin postgres < backup.sql",
    "infra:psql": "cd infra-db && docker-compose exec postgres psql -U admin postgres"
  }
}
```

## 🎮 Comandos de Uso Diário

```bash
# Setup inicial (primeira vez)
npm run infra:setup

# Setup com controle manual
npm run infra:setup:manual

# Setup forçado (CI/CD)
npm run infra:setup:force

# Desenvolvimento diário
npm run db:setup && npm run dev

# Gerenciar infraestrutura
npm run infra:up          # Subir banco
npm run infra:down        # Parar banco
npm run infra:logs        # Ver logs do PostgreSQL
npm run infra:reset       # Reset completo (perde dados)

# Reset do banco (quando necessário)
npm run db:fresh

# Limpar tudo (remove pasta infra-db)
npm run infra:clean

# Acesso direto ao PostgreSQL
npm run infra:psql
```

## 🔧 Parâmetros Avançados

### **Download Local para Máximo Controle:**

```bash
# Download do script
wget https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh
chmod +x setup-infra.sh

# Execução com parâmetros
./setup-infra.sh --help                    # Ver ajuda
./setup-infra.sh --force --auto            # Automático forçado
./setup-infra.sh --manual                  # Modo manual
./setup-infra.sh --force --db-name=custom --db-user=user --db-password=pass

# Limpeza
rm setup-infra.sh
```

### **Variáveis de Ambiente (Avançado):**

```bash
# Customizar repositório (se necessário)
export DOCKER_INFRA_REPO=meu-fork-infra
npm run infra:setup
```

## 🔧 Templates de .env por Tipo de Projeto

### **Projeto Next.js com Prisma (padrão ANPD):**

```bash
# 📊 BANCO DE DADOS (obrigatório)
POSTGRES_DB=meu_projeto_dev
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# 🔐 AUTENTICAÇÃO (opcional)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# 🌐 AMBIENTE (opcional)
NODE_ENV=development
PORT=3000
```

### **Projeto Node.js/Express:**

```bash
# 📊 BANCO DE DADOS
POSTGRES_DB=api_project_dev
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# 🚀 SERVIDOR
PORT=8000
NODE_ENV=development

# 🔐 JWT (se usar)
JWT_SECRET=your-jwt-secret
```

### **Projeto NestJS (TypeORM):**

Coloque apenas as variáveis que deseja que o setup preencha/mantenha. O script só altera as que estiverem listadas no seu .env.example.

```bash
# 📊 BANCO DE DADOS
POSTGRES_DB=meu_nest_dev
DATABASE_URL="postgresql://user:password@localhost:5432/meu_nest_dev?schema=public"

# 🔧 TypeORM (opcional, se preferir separar do DATABASE_URL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meu_nest_dev
DB_USERNAME=nest_user
DB_PASSWORD=

# Ou keyspace TypeORM específico
TYPEORM_HOST=localhost
TYPEORM_PORT=5432
TYPEORM_USERNAME=nest_user
TYPEORM_PASSWORD=
TYPEORM_DATABASE=meu_nest_dev
```

### **Projeto React (puro):**

Normalmente não acessa banco diretamente, então não precisa de variáveis de DB. O script ignora quando não há variáveis no .env.example.

```bash
# 🌐 FRONT-END
VITE_API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **Projeto Spring Boot:**

```bash
# 📊 BANCO DE DADOS
POSTGRES_DB=app_spring_dev
DATABASE_URL="postgresql://user:password@localhost:5432/app_spring_dev?schema=public"

# 🔌 Datasource (opcional)
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
```

Se `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` estiverem vazios, o setup preencherá com `jdbc:postgresql://localhost:5432/<db>` e usuário/senha correspondentes.

### **Projeto Quarkus:**

```bash
# 📊 BANCO DE DADOS
POSTGRES_DB=app_quarkus_dev
DATABASE_URL="postgresql://user:password@localhost:5432/app_quarkus_dev?schema=public"

# 🔌 Datasource (opcional)
QUARKUS_DATASOURCE_DB_KIND=postgresql
QUARKUS_DATASOURCE_JDBC_URL=
QUARKUS_DATASOURCE_USERNAME=
QUARKUS_DATASOURCE_PASSWORD=
```

### **Keycloak (iam-deploy):**

```bash
# Senhas para Keycloak (preenchidas automaticamente quando vazias)
KEYCLOAK_ADMIN_PASSWORD=
KEYCLOAK_DB_PASSWORD=
```

Observações:
- Valores já existentes no `.env` são preservados.
- Valores vazios são preenchidos com senhas seguras.
- Variáveis não listadas no `.env.example` são ignoradas (não são adicionadas automaticamente).

### **Projeto em Produção:**

```bash
# 📊 BANCO DE DADOS PRODUÇÃO
POSTGRES_DB=meu_projeto_prod
DATABASE_URL="postgresql://prod_user:secure_password@localhost:5432/meu_projeto_prod?schema=public"

# 🌐 AMBIENTE
NODE_ENV=production
PORT=3000

# 🔐 SEGURANÇA
NEXTAUTH_SECRET=super-secure-secret-for-production
```

## 🚨 Resolução de Problemas

### **Problema: "Não consegue ler input via curl | bash"**

```bash
# Solução: O script detecta automaticamente e usa modo automático
# Não precisa fazer nada, vai funcionar!

# Alternativa: Download local
wget https://raw.../setup-infra.sh && chmod +x setup-infra.sh && ./setup-infra.sh
```

### **Problema: "Diretório infra-db já existe"**

```bash
# Solução 1: Usar --force
npm run infra:setup:force

# Solução 2: Limpar e recriar
npm run infra:clean && npm run infra:setup
```

### **Problema: "Dados no .env não são detectados"**

```bash
# Verificar formato (sem espaços extras):
POSTGRES_DB=meudb
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"

# Não pode ter:
POSTGRES_DB = meudb        # espaços extras
DATABASE_URL='...'         # aspas simples
```

### **Problema: "Script não encontra package.json"**

```bash
# Executar na pasta raiz do projeto:
cd /caminho/para/meu-projeto
npm run infra:setup
```

## 🔒 Segurança e Boas Práticas

### ✅ **O que o Script FAZ:**

- Preserva credenciais existentes
- Gera senhas criptograficamente seguras
- Isola bancos por projeto
- Sincroniza .env automaticamente
- Remove .git da infra clonada

### ✅ **O que o Script NÃO FAZ:**

- Não expõe senhas em logs
- Não sobrescreve dados sem permissão
- Não conecta em bancos externos
- Não modifica arquivos fora do projeto

### 🔐 **Recomendações:**

- Sempre revise o .env após setup
- Use senhas diferentes por ambiente
- Mantenha .env no .gitignore
- Use variáveis de ambiente em produção

---

**Uma infraestrutura. Todos os projetos ANPD. Zero configuração manual.** 🎉

## 🔐 Nota sobre Segredos

Ao executar comandos que exibem URLs, as senhas são mascaradas por padrão. Para exibir temporariamente use `--show-secrets` ou defina `SHOW_SECRETS=1`. Para ver pilhas completas nos erros use `--verbose` ou `VERBOSE=1`.
