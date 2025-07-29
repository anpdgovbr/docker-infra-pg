#!/bin/bash
# Gera init SQLs para múltiplas aplicações baseado na configuração APPS_CONFIG

echo "🔧 [generate-multi-app-sql.sh] Iniciando geração de SQLs para múltiplas aplicações..."

# Verifica parâmetros
FORCE_REGENERATE=false
if [[ "$1" == "--force" ]]; then
  FORCE_REGENERATE=true
  echo "🔄 [generate-multi-app-sql.sh] Modo --force ativado: arquivos existentes serão sobrescritos"
fi

# Carrega variáveis do ambiente se .env existir
if [[ -f .env ]]; then
  echo "📄 [generate-multi-app-sql.sh] Carregando variáveis de .env local"
  set -a
  source .env
  set +a
else
  echo "⚠️  [generate-multi-app-sql.sh] .env não encontrado, usando variáveis do ambiente"
fi

mkdir -p init

# Função para gerar SQL de uma aplicação
generate_app_sql() {
  local app_name="$1"
  local app_db="$2"
  local app_user="$3"
  local app_pass="$4"
  local file_index="$5"
  local target_file="init/${file_index}-create-${app_name}-db.sql"
  
  # Verifica se arquivo já existe
  if [[ -f "$target_file" && "$FORCE_REGENERATE" != true ]]; then
    echo "⚠️  [generate-multi-app-sql.sh] Arquivo $target_file já existe - pulando"
    echo "    Para regenerar, use: bash scripts/generate-multi-app-sql.sh --force"
    return 0
  fi
  
  echo "🔧 [generate-multi-app-sql.sh] Gerando SQL para $app_name ($app_db)"
  
  cat templates/create-app-db.sql.tpl \
    | sed "s/{{APP_DB}}/$app_db/" \
    | sed "s/{{APP_USER}}/$app_user/" \
    | sed "s/{{APP_PASS}}/$app_pass/" \
    | sed "s/{{APP_NAME}}/$app_name/" \
    > "$target_file"
  
  echo "✅ [generate-multi-app-sql.sh] $target_file gerado"
}

# Processa configuração multi-app se existir
if [[ -n "$APPS_CONFIG" ]]; then
  echo "📱 [generate-multi-app-sql.sh] Processando configuração multi-app: $APPS_CONFIG"
  
  # SEGURANÇA: Não remove arquivos SQL existentes automaticamente
  # Isso preserva adições manuais e permite adição sob demanda
  echo "⚠️  [generate-multi-app-sql.sh] Arquivos SQL existentes serão preservados"
  echo "    Para limpar completamente, use: rm -f init/*-create-*-db.sql"
  
  IFS=',' read -ra APPS <<< "$APPS_CONFIG"
  file_index=10
  
  for app in "${APPS[@]}"; do
    IFS=':' read -ra APP_PARTS <<< "$app"
    
    if [[ ${#APP_PARTS[@]} -eq 4 ]]; then
      app_name="${APP_PARTS[0]}"
      app_db="${APP_PARTS[1]}"
      app_user="${APP_PARTS[2]}"
      app_pass="${APP_PARTS[3]}"
      
      generate_app_sql "$app_name" "$app_db" "$app_user" "$app_pass" "$file_index"
      ((file_index++))
    else
      echo "⚠️  [generate-multi-app-sql.sh] Formato inválido para app: $app (esperado: name:db:user:pass)"
    fi
  done
  
elif [[ -n "$BACKLOG_DB" && -n "$BACKLOG_USER" && -n "$BACKLOG_PASS" ]]; then
  echo "🔄 [generate-multi-app-sql.sh] Usando configuração legada (BACKLOG_*)"
  generate_app_sql "backlog" "$BACKLOG_DB" "$BACKLOG_USER" "$BACKLOG_PASS" "01"
  
else
  echo "❌ [generate-multi-app-sql.sh] Nenhuma configuração válida encontrada."
  echo "    Configure APPS_CONFIG ou as variáveis legadas BACKLOG_DB, BACKLOG_USER, BACKLOG_PASS"
  exit 1
fi

echo "✅ [generate-multi-app-sql.sh] Todos os SQLs de aplicação gerados com sucesso."
