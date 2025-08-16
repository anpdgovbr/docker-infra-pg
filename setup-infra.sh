#!/bin/bash
# ============================================================================
# SETUP SCRIPT - Clone e Configure Infraestrutura PostgreSQL
# ============================================================================
# Use este script para clonar e configurar a infraestrutura PostgreSQL
# baseada nas variáveis de ambiente do seu projeto
#
# Parâmetros:
#   --force               : Sobrescrever infra-db sem perguntar
#   --auto                : Gerar dados faltantes automaticamente
#   --manual              : Pedir dados faltantes via prompt
#   --db-name=NOME        : Nome do banco
#   --db-user=USER        : Usuário do banco
#   --db-password=PASS    : Senha do banco

set -e

# Valores padrão
FORCE_OVERWRITE=false
AUTO_MODE=false
MANUAL_MODE=false
PARAM_DB_NAME=""
PARAM_DB_USER=""
PARAM_DB_PASSWORD=""

# Detectar se está sendo executado via pipe (curl | bash)
if [[ ! -t 0 ]]; then
    echo "⚡ Detectado execução via pipe (curl | bash)"
    echo "🤖 Ativando modo automático para evitar problemas de input"
    AUTO_MODE=true
    FORCE_OVERWRITE=true
fi

# Processar parâmetros
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_OVERWRITE=true
            shift
            ;;
        --auto)
            AUTO_MODE=true
            shift
            ;;
        --manual)
            MANUAL_MODE=true
            shift
            ;;
        --db-name=*)
            PARAM_DB_NAME="${1#*=}"
            shift
            ;;
        --db-user=*)
            PARAM_DB_USER="${1#*=}"
            shift
            ;;
        --db-password=*)
            PARAM_DB_PASSWORD="${1#*=}"
            shift
            ;;
        --help|-h)
            echo "Uso: $0 [opções]"
            echo "Opções:"
            echo "  --force               Sobrescrever infra-db sem perguntar"
            echo "  --auto                Gerar dados faltantes automaticamente"
            echo "  --manual              Pedir dados faltantes via prompt"
            echo "  --db-name=NOME        Nome do banco"
            echo "  --db-user=USER        Usuário do banco"
            echo "  --db-password=PASS    Senha do banco"
            echo "  --help, -h            Mostrar esta ajuda"
            exit 0
            ;;
        *)
            echo "Parâmetro desconhecido: $1"
            echo "Use --help para ver as opções disponíveis"
            exit 1
            ;;
    esac
done

# Função segura para ler input com timeout e fallback
safe_read() {
    local prompt="$1"
    local default="$2"
    local timeout="${3:-5}"
    
    if [[ ! -t 0 ]]; then
        # Stdin não é um terminal (pipe), usar padrão
        echo "$default"
        return 0
    fi
    
    local input=""
    if read -t "$timeout" -p "$prompt" input 2>/dev/null; then
        echo "${input:-$default}"
    else
        # Timeout ou erro, usar padrão
        echo
        echo "⚠️  Timeout ou erro na leitura, usando valor padrão: $default"
        echo "$default"
    fi
}

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
    if [[ "$FORCE_OVERWRITE" == "true" ]]; then
        echo "🔄 Sobrescrevendo diretório $INFRA_DIR existente (--force ou modo automático)..."
        rm -rf "$INFRA_DIR"
    else
        echo "⚠️  Diretório $INFRA_DIR já existe"
        echo "Opções:"
        echo "1) Sobrescrever e continuar"
        echo "2) Parar execução"
        echo
        
        OVERWRITE_CHOICE=$(safe_read "Escolha uma opção (1-2): " "2" 10)
        echo
        
        case $OVERWRITE_CHOICE in
            1)
                echo "🔄 Sobrescrevendo diretório existente..."
                rm -rf "$INFRA_DIR"
                ;;
            2|*)
                echo "❌ Execução interrompida pelo usuário"
                echo "💡 Dica: Use o script com --force para sobrescrever automaticamente"
                echo "💡 Ou baixe e execute localmente: wget https://raw.../setup-infra.sh && chmod +x setup-infra.sh && ./setup-infra.sh --force --auto"
                exit 0
                ;;
        esac
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
DB_NAME_EXISTING=$(grep "^POSTGRES_DB=" .env 2>/dev/null | cut -d'=' -f2 | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || echo "")
DATABASE_URL_EXISTING=$(grep "^DATABASE_URL=" .env 2>/dev/null | cut -d'=' -f2 | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || echo "")

# Se DATABASE_URL existe, extrair informações dela
DB_USER_FROM_URL=""
DB_PASSWORD_FROM_URL=""
DB_NAME_FROM_URL=""

if [[ -n "$DATABASE_URL_EXISTING" && "$DATABASE_URL_EXISTING" != *"user:password"* ]]; then
    DB_USER_FROM_URL=$(echo "$DATABASE_URL_EXISTING" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASSWORD_FROM_URL=$(echo "$DATABASE_URL_EXISTING" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_NAME_FROM_URL=$(echo "$DATABASE_URL_EXISTING" | sed -n 's/.*\/\([^?]*\).*/\1/p')
fi

# Definir valores finais priorizando: parâmetros > dados existentes > padrões
DB_NAME="${PARAM_DB_NAME:-${DB_NAME_EXISTING:-${DB_NAME_FROM_URL:-${APP_NAME}_dev}}}"
DB_USER="${PARAM_DB_USER:-${DB_USER_FROM_URL:-${APP_NAME}_user_db}}"
DB_PASSWORD="${PARAM_DB_PASSWORD:-${DB_PASSWORD_FROM_URL}}"

# Verificar quais dados estão faltando ou vazios
MISSING_VARS=()
[[ -z "$DB_NAME" || "$DB_NAME" == "" ]] && MISSING_VARS+=("POSTGRES_DB ou nome do banco na DATABASE_URL")
[[ -z "$DB_USER" || "$DB_USER" == "" ]] && MISSING_VARS+=("usuário do banco")
[[ -z "$DB_PASSWORD" || "$DB_PASSWORD" == "" ]] && MISSING_VARS+=("senha do banco")

# Se houver dados faltando, oferecer opções
if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo "⚠️  As seguintes configurações de banco estão faltando ou vazias no .env:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo
    
    # Determinar modo de operação
    if [[ "$AUTO_MODE" == "true" ]]; then
        CHOICE="1"
        echo "🤖 Modo automático ativado, gerando dados faltantes..."
    elif [[ "$MANUAL_MODE" == "true" ]]; then
        CHOICE="2"
        echo "✏️  Modo manual ativado, solicitando dados..."
    else
        echo "🤔 Como deseja proceder?"
        echo "1) Gerar automaticamente os dados faltantes"
        echo "2) Informar os dados manualmente agora"
        echo "3) Parar e ajustar o .env manualmente (recomendado para projetos existentes)"
        echo
        
        CHOICE=$(safe_read "Escolha uma opção (1-3): " "1" 10)
        echo
    fi
    
    case $CHOICE in
        1)
            echo "🤖 Gerando dados automaticamente..."
            [[ -z "$DB_NAME" || "$DB_NAME" == "" ]] && DB_NAME="${APP_NAME}_dev"
            [[ -z "$DB_USER" || "$DB_USER" == "" ]] && DB_USER="${APP_NAME}_user_db"
            [[ -z "$DB_PASSWORD" || "$DB_PASSWORD" == "" ]] && DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
            ;;
        2)
            echo "✏️  Informe os dados faltantes:"
            [[ -z "$DB_NAME" || "$DB_NAME" == "" ]] && { 
                input=$(safe_read "Nome do banco (padrão: ${APP_NAME}_dev): " "${APP_NAME}_dev" 10)
                DB_NAME="$input"
            }
            [[ -z "$DB_USER" || "$DB_USER" == "" ]] && { 
                input=$(safe_read "Usuário do banco (padrão: ${APP_NAME}_user_db): " "${APP_NAME}_user_db" 10)
                DB_USER="$input"
            }
            [[ -z "$DB_PASSWORD" || "$DB_PASSWORD" == "" ]] && { 
                input=$(safe_read "Senha do banco (Enter para gerar automaticamente): " "" 10)
                if [[ -z "$input" ]]; then
                    DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
                    echo "🔐 Senha gerada automaticamente"
                else
                    DB_PASSWORD="$input"
                fi
            }
            ;;
        3)
            echo "📝 Ajuste manualmente as seguintes variáveis no seu .env:"
            [[ -z "$DB_NAME" || "$DB_NAME" == "" ]] && echo "   POSTGRES_DB=${APP_NAME}_dev"
            [[ -z "$DB_USER" || "$DB_USER" == "" || -z "$DB_PASSWORD" || "$DB_PASSWORD" == "" ]] && echo "   DATABASE_URL=\"postgresql://<usuario>:<senha>@localhost:5432/<banco>?schema=public\""
            echo
            echo "Execute este script novamente após os ajustes."
            echo "💡 Dica: Use --auto para gerar automaticamente ou --manual para informar via prompt"
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
echo "🚀 Automação: Para execução não-interativa, use:"
echo "   # Via curl (modo automático):"
echo "   curl -sSL https://raw.../setup-infra.sh | bash"
echo ""
echo "   # Download e execução local:"
echo "   wget https://raw.../setup-infra.sh && chmod +x setup-infra.sh"
echo "   ./setup-infra.sh --force --auto"
echo "   ./setup-infra.sh --force --db-name=meudb --db-user=meuuser --db-password=minhasenha"
echo
echo "🔒 Segurança: Dados existentes preservados, apenas complementados quando necessário"