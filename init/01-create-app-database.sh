#!/bin/bash
# ============================================================================
# SCRIPT DE INICIALIZAÇÃO DO BANCO DA APLICAÇÃO
# ============================================================================
# Este script é executado automaticamente pelo PostgreSQL na primeira inicialização
# Cria o banco e usuário específicos da aplicação

set -e

echo "🚀 Inicializando banco da aplicação..."

# Verificar se variáveis estão definidas
if [[ -z "$APP_DB_NAME" || -z "$APP_DB_USER" || -z "$APP_DB_PASSWORD" ]]; then
    echo "⚠️  Variáveis de ambiente da aplicação não definidas:"
    echo "   APP_DB_NAME: ${APP_DB_NAME:-'❌ NÃO DEFINIDA'}"
    echo "   APP_DB_USER: ${APP_DB_USER:-'❌ NÃO DEFINIDA'}"
    echo "   APP_DB_PASSWORD: ${APP_DB_PASSWORD:+✅ DEFINIDA}"
    echo ""
    echo "💡 Configure estas variáveis no seu .env:"
    echo "   DB_NAME=nome_do_banco"
    echo "   DB_USER=usuario_do_banco"
    echo "   DB_PASSWORD=senha_do_usuario"
    exit 1
fi

echo "📊 Criando banco: $APP_DB_NAME"
echo "👤 Criando usuário: $APP_DB_USER"

# Criar banco da aplicação
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Criar banco da aplicação
    CREATE DATABASE $APP_DB_NAME;
    
    -- Criar usuário da aplicação
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$APP_DB_USER') THEN
            CREATE USER $APP_DB_USER WITH ENCRYPTED PASSWORD '$APP_DB_PASSWORD';
        END IF;
    END
    \$\$;
    
    -- Conceder privilégios
    GRANT ALL PRIVILEGES ON DATABASE $APP_DB_NAME TO $APP_DB_USER;
    
    -- Permitir que o usuário crie bancos (útil para testes)
    ALTER ROLE $APP_DB_USER CREATEDB;
EOSQL

echo "✅ Banco da aplicação criado com sucesso!"
echo ""
echo "📝 Dados da conexão:"
echo "   Host: localhost (ou nome do container)"
echo "   Porta: 5432"
echo "   Banco: $APP_DB_NAME"
echo "   Usuário: $APP_DB_USER"
echo "   Senha: [configurada]"
echo ""
echo "🔌 String de conexão exemplo:"
echo "   postgresql://$APP_DB_USER:[senha]@localhost:5432/$APP_DB_NAME"
