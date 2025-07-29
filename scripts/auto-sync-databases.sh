#!/bin/bash
# ============================================================================
# SCRIPT AUTO-SYNC: Sincronização Inteligente de Bancos
# ============================================================================
# Este script:
# 1. Detecta aplicações em apps.conf
# 2. Verifica quais bancos existem no PostgreSQL
# 3. Cria automaticamente os bancos faltantes
# 4. É idempotente (pode rodar múltiplas vezes)
# 5. Detecta novas aplicações e as cria automaticamente
# ============================================================================

echo "🔄 [auto-sync-databases.sh] Sincronização Inteligente de Bancos de Dados"
echo "========================================================================="
echo

# Verificar se estamos no container PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ Este script deve ser executado dentro do container PostgreSQL"
    echo "💡 Execute: docker exec -it <postgres-container> bash /app/scripts/auto-sync-databases.sh"
    exit 1
fi

# Verificar variáveis de ambiente essenciais
if [[ -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_USER" || -z "$POSTGRES_DB" ]]; then
    echo "❌ Variáveis de ambiente PostgreSQL não encontradas:"
    echo "   POSTGRES_USER: ${POSTGRES_USER:-'❌ NÃO DEFINIDA'}"
    echo "   POSTGRES_DB: ${POSTGRES_DB:-'❌ NÃO DEFINIDA'}"
    echo "   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:+✅ DEFINIDA}"
    exit 1
fi

# Verificar se apps.conf existe
if [[ ! -f "/app/config/apps.conf" ]]; then
    echo "❌ Arquivo /app/config/apps.conf não encontrado"
    echo "💡 Este script funciona apenas em modo GitOps"
    exit 1
fi

# Detectar hostname do PostgreSQL (container vs localhost)
POSTGRES_HOST="localhost"
if [[ -n "$POSTGRES_SERVICE_NAME" ]]; then
    POSTGRES_HOST="$POSTGRES_SERVICE_NAME"
elif ping -c 1 postgres &> /dev/null; then
    POSTGRES_HOST="postgres"
fi

echo "🔗 Usando PostgreSQL host: $POSTGRES_HOST"
echo

echo "📋 Estado inicial dos bancos:"
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT datname FROM pg_database WHERE datname NOT IN ('template0', 'template1', 'postgres') ORDER BY datname;"
echo

# Arrays para estatísticas
declare -a apps_found=()
declare -a apps_created=()
declare -a apps_exists=()
declare -a apps_failed=()

# Função para verificar se banco existe
database_exists() {
    local db_name="$1"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='$db_name';" | grep -q 1
}

# Função para verificar se usuário existe
user_exists() {
    local user_name="$1"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$user_name';" | grep -q 1
}

# Função para criar banco e usuário
create_database_and_user() {
    local app_name="$1"
    local app_db="$2"
    local app_user="$3"
    local password_var="${app_name^^}_PASSWORD"
    local app_pass="${!password_var}"
    
    if [[ -z "$app_pass" ]]; then
        echo "⚠️  Senha não encontrada para $app_name (variável $password_var)"
        return 1
    fi
    
    echo "🔧 Criando banco e usuário para $app_name..."
    
    # Criar SQL temporário
    local temp_sql="/tmp/create-${app_name}-temp.sql"
    cat > "$temp_sql" << EOF
-- Criação do banco de dados
CREATE DATABASE $app_db;

-- Criação do usuário (com verificação)
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$app_user') THEN
    CREATE USER $app_user WITH ENCRYPTED PASSWORD '$app_pass';
  END IF;
END
\$\$;

-- Garante que o usuário pode criar bancos (requerido pelo Prisma migrate dev)
ALTER ROLE $app_user CREATEDB;

-- Garantir privilégios no banco
GRANT ALL PRIVILEGES ON DATABASE $app_db TO $app_user;
EOF
    
    # Executar SQL
    if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$temp_sql" 2>/dev/null; then
        rm -f "$temp_sql"
        return 0
    else
        echo "❌ Erro ao executar SQL. Tentando com output detalhado:"
        PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$temp_sql"
        rm -f "$temp_sql"
        return 1
    fi
}

# Processar cada aplicação em apps.conf
echo "🔍 Analisando aplicações em apps.conf..."
echo

while IFS=':' read -r app_name app_db app_user comment; do
    # Pula linhas de comentário e vazias
    if [[ "$app_name" =~ ^#.*$ ]] || [[ -z "$app_name" ]]; then
        continue
    fi
    
    # Remove espaços em branco
    app_name=$(echo "$app_name" | xargs)
    app_db=$(echo "$app_db" | xargs)
    app_user=$(echo "$app_user" | xargs)
    
    if [[ -n "$app_name" && -n "$app_db" && -n "$app_user" ]]; then
        apps_found+=("$app_name")
        
        echo "📱 Verificando aplicação: $app_name"
        echo "   📊 Banco: $app_db"
        echo "   👤 Usuário: $app_user"
        
        # Verificar se banco existe
        if database_exists "$app_db"; then
            echo "   ✅ Banco já existe"
            apps_exists+=("$app_name")
        else
            echo "   🔄 Banco não existe - criando..."
            if create_database_and_user "$app_name" "$app_db" "$app_user"; then
                echo "   ✅ Banco criado com sucesso"
                apps_created+=("$app_name")
            else
                echo "   ❌ Falha ao criar banco"
                apps_failed+=("$app_name")
            fi
        fi
        echo
    fi
done < "/app/config/apps.conf"

# Estatísticas finais
echo "📊 RELATÓRIO FINAL:"
echo "==================="
echo "🔍 Aplicações encontradas: ${#apps_found[@]}"
echo "✅ Bancos já existiam: ${#apps_exists[@]}"
echo "🆕 Bancos criados: ${#apps_created[@]}"
echo "❌ Falhas: ${#apps_failed[@]}"
echo

# Detalhar resultados
if [[ ${#apps_exists[@]} -gt 0 ]]; then
    echo "✅ Bancos que já existiam:"
    for app in "${apps_exists[@]}"; do
        echo "   - $app"
    done
    echo
fi

if [[ ${#apps_created[@]} -gt 0 ]]; then
    echo "🆕 Bancos criados nesta execução:"
    for app in "${apps_created[@]}"; do
        echo "   - $app"
    done
    echo
fi

if [[ ${#apps_failed[@]} -gt 0 ]]; then
    echo "❌ Falhas (verificar senhas no Portainer):"
    for app in "${apps_failed[@]}"; do
        echo "   - $app (verificar variável ${app^^}_PASSWORD)"
    done
    echo
fi

# Estado final
echo "📋 Estado final dos bancos:"
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT datname FROM pg_database WHERE datname NOT IN ('template0', 'template1', 'postgres') ORDER BY datname;"
echo

# Código de saída
if [[ ${#apps_failed[@]} -eq 0 ]]; then
    echo "🎉 Sincronização concluída com sucesso!"
    echo "💡 Este script pode ser executado novamente a qualquer momento"
    exit 0
else
    echo "⚠️  Sincronização concluída com algumas falhas"
    echo "💡 Corrige as variáveis de ambiente e execute novamente"
    exit 1
fi
