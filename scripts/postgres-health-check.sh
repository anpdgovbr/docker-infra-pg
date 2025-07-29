#!/bin/bash
# ============================================================================
# DIAGNÓSTICO DE SAÚDE DO POSTGRESQL
# ============================================================================
# Use este script para diagnosticar problemas de healthcheck do PostgreSQL

echo "🏥 [postgres-health-check.sh] Diagnóstico de Saúde do PostgreSQL"
echo "================================================================="
echo

# 1. Verificar se PostgreSQL está rodando
echo "1️⃣ Verificando se PostgreSQL está rodando..."
if pgrep postgres > /dev/null; then
    echo "   ✅ Processo PostgreSQL encontrado"
    ps aux | grep postgres | grep -v grep
else
    echo "   ❌ Processo PostgreSQL NÃO encontrado"
    echo "   💡 PostgreSQL pode ainda estar inicializando"
fi
echo

# 2. Verificar conectividade básica
echo "2️⃣ Verificando conectividade básica..."
if pg_isready -h localhost -p 5432; then
    echo "   ✅ PostgreSQL responde na porta 5432"
else
    echo "   ❌ PostgreSQL NÃO responde na porta 5432"
    echo "   💡 Verifique se o processo terminou de inicializar"
fi
echo

# 3. Verificar variáveis de ambiente
echo "3️⃣ Verificando variáveis de ambiente..."
echo "   POSTGRES_USER: ${POSTGRES_USER:-'❌ NÃO DEFINIDA'}"
echo "   POSTGRES_DB: ${POSTGRES_DB:-'❌ NÃO DEFINIDA'}"
echo "   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:+✅ DEFINIDA}"
echo "   PGDATA: ${PGDATA:-'❌ NÃO DEFINIDA'}"
echo

# 4. Verificar se consegue conectar com credenciais
echo "4️⃣ Testando conexão com credenciais..."
if [[ -n "$POSTGRES_USER" && -n "$POSTGRES_PASSWORD" && -n "$POSTGRES_DB" ]]; then
    if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" > /dev/null 2>&1; then
        echo "   ✅ Conexão com credenciais OK"
        PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();"
    else
        echo "   ❌ Falha na conexão com credenciais"
        echo "   🔍 Tentando diagnosticar o erro:"
        PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();"
    fi
else
    echo "   ⚠️  Variáveis de ambiente incompletas - pulando teste"
fi
echo

# 5. Verificar logs recentes
echo "5️⃣ Logs recentes do PostgreSQL (últimas 20 linhas)..."
if [[ -f "$PGDATA/log/postgresql.log" ]]; then
    tail -20 "$PGDATA/log/postgresql.log"
elif [[ -f "/var/log/postgresql/postgresql.log" ]]; then
    tail -20 "/var/log/postgresql/postgresql.log"
else
    echo "   ℹ️  Arquivo de log específico não encontrado"
    echo "   💡 Use 'docker logs <container-name>' para ver logs"
fi
echo

# 6. Verificar espaço em disco
echo "6️⃣ Verificando espaço em disco..."
df -h "$PGDATA" 2>/dev/null || df -h /var/lib/postgresql/data 2>/dev/null || df -h /
echo

# 7. Verificar arquivos críticos
echo "7️⃣ Verificando arquivos críticos..."
if [[ -f "$PGDATA/postgresql.conf" ]]; then
    echo "   ✅ postgresql.conf encontrado"
else
    echo "   ❌ postgresql.conf NÃO encontrado"
fi

if [[ -f "$PGDATA/pg_hba.conf" ]]; then
    echo "   ✅ pg_hba.conf encontrado"
else
    echo "   ❌ pg_hba.conf NÃO encontrado"
fi

if [[ -f "$PGDATA/postmaster.pid" ]]; then
    echo "   ✅ postmaster.pid encontrado (PostgreSQL rodando)"
    cat "$PGDATA/postmaster.pid" | head -1 | xargs ps -p
else
    echo "   ⚠️  postmaster.pid NÃO encontrado (PostgreSQL pode estar inicializando)"
fi
echo

echo "🏁 Diagnóstico concluído!"
echo "💡 Se há problemas, verifique:"
echo "   - Logs do container: docker logs <container-name>"
echo "   - Variáveis de ambiente no Portainer"
echo "   - Espaço em disco disponível"
echo "   - Permissões do volume de dados"
