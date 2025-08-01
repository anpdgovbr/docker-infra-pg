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

echo "🔍 Lendo configurações existentes do projeto..."

# Extrair APP_NAME do package.json
APP_NAME=$(node -p "require('./package.json').name" 2>/dev/null | sed 's/@[^/]*\///g' || echo "minha-app")

# Ler TODAS as configurações existentes do .env (priorizando dados reais)
DB_NAME_EXISTING=$(grep "^POSTGRES_DB=" .env | cut -d'=' -f2 | tr -d '"' 2>/dev/null || echo "")
DATABASE_URL_EXISTING=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2 | tr -d '"' 2>/dev/null || echo "")

# Se DATABASE_URL existe, extrair informações dela
DB_USER_FROM_URL=""
DB_PASSWORD_FROM_URL=""
DB_NAME_FROM_URL=""

if [[ -n "$DATABASE_URL_EXISTING" && "$DATABASE_URL_EXISTING" != *"user:password"* ]]; then
    DB_USER_FROM_URL=$(echo "$DATABASE_URL_EXISTING" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASSWORD_FROM_URL=$(echo "$DATABASE_URL_EXISTING" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_NAME_FROM_URL=$(echo "$DATABASE_URL_EXISTING" | sed -n 's/.*\/\([^?]*\).*/\1/p')
fi

# Definir valores finais priorizando dados existentes
DB_NAME="${DB_NAME_EXISTING:-${DB_NAME_FROM_URL:-${APP_NAME}_dev}}"
DB_USER="${DB_USER_FROM_URL:-${APP_NAME}_user_db}"
DB_PASSWORD="${DB_PASSWORD_FROM_URL}"

# Verificar quais dados estão faltando
MISSING_VARS=()
[[ -z "$DB_NAME" ]] && MISSING_VARS+=("POSTGRES_DB ou nome do banco na DATABASE_URL")
[[ -z "$DB_USER" ]] && MISSING_VARS+=("usuário do banco")
[[ -z "$DB_PASSWORD" ]] && MISSING_VARS+=("senha do banco")

# Se houver dados faltando, oferecer opções
if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo "⚠️  Algumas configurações de banco não foram encontradas no .env:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo
    echo "🤔 Como deseja proceder?"
    echo "1) Gerar automaticamente os dados faltantes"
    echo "2) Informar os dados manualmente agora"
    echo "3) Parar e ajustar o .env manualmente (recomendado para projetos existentes)"
    echo
    read -p "Escolha uma opção (1-3): " -n 1 -r CHOICE
    echo
    echo
    
    case $CHOICE in
        1)
            echo "🤖 Gerando dados automaticamente..."
            [[ -z "$DB_NAME" ]] && DB_NAME="${APP_NAME}_dev"
            [[ -z "$DB_USER" ]] && DB_USER="${APP_NAME}_user_db"
            [[ -z "$DB_PASSWORD" ]] && DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
            ;;
        2)
            echo "✏️  Informe os dados faltantes:"
            [[ -z "$DB_NAME" ]] && { read -p "Nome do banco (padrão: ${APP_NAME}_dev): " input; DB_NAME="${input:-${APP_NAME}_dev}"; }
            [[ -z "$DB_USER" ]] && { read -p "Usuário do banco (padrão: ${APP_NAME}_user_db): " input; DB_USER="${input:-${APP_NAME}_user_db}"; }
            [[ -z "$DB_PASSWORD" ]] && { read -p "Senha do banco: " DB_PASSWORD; [[ -z "$DB_PASSWORD" ]] && DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16); }
            ;;
        3)
            echo "📝 Ajuste manualmente as seguintes variáveis no seu .env:"
            [[ -z "$DB_NAME" ]] && echo "   POSTGRES_DB=${APP_NAME}_dev"
            [[ -z "$DB_USER" || -z "$DB_PASSWORD" ]] && echo "   DATABASE_URL=\"postgresql://usuario:senha@localhost:5432/banco?schema=public\""
            echo
            echo "Execute este script novamente após os ajustes."
            exit 0
            ;;
        *)
            echo "❌ Opção inválida. Execute o script novamente."
            exit 1
            ;;
    esac
fi

echo "📋 Configurações detectadas:"
echo "   APP_NAME: $APP_NAME"
echo "   DB_NAME: $DB_NAME"
echo "   DB_USER: $DB_USER"
echo "   DB_PASSWORD: [preservada/gerada]"
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

# Sincronizar .env do projeto com os dados finais
echo "🔄 Sincronizando .env do projeto com as configurações finais..."

# Construir a nova DATABASE_URL
NEW_DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"

# Função para atualizar ou adicionar variável no .env
update_env_var() {
    local var_name="$1"
    local var_value="$2"
    local env_file="$3"
    
    if grep -q "^${var_name}=" "$env_file"; then
        # Variável existe, atualizar
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${var_name}=.*|${var_name}=\"${var_value}\"|" "$env_file"
        else
            sed -i "s|^${var_name}=.*|${var_name}=\"${var_value}\"|" "$env_file"
        fi
    else
        # Variável não existe, adicionar
        echo "${var_name}=\"${var_value}\"" >> "$env_file"
    fi
}

# Atualizar o .env do projeto com os dados finais
update_env_var "POSTGRES_DB" "$DB_NAME" ".env"
update_env_var "DATABASE_URL" "$NEW_DATABASE_URL" ".env"

echo "✅ Arquivo .env do projeto atualizado com as configurações finais!"
echo

echo "📝 Próximos passos:"
echo "1. cd $INFRA_DIR && docker-compose up -d"
echo "2. ✅ Seu .env já foi atualizado automaticamente com as credenciais corretas"
echo "3. Execute suas migrations: npm run prisma:migrate"
echo "4. Execute seed se necessário: npm run prisma:seed"
echo
echo "💡 A infraestrutura foi instalada na pasta: $INFRA_DIR/"
echo "   Todos os comandos Docker devem ser executados a partir desta pasta."
echo
echo "🔌 String de conexão final (já salva no seu .env):"
echo "DATABASE_URL=\"$NEW_DATABASE_URL\""
echo
echo "🔒 Segurança: Dados existentes preservados, apenas complementados quando necessário"