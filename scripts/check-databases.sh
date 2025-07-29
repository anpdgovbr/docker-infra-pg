#!/bin/bash

# Script para verificar bancos criados no PostgreSQL
echo "🔍 Verificando bancos de dados criados..."
echo

# Conectar e listar bancos
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
  datname as \"Database\",
  pg_size_pretty(pg_database_size(datname)) as \"Size\"
FROM pg_database 
WHERE datname NOT IN ('template0', 'template1')
ORDER BY datname;
"

echo
echo "🔍 Verificando usuários criados..."

PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
  rolname as \"Username\",
  rolcreatedb as \"Can Create DB\",
  rolsuper as \"Superuser\"
FROM pg_roles 
WHERE rolname NOT LIKE 'pg_%'
ORDER BY rolname;
"
