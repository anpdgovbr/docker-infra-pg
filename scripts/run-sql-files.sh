#!/bin/bash

# ============================================================================
# Script para executar SQLs de inicialização manualmente
# ============================================================================
# Use quando o volume já existe e os scripts não foram executados

echo "🔧 [run-sql-files.sh] Executando SQLs de inicialização manualmente..."
echo

# Verificar se estamos no container correto
if ! command -v psql &> /dev/null; then
    echo "❌ psql não encontrado. Execute este script dentro do container PostgreSQL."
    exit 1
fi

# Verificar variáveis de ambiente
if [[ -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_USER" || -z "$POSTGRES_DB" ]]; then
    echo "❌ Variáveis de ambiente PostgreSQL não encontradas:"
    echo "   POSTGRES_USER: ${POSTGRES_USER:-'❌ NÃO DEFINIDA'}"
    echo "   POSTGRES_DB: ${POSTGRES_DB:-'❌ NÃO DEFINIDA'}"
    echo "   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:+✅ DEFINIDA}"
    exit 1
fi

# Contar arquivos SQL
SQL_DIR="/docker-entrypoint-initdb.d"
if [[ ! -d "$SQL_DIR" ]]; then
    echo "❌ Diretório $SQL_DIR não encontrado"
    exit 1
fi

SQL_FILES=($(find "$SQL_DIR" -name "*.sql" | sort))
TOTAL_FILES=${#SQL_FILES[@]}

if [[ $TOTAL_FILES -eq 0 ]]; then
    echo "⚠️  Nenhum arquivo SQL encontrado em $SQL_DIR"
    exit 1
fi

echo "📁 Encontrados $TOTAL_FILES arquivo(s) SQL para executar:"
for file in "${SQL_FILES[@]}"; do
    echo "   📄 $(basename "$file")"
done
echo

# Confirmar execução (se executado interativamente)
if [[ -t 0 ]]; then
    read -p "🤔 Continuar com a execução? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Execução cancelada pelo usuário"
        exit 0
    fi
fi

# Executar cada arquivo SQL
SUCCESS_COUNT=0
FAILED_COUNT=0

for sql_file in "${SQL_FILES[@]}"; do
    filename=$(basename "$sql_file")
    echo "🔧 Executando $filename..."
    
    if PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$sql_file" 2>/dev/null; then
        echo "✅ $filename executado com sucesso"
        ((SUCCESS_COUNT++))
    else
        echo "❌ Erro ao executar $filename"
        echo "ℹ️  Tentando com output detalhado:"
        PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$sql_file"
        ((FAILED_COUNT++))
    fi
    echo
done

# Resumo final
echo "📊 Resumo da execução:"
echo "   ✅ Sucessos: $SUCCESS_COUNT"
echo "   ❌ Falhas: $FAILED_COUNT"
echo "   📁 Total: $TOTAL_FILES"
echo

if [[ $FAILED_COUNT -eq 0 ]]; then
    echo "🎉 Todos os arquivos SQL foram executados com sucesso!"
    echo
    echo "🔍 Verificando bancos criados:"
    bash "$(dirname "$0")/check-databases.sh" 2>/dev/null || echo "ℹ️  Script de verificação não encontrado"
else
    echo "⚠️  Alguns arquivos falharam. Verifique os logs acima."
fi
