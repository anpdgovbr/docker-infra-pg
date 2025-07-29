#!/bin/bash
# Gera init SQL substituindo variáveis do .env ou do ambiente

echo "🔧 [generate-init-sql.sh] Iniciando geração do init SQL..."

# Carrega variáveis do ambiente se .env existir
if [[ -f .env ]]; then
  echo "📄 [generate-init-sql.sh] Carregando variáveis de .env local"
  set -a
  source .env
  set +a
else
  echo "⚠️  [generate-init-sql.sh] .env não encontrado, usando variáveis do ambiente"
fi

# Verificação
if [[ -z "$BACKLOG_DB" || -z "$BACKLOG_USER" || -z "$BACKLOG_PASS" ]]; then
  echo "❌ [generate-init-sql.sh] Variáveis BACKLOG_DB, BACKLOG_USER ou BACKLOG_PASS não definidas."
  exit 1
fi

mkdir -p init

cat templates/create-app-db.sql.tpl \
  | sed "s/{{APP_DB}}/$BACKLOG_DB/" \
  | sed "s/{{APP_USER}}/$BACKLOG_USER/" \
  | sed "s/{{APP_PASS}}/$BACKLOG_PASS/" \
  > init/01-create-backlog-dim.sql

echo "✅ [generate-init-sql.sh] init/01-create-backlog-dim.sql gerado com sucesso."
