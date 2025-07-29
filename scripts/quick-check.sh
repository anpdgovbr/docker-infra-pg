#!/bin/bash

# Script rápido para verificar apenas bancos das aplicações
echo "🔍 Verificação rápida - Bancos das aplicações ANPD"
echo "=================================================="

# Verificar se backlog_dim_dev existe
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='backlog_dim_dev';" | grep -q 1; then
    echo "✅ backlog_dim_dev - EXISTE"
else
    echo "❌ backlog_dim_dev - NÃO EXISTE"
fi

# Verificar se controladores_api_dev existe
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='controladores_api_dev';" | grep -q 1; then
    echo "✅ controladores_api_dev - EXISTE"
else
    echo "❌ controladores_api_dev - NÃO EXISTE"
fi

echo
echo "🔍 Verificação rápida - Usuários das aplicações"
echo "=============================================="

# Verificar usuário do backlog
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname='backlog_user_db';" | grep -q 1; then
    echo "✅ backlog_user_db - EXISTE"
else
    echo "❌ backlog_user_db - NÃO EXISTE"
fi

# Verificar usuário do controladores
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname='controladores_user';" | grep -q 1; then
    echo "✅ controladores_user - EXISTE"
else
    echo "❌ controladores_user - NÃO EXISTE"
fi

echo
echo "💡 Para criar bancos faltando, execute:"
echo "   bash /app/scripts/run-sql-files.sh"
