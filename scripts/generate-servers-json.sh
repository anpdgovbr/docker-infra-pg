#!/bin/bash
# Gera config/servers.json substituindo variáveis do .env ou ambiente

echo "🔧 [generate-servers-json.sh] Iniciando geração do servers.json..."

# Carrega variáveis do ambiente se .env existir
if [[ -f .env ]]; then
  echo "📄 [generate-servers-json.sh] Carregando variáveis de .env local"
  set -a
  source .env
  set +a
else
  echo "⚠️  [generate-servers-json.sh] .env não encontrado, usando variáveis do ambiente"
fi

# Verificação
if [[ -z "$POSTGRES_DB" || -z "$POSTGRES_USER" ]]; then
  echo "❌ [generate-servers-json.sh] Variáveis POSTGRES_DB ou POSTGRES_USER não definidas."
  exit 1
fi

mkdir -p config
rm -rf config/servers.json

cat templates/servers.json.tpl \
  | sed "s/{{POSTGRES_DB}}/$POSTGRES_DB/" \
  | sed "s/{{POSTGRES_USER}}/$POSTGRES_USER/" \
  > config/servers.json

echo "✅ [generate-servers-json.sh] config/servers.json gerado com sucesso."
