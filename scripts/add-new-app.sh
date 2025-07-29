#!/bin/bash
# Utilitário para adicionar facilmente uma nova aplicação ao projeto

echo "🚀 [add-new-app.sh] Utilitário para adicionar nova aplicação"

# Verifica se parâmetros foram fornecidos
if [[ $# -ne 4 ]]; then
  echo "❌ Uso: $0 <app_name> <db_name> <user_name> <password>"
  echo ""
  echo "Exemplo:"
  echo "  $0 sistema2 sistema2_dev sistema2_user sistema2_pass"
  echo ""
  echo "A aplicação será adicionada ao .env na variável APPS_CONFIG"
  exit 1
fi

APP_NAME="$1"
DB_NAME="$2"
USER_NAME="$3"
PASSWORD="$4"

# Validação básica dos nomes
if [[ ! "$APP_NAME" =~ ^[a-zA-Z][a-zA-Z0-9_-]*$ ]]; then
  echo "❌ Nome da aplicação deve começar com letra e conter apenas letras, números, _ ou -"
  exit 1
fi

if [[ ! "$DB_NAME" =~ ^[a-zA-Z][a-zA-Z0-9_]*$ ]]; then
  echo "❌ Nome do banco deve começar com letra e conter apenas letras, números ou _"
  exit 1
fi

if [[ ! "$USER_NAME" =~ ^[a-zA-Z][a-zA-Z0-9_]*$ ]]; then
  echo "❌ Nome do usuário deve começar com letra e conter apenas letras, números ou _"
  exit 1
fi

# Verifica se .env existe
if [[ ! -f .env ]]; then
  echo "❌ Arquivo .env não encontrado. Copie .env.example para .env primeiro."
  exit 1
fi

NEW_APP_CONFIG="${APP_NAME}:${DB_NAME}:${USER_NAME}:${PASSWORD}"

# Verifica se APPS_CONFIG já existe no .env
if grep -q "^APPS_CONFIG=" .env; then
  # APPS_CONFIG existe, adiciona a nova aplicação
  CURRENT_CONFIG=$(grep "^APPS_CONFIG=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  
  # Verifica se a aplicação já existe
  if echo "$CURRENT_CONFIG" | grep -q "${APP_NAME}:"; then
    echo "⚠️  Aplicação '$APP_NAME' já existe na configuração"
    echo "    Configuração atual: $CURRENT_CONFIG"
    read -p "Deseja substituir? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      echo "❌ Operação cancelada"
      exit 1
    fi
    
    # Remove a aplicação existente
    UPDATED_CONFIG=$(echo "$CURRENT_CONFIG" | sed "s/${APP_NAME}:[^,]*,\?//g" | sed 's/,$//g' | sed 's/^,//g')
  else
    UPDATED_CONFIG="$CURRENT_CONFIG"
  fi
  
  # Adiciona a nova aplicação
  if [[ -n "$UPDATED_CONFIG" ]]; then
    FINAL_CONFIG="${UPDATED_CONFIG},${NEW_APP_CONFIG}"
  else
    FINAL_CONFIG="$NEW_APP_CONFIG"
  fi
  
  # Atualiza o .env
  sed -i "s|^APPS_CONFIG=.*|APPS_CONFIG=$FINAL_CONFIG|" .env
  
else
  # APPS_CONFIG não existe, adiciona a linha
  echo "" >> .env
  echo "# Configuração Multi-DB (adicionada pelo add-new-app.sh)" >> .env
  echo "APPS_CONFIG=$NEW_APP_CONFIG" >> .env
fi

echo "✅ Aplicação '$APP_NAME' adicionada com sucesso!"
echo "📝 Configuração atual:"
echo "   Database: $DB_NAME"
echo "   User: $USER_NAME"
echo "   Password: $PASSWORD"
echo ""

# Função para encontrar próximo índice disponível
find_next_index() {
  local max_index=9
  if [[ -d init ]]; then
    for file in init/*-create-*-db.sql; do
      if [[ -f "$file" ]]; then
        local index=$(basename "$file" | sed 's/-.*//')
        if [[ "$index" =~ ^[0-9]+$ && "$index" -gt "$max_index" ]]; then
          max_index=$index
        fi
      fi
    done
  fi
  echo $((max_index + 1))
}

# Gera o SQL da nova aplicação imediatamente
echo "🔧 Gerando SQL para a nova aplicação..."
mkdir -p init
next_index=$(find_next_index)

cat templates/create-app-db.sql.tpl \
  | sed "s/{{APP_DB}}/$DB_NAME/" \
  | sed "s/{{APP_USER}}/$USER_NAME/" \
  | sed "s/{{APP_PASS}}/$PASSWORD/" \
  | sed "s/{{APP_NAME}}/$APP_NAME/" \
  > "init/${next_index}-create-${APP_NAME}-db.sql"

echo "✅ SQL gerado: init/${next_index}-create-${APP_NAME}-db.sql"
echo ""
echo "🔧 Para aplicar as mudanças nos containers:"
echo "   docker compose down"
echo "   docker compose up -d"
