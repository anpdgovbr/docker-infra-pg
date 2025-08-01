#!/bin/bash
# ============================================================================
# SETUP SCRIPT - Clone e Configure Infraestrutura PostgreSQL
# ============================================================================
# Use este script para clonar e configurar a infraestrutura PostgreSQL
# baseada nas variáveis de ambiente do seu projeto

set -e

echo "🚀 Configurando infraestrutura PostgreSQL para sua aplicação..."
echo

# Verificar se estamos na pasta correta (deve ter package.json)
if [[ ! -f "package.json" ]]; then
    echo "❌ Este script deve ser executado na pasta raiz do seu projeto (onde está o package.json)"
    exit 1
fi

# Verificar se já existe infra-db
if [[ -d "infra-db" ]]; then
    echo "⚠️  Diretório infra-db já existe"
    read -p "Deseja sobrescrever? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf infra-db
    else
        echo "❌ Operação cancelada"
        exit 0
    fi
fi

# Clonar infraestrutura
echo "📥 Clonando infraestrutura PostgreSQL..."
git clone https://github.com/anpdgovbr/docker-infra-pg.git infra-db
cd infra-db

# Remover .git para não conflitar
rm -rf .git

# Ler variáveis do projeto
cd ..
echo "🔍 Lendo configurações do projeto..."

# Verificar se existe .env.example no projeto
if [[ ! -f ".env.example" ]]; then
    echo "❌ Arquivo .env.example não encontrado no projeto"
    echo "💡 Crie um .env.example com as variáveis necessárias"
    exit 1
fi

# Extrair informações necessárias
APP_NAME=$(grep -E "^name.*:" package.json | sed 's/.*"@[^/]*\/\([^"]*\)".*/\1/' || echo "minha-app")
DB_NAME=$(grep "^POSTGRES_DB=" .env.example | cut -d'=' -f2 | tr -d '"' || echo "${APP_NAME}_dev")
DATABASE_URL_EXAMPLE=$(grep "^DATABASE_URL=" .env.example | cut -d'=' -f2 | tr -d '"')

# Extrair user e password do DATABASE_URL se disponível
if [[ -n "$DATABASE_URL_EXAMPLE" && "$DATABASE_URL_EXAMPLE" != *"user:password"* ]]; then
    DB_USER=$(echo "$DATABASE_URL_EXAMPLE" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASSWORD=$(echo "$DATABASE_URL_EXAMPLE" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
else
    DB_USER="${APP_NAME}_user"
    DB_PASSWORD="senha_${APP_NAME}_456"
fi

echo "📋 Configurações detectadas:"
echo "   APP_NAME: $APP_NAME"
echo "   DB_NAME: $DB_NAME"
echo "   DB_USER: $DB_USER"
echo "   DB_PASSWORD: [gerada automaticamente]"
echo

# Criar .env para infraestrutura
echo "⚙️  Criando configuração da infraestrutura..."
cat > infra-db/.env << EOF
# Configuração gerada automaticamente para $APP_NAME
APP_NAME=$APP_NAME
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin_$(openssl rand -hex 8)
POSTGRES_DB=postgres
POSTGRES_PORT=5432

# Configurações do banco da aplicação
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
EOF

echo "✅ Infraestrutura configurada com sucesso!"
echo
echo "📝 Próximos passos:"
echo "1. cd infra-db && docker-compose up -d"
echo "2. Atualize seu .env com:"
echo "   DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo "3. Execute suas migrations: npm run prisma:migrate"
echo "4. Execute seed se necessário: npm run prisma:seed"
echo
echo "🔌 String de conexão:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
