#!/bin/bash
# Gera init SQL substituindo variáveis do .env
set -a
source .env
set +a

mkdir -p init

cat init/create-app-db.sql.tpl \
  | sed "s/{{APP_DB}}/$BACKLOG_DB/" \
  | sed "s/{{APP_USER}}/$BACKLOG_USER/" \
  | sed "s/{{APP_PASS}}/$BACKLOG_PASS/" \
  > init/01-create-backlog-dim.sql

echo "init/01-create-backlog-dim.sql gerado com sucesso."
