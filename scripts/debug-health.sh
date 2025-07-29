#!/bin/bash

# ============================================================================
# Script de Diagnóstico para Health Check PostgreSQL
# ============================================================================
# Use este script para diagnosticar problemas de health check no PostgreSQL

echo "🔍 [debug-health.sh] Iniciando diagnóstico de saúde do PostgreSQL..."
echo "📅 $(date)"
echo

# 1. Verificar se o PostgreSQL está rodando
echo "1️⃣ Verificando se o PostgreSQL está ativo..."
if pg_isready -h localhost -p 5432; then
    echo "✅ PostgreSQL está respondendo"
else
    echo "❌ PostgreSQL não está respondendo"
    echo "ℹ️  Detalhes do erro:"
    pg_isready -h localhost -p 5432 -v
fi
echo

# 2. Verificar conexão com usuário administrativo
echo "2️⃣ Testando conexão com usuário admin..."
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" >/dev/null 2>&1; then
    echo "✅ Conexão administrativa funcionando"
else
    echo "❌ Falha na conexão administrativa"
    echo "ℹ️  Usuário: $POSTGRES_USER"
    echo "ℹ️  Database: $POSTGRES_DB"
fi
echo

# 3. Listar bancos de dados
echo "3️⃣ Listando bancos de dados..."
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\l" 2>/dev/null; then
    echo "✅ Lista de bancos obtida com sucesso"
else
    echo "❌ Não foi possível listar bancos"
fi
echo

# 4. Listar usuários
echo "4️⃣ Listando usuários..."
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\du" 2>/dev/null; then
    echo "✅ Lista de usuários obtida com sucesso"
else
    echo "❌ Não foi possível listar usuários"
fi
echo

# 5. Verificar logs do PostgreSQL (últimas linhas)
echo "5️⃣ Verificando logs recentes..."
if [ -f "/var/log/postgresql/postgresql-15-main.log" ]; then
    echo "📄 Últimas 10 linhas do log:"
    tail -n 10 /var/log/postgresql/postgresql-15-main.log
elif [ -d "/var/lib/postgresql/data/log" ]; then
    echo "📄 Logs do data directory:"
    find /var/lib/postgresql/data/log -name "*.log" -exec tail -n 5 {} \;
else
    echo "ℹ️  Logs não encontrados nos locais padrão"
fi
echo

# 6. Verificar arquivos de inicialização
echo "6️⃣ Verificando arquivos de inicialização..."
if [ -d "/docker-entrypoint-initdb.d" ]; then
    echo "📁 Arquivos em /docker-entrypoint-initdb.d:"
    ls -la /docker-entrypoint-initdb.d/
    echo
    echo "🔍 Verificando sintaxe dos SQLs:"
    for sql_file in /docker-entrypoint-initdb.d/*.sql; do
        if [ -f "$sql_file" ]; then
            echo "  📄 Verificando $(basename "$sql_file")..."
            # Verificação básica de sintaxe SQL
            if grep -q "^--" "$sql_file" && grep -q "CREATE" "$sql_file"; then
                echo "    ✅ Estrutura básica parece OK"
            else
                echo "    ⚠️  Estrutura suspeita"
            fi
        fi
    done
else
    echo "❌ Diretório de inicialização não encontrado"
fi
echo

# 7. Verificar variáveis de ambiente
echo "7️⃣ Verificando variáveis de ambiente críticas..."
echo "  POSTGRES_USER: ${POSTGRES_USER:-'❌ NÃO DEFINIDA'}"
echo "  POSTGRES_DB: ${POSTGRES_DB:-'❌ NÃO DEFINIDA'}"
echo "  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:+✅ DEFINIDA}"
echo "  POSTGRES_TIMEZONE: ${POSTGRES_TIMEZONE:-'⚠️  NÃO DEFINIDA (usando default)'}"
echo

echo "🏁 [debug-health.sh] Diagnóstico concluído em $(date)"
