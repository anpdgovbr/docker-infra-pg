#!/bin/bash
# Gera config/servers.json substituindo variáveis do .env

set -a
source .env
set +a

mkdir -p config

cat templates/servers.json.tpl \
  | sed "s/{{POSTGRES_DB}}/$POSTGRES_DB/" \
  | sed "s/{{POSTGRES_USER}}/$POSTGRES_USER/" \
  > config/servers.json

echo "✅ config/servers.json gerado com sucesso."
