#!/bin/bash
# Gera SQLs baseado no arquivo de configuração versionado (config/apps.conf)
# Suporta tanto execução local (.env) quanto GitOps (env vars)

echo "🔧 [generate-from-config.sh] Gerando SQLs baseado em config/apps.conf..."

# Carrega variáveis do .env se existir (execução local)
if [[ -f .env ]]; then
  echo "📄 [generate-from-config.sh] Carregando .env local"
  set -a
  source .env
  set +a
  echo "🏠 [generate-from-config.sh] Modo: Execução Local"
else
  echo "☁️  [generate-from-config.sh] Modo: GitOps/Portainer (usando env vars)"
fi

# Verifica se arquivo de configuração existe
if [[ ! -f "config/apps.conf" ]]; then
  echo "❌ [generate-from-config.sh] Arquivo config/apps.conf não encontrado"
  exit 1
fi

mkdir -p init

# Função para converter nome da app para formato de variável
app_to_var() {
  echo "$1" | tr '[:lower:]' '[:upper:]' | tr '-' '_'
}

# Função para gerar SQL de uma aplicação
generate_app_sql() {
  local app_name="$1"
  local app_db="$2" 
  local app_user="$3"
  local file_index="$4"
  
  # Converte nome da app para variável de senha
  local password_var=$(app_to_var "$app_name")_PASSWORD
  local app_pass="${!password_var}"
  
  # Verifica se senha foi fornecida
  if [[ -z "$app_pass" ]]; then
    echo "⚠️  [generate-from-config.sh] Senha não encontrada para $app_name (variável: $password_var)"
    echo "    Configure a variável $password_var no .env ou como env var"
    return 1
  fi
  
  local target_file="init/${file_index}-create-${app_name}-db.sql"
  
  # Verifica se arquivo já existe
  if [[ -f "$target_file" ]]; then
    echo "⚠️  [generate-from-config.sh] $target_file já existe - pulando"
    return 0
  fi
  
  echo "🔧 [generate-from-config.sh] Gerando SQL para $app_name ($app_db)"
  
  cat templates/create-app-db.sql.tpl \
    | sed "s/{{APP_DB}}/$app_db/" \
    | sed "s/{{APP_USER}}/$app_user/" \
    | sed "s/{{APP_PASS}}/$app_pass/" \
    | sed "s/{{APP_NAME}}/$app_name/" \
    > "$target_file"
  
  echo "✅ [generate-from-config.sh] $target_file gerado"
}

# Lê arquivo de configuração e processa cada linha
file_index=10
apps_processed=0
apps_skipped=0

while IFS= read -r line; do
  # Ignora comentários e linhas vazias
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  
  # Parse da linha: app_name:database_name:username
  IFS=':' read -ra APP_PARTS <<< "$line"
  
  if [[ ${#APP_PARTS[@]} -eq 3 ]]; then
    app_name="${APP_PARTS[0]}"
    app_db="${APP_PARTS[1]}"
    app_user="${APP_PARTS[2]}"
    
    if generate_app_sql "$app_name" "$app_db" "$app_user" "$file_index"; then
      ((apps_processed++))
      ((file_index++))
    else
      ((apps_skipped++))
    fi
  else
    echo "⚠️  [generate-from-config.sh] Linha inválida ignorada: $line"
  fi
  
done < "config/apps.conf"

echo ""
echo "📊 [generate-from-config.sh] Resumo:"
echo "   ✅ Aplicações processadas: $apps_processed"
echo "   ⚠️  Aplicações puladas: $apps_skipped"

if [[ $apps_processed -gt 0 ]]; then
  echo "✅ [generate-from-config.sh] SQLs gerados com sucesso!"
else
  echo "⚠️  [generate-from-config.sh] Nenhuma aplicação foi processada"
  echo "    Verifique se as variáveis de senha estão configuradas"
  exit 1
fi
