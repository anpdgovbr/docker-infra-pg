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

# Detectar nome do repositório automaticamente (para futura flexibilidade)
# Por padrão usa docker-infra-pg, mas pode ser customizado
REPO_NAME="${DOCKER_INFRA_REPO:-docker-infra-pg}"
INFRA_DIR="infra-db"  # Nome padronizado para a pasta local (sempre infra-db)

# Verificar se já existe pasta da infraestrutura
if [[ -d "$INFRA_DIR" ]]; then
    echo "⚠️  Diretório $INFRA_DIR já existe"
    read -p "Deseja sobrescrever? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$INFRA_DIR"
    else
        echo "❌ Operação cancelada"
        exit 0
    fi
fi

# Clonar infraestrutura
echo "📥 Clonando infraestrutura PostgreSQL..."
git clone https://github.com/anpdgovbr/$REPO_NAME.git "$INFRA_DIR"
cd "$INFRA_DIR"

# Remover .git para não conflitar
rm -rf .git

# Ler variáveis do projeto
cd ..
echo "🔍 Lendo configurações do projeto..."

# Verificar se existe .env no projeto (configuração real)
if [[ ! -f ".env" ]]; then
    echo "❌ Arquivo .env não encontrado no projeto"
    echo "💡 Crie um .env com as configurações do seu banco de dados"
    echo "   Exemplo mínimo:"
    echo "   POSTGRES_DB=meu_projeto_dev"
    echo "   DATABASE_URL=\"postgresql://user:password@localhost:5432/database?schema=public\""
    exit 1
fi

# Extrair informações necessárias do projeto
APP_NAME=$(node -p "require('./package.json').name" 2>/dev/null | sed 's/@[^/]*\///g' || echo "minha-app")
DB_NAME=$(grep "^POSTGRES_DB=" .env | cut -d'=' -f2 | tr -d '"' || echo "${APP_NAME}_dev")
DATABASE_URL_EXISTING=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2 | tr -d '"')

# SEMPRE gerar credenciais seguras automaticamente
DB_USER="${APP_NAME}_user_db"
DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

# Se DATABASE_URL existe, extrair apenas o nome do usuário preferido (mas SEMPRE gerar nova senha)
if [[ -n "$DATABASE_URL_EXISTING" && "$DATABASE_URL_EXISTING" != *"user:password"* ]]; then
    PREFERRED_USER=$(echo "$DATABASE_URL_EXISTING" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    if [[ -n "$PREFERRED_USER" && "$PREFERRED_USER" != "user" ]]; then
        DB_USER="$PREFERRED_USER"
        # SEMPRE gerar nova senha segura, mesmo com usuário existente
        DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    fi
fi

echo "📋 Configurações detectadas:"
echo "   APP_NAME: $APP_NAME"
echo "   DB_NAME: $DB_NAME"
echo "   DB_USER: $DB_USER"
echo "   DB_PASSWORD: [gerada automaticamente]"
echo

# Criar .env para infraestrutura (dentro da pasta infra-db)
echo "⚙️  Criando configuração da infraestrutura..."
cat > "$INFRA_DIR/.env" << EOF
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
echo "1. cd $INFRA_DIR && docker-compose up -d"
echo "2. ⚠️  IMPORTANTE: Atualize seu .env com as novas credenciais:"
echo "   DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo "3. Execute suas migrations: npm run prisma:migrate"
echo "4. Execute seed se necessário: npm run prisma:seed"
echo
echo "🔌 String de conexão gerada (copie para seu .env):"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo
echo "🔒 Segurança: Credenciais geradas automaticamente, únicas para este projeto"
