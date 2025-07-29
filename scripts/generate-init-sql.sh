#!/bin/bash
# Gera init SQL substituindo variáveis do .env ou do ambiente
# DEPRECATED: Use generate-multi-app-sql.sh para novas configurações

echo "🔧 [generate-init-sql.sh] Iniciando geração do init SQL (modo legado)..."
echo "⚠️  [generate-init-sql.sh] DEPRECATED: Este script será removido em versões futuras."
echo "    Use generate-multi-app-sql.sh ou configure APPS_CONFIG no .env"

# Carrega variáveis do ambiente se .env existir
if [[ -f .env ]]; then
  echo "📄 [generate-init-sql.sh] Carregando variáveis de .env local"
  set -a
  source .env
  set +a
else
  echo "⚠️  [generate-init-sql.sh] .env não encontrado, usando variáveis do ambiente"
fi

# Se APPS_CONFIG existe, delega para o novo script
if [[ -n "$APPS_CONFIG" ]]; then
  echo "🔄 [generate-init-sql.sh] Detectado APPS_CONFIG, delegando para generate-multi-app-sql.sh"
  bash scripts/generate-multi-app-sql.sh
  exit $?
fi

# Verificação legada
if [[ -z "$BACKLOG_DB" || -z "$BACKLOG_USER" || -z "$BACKLOG_PASS" ]]; then
  echo "❌ [generate-init-sql.sh] Variáveis BACKLOG_DB, BACKLOG_USER ou BACKLOG_PASS não definidas."
  exit 1
fi

mkdir -p init

cat templates/create-app-db.sql.tpl \
  | sed "s/{{APP_DB}}/$BACKLOG_DB/" \
  | sed "s/{{APP_USER}}/$BACKLOG_USER/" \
  | sed "s/{{APP_PASS}}/$BACKLOG_PASS/" \
  | sed "s/{{APP_NAME}}/backlog/" \
  > init/01-create-backlog-db.sql

echo "✅ [generate-init-sql.sh] init/01-create-backlog-db.sql gerado com sucesso."
