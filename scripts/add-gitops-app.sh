#!/bin/bash
# Utilitário para adicionar aplicação em modo GitOps (Portainer)

echo "🚀 [add-gitops-app.sh] Utilitário para adicionar aplicação no GitOps"

# Verifica se parâmetros foram fornecidos
if [[ $# -ne 3 ]]; then
  echo "❌ Uso: $0 <app_name> <db_name> <user_name>"
  echo ""
  echo "Exemplo:"
  echo "  $0 sistema2 sistema2_dev sistema2_user"
  echo ""
  echo "📝 Nota: A senha será configurada como variável de ambiente no Portainer"
  echo "    Nome da variável: \${APP_NAME^^}_PASSWORD (ex: SISTEMA2_PASSWORD)"
  exit 1
fi

APP_NAME="$1"
DB_NAME="$2"
USER_NAME="$3"

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

# Verifica se apps.conf existe
if [[ ! -f "config/apps.conf" ]]; then
  echo "❌ Arquivo config/apps.conf não encontrado."
  exit 1
fi

# Verifica se a aplicação já existe
if grep -q "^${APP_NAME}:" config/apps.conf; then
  echo "⚠️  Aplicação '$APP_NAME' já existe na configuração"
  echo "    Para atualizar, edite manualmente o arquivo config/apps.conf"
  exit 1
fi

# Adiciona a nova aplicação ao apps.conf
echo "" >> config/apps.conf
echo "# Aplicação: $APP_NAME" >> config/apps.conf
echo "${APP_NAME}:${DB_NAME}:${USER_NAME}" >> config/apps.conf

echo "✅ Aplicação '$APP_NAME' adicionada ao config/apps.conf"
echo ""
echo "📝 Configuração adicionada:"
echo "   Database: $DB_NAME"
echo "   User: $USER_NAME"
echo "   Password Variable: ${APP_NAME^^}_PASSWORD"
echo ""
echo "🔧 Próximos passos para GitOps/Portainer:"
echo "   1. Commit e push desta mudança"
echo "   2. No Portainer, adicione a variável de ambiente:"
echo "      Nome: ${APP_NAME^^}_PASSWORD"
echo "      Valor: [senha_segura_da_aplicacao]"
echo "   3. Redeploy do stack (automático se auto-update ativo)"
echo ""
echo "🔧 Para teste local:"
echo "   1. Adicione ao .env: ${APP_NAME^^}_PASSWORD=senha_teste"
echo "   2. Execute: bash scripts/generate-gitops-sql.sh"
echo "   3. Execute: docker compose up -d"
