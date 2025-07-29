#!/bin/bash

# Script de depuração rápida para verificar estado atual
echo "🔍 VERIFICAÇÃO RÁPIDA DO ESTADO DOS BANCOS"
echo "=========================================="
echo

# 1. Verificar se estamos no container certo
if ! command -v psql &> /dev/null; then
    echo "❌ Este script deve ser executado dentro do container PostgreSQL"
    exit 1
fi

# 2. Mostrar variáveis críticas
echo "📋 Variáveis de ambiente:"
echo "   POSTGRES_USER: ${POSTGRES_USER:-'❌ NÃO DEFINIDA'}"
echo "   POSTGRES_DB: ${POSTGRES_DB:-'❌ NÃO DEFINIDA'}"
echo "   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:+✅ DEFINIDA}"
echo "   CONTROLADORES_PASSWORD: ${CONTROLADORES_PASSWORD:+✅ DEFINIDA}"
echo "   BACKLOG_PASSWORD: ${BACKLOG_PASSWORD:+✅ DEFINIDA}"
echo

# 3. Listar TODOS os bancos
echo "🗄️  TODOS OS BANCOS EXISTENTES:"
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT datname FROM pg_database WHERE datname NOT IN ('template0', 'template1') ORDER BY datname;"
echo

# 4. Listar TODOS os usuários
echo "👥 TODOS OS USUÁRIOS EXISTENTES:"
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT rolname FROM pg_roles WHERE rolname NOT LIKE 'pg_%' ORDER BY rolname;"
echo

# 5. Verificação específica dos bancos das apps
echo "🎯 VERIFICAÇÃO ESPECÍFICA:"
echo

# Verificar backlog_dim_dev
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='backlog_dim_dev';" | grep -q 1; then
    echo "✅ backlog_dim_dev EXISTE"
else
    echo "❌ backlog_dim_dev NÃO EXISTE"
fi

# Verificar controladores_api_dev
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='controladores_api_dev';" | grep -q 1; then
    echo "✅ controladores_api_dev EXISTE"
else
    echo "❌ controladores_api_dev NÃO EXISTE"
fi

# Verificar usuários
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname='backlog_user_db';" | grep -q 1; then
    echo "✅ backlog_user_db EXISTE"
else
    echo "❌ backlog_user_db NÃO EXISTE"
fi

if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname='controladores_user';" | grep -q 1; then
    echo "✅ controladores_user EXISTE"
else
    echo "❌ controladores_user NÃO EXISTE"
fi

echo
echo "📁 Arquivos SQL disponíveis:"
if [ -d "/docker-entrypoint-initdb.d" ]; then
    ls -la /docker-entrypoint-initdb.d/*.sql 2>/dev/null || echo "   ❌ Nenhum arquivo .sql encontrado"
else
    echo "   ❌ Diretório /docker-entrypoint-initdb.d não encontrado"
fi

echo
echo "💡 Para executar os SQLs manualmente:"
echo "   bash /app/scripts/run-sql-files.sh"
echo
echo "💡 Para criar apenas o banco controladores:"
echo "   PGPASSWORD=\"\$POSTGRES_PASSWORD\" psql -h localhost -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -f /docker-entrypoint-initdb.d/11-create-controladores-db.sql"
