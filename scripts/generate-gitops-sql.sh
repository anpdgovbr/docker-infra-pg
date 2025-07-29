#!/bin/bash
# Script para geração de SQLs baseado em apps.conf (GitOps/Portainer)
# Lê configuração versionada e senhas do ambiente

echo "🚀 [generate-gitops-sql.sh] Gerando SQLs para GitOps/Portainer..."

# Verifica se apps.conf existe
if [[ ! -f "config/apps.conf" ]]; then
  echo "❌ [generate-gitops-sql.sh] Arquivo config/apps.conf não encontrado"
  exit 1
fi

mkdir -p init

# Função para gerar SQL de uma aplicação
generate_app_sql() {
  local app_name="$1"
  local app_db="$2"
  local app_user="$3"
  local password_var="${app_name^^}_PASSWORD"  # Converte para maiúscula
  local app_pass="${!password_var}"  # Pega valor da variável de ambiente
  local file_index="$4"
  local target_file="init/${file_index}-create-${app_name}-db.sql"
  
  # Verifica se senha foi fornecida
  if [[ -z "$app_pass" ]]; then
    echo "⚠️  [generate-gitops-sql.sh] Senha não encontrada para $app_name (variável $password_var)"
    echo "    No Portainer, configure a variável de ambiente: $password_var"
    return 1
  fi
  
  # Verifica se arquivo já existe
  if [[ -f "$target_file" ]]; then
    echo "ℹ️  [generate-gitops-sql.sh] Arquivo $target_file já existe - pulando"
    return 0
  fi
  
  echo "🔧 [generate-gitops-sql.sh] Gerando SQL para $app_name"
  
  cat templates/create-app-db.sql.tpl \
    | sed "s/{{APP_DB}}/$app_db/" \
    | sed "s/{{APP_USER}}/$app_user/" \
    | sed "s/{{APP_PASS}}/$app_pass/" \
    | sed "s/{{APP_NAME}}/$app_name/" \
    > "$target_file"
  
  echo "✅ [generate-gitops-sql.sh] $target_file gerado"
}

# Lê apps.conf e processa cada aplicação
file_index=10
total_apps=0
successful_apps=0

while IFS=':' read -r app_name app_db app_user comment; do
  # Pula linhas de comentário e vazias
  if [[ "$app_name" =~ ^#.*$ ]] || [[ -z "$app_name" ]]; then
    continue
  fi
  
  # Remove espaços em branco
  app_name=$(echo "$app_name" | xargs)
  app_db=$(echo "$app_db" | xargs)
  app_user=$(echo "$app_user" | xargs)
  
  if [[ -n "$app_name" && -n "$app_db" && -n "$app_user" ]]; then
    ((total_apps++))
    echo "📱 [generate-gitops-sql.sh] Processando aplicação: $app_name"
    
    if generate_app_sql "$app_name" "$app_db" "$app_user" "$file_index"; then
      ((successful_apps++))
    fi
    
    ((file_index++))
  fi
done < "config/apps.conf"

echo ""
echo "📊 [generate-gitops-sql.sh] Resumo:"
echo "   Total de aplicações: $total_apps"
echo "   SQLs gerados com sucesso: $successful_apps"
echo "   SQLs com problemas: $((total_apps - successful_apps))"

if [[ $successful_apps -eq $total_apps ]]; then
  echo "✅ [generate-gitops-sql.sh] Todos os SQLs gerados com sucesso!"
  exit 0
else
  echo "⚠️  [generate-gitops-sql.sh] Algumas aplicações tiveram problemas"
  echo "    Verifique as variáveis de ambiente de senha no Portainer"
  exit 1
fi
