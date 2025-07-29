#!/bin/bash
# Script de verificação do formato v2.0 padronizado

echo "🔍 [verify-v2-format.sh] Verificando se tudo está no formato v2.0 padronizado..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Função para check
check_file() {
  local file="$1"
  local description="$2"
  
  if [[ -f "$file" ]]; then
    echo -e "${GREEN}✅${NC} $description: $file"
  else
    echo -e "${RED}❌${NC} $description: $file (AUSENTE)"
    ((errors++))
  fi
}

# Função para check de conteúdo
check_content() {
  local file="$1"
  local pattern="$2"
  local description="$3"
  
  if [[ -f "$file" ]] && grep -q "$pattern" "$file"; then
    echo -e "${GREEN}✅${NC} $description"
  else
    echo -e "${YELLOW}⚠️${NC} $description (em $file)"
    ((warnings++))
  fi
}

# Função para check de conteúdo negativo (não deve existir)
check_not_content() {
  local file="$1"
  local pattern="$2"
  local description="$3"
  
  if [[ -f "$file" ]] && ! grep -q "$pattern" "$file"; then
    echo -e "${GREEN}✅${NC} $description"
  else
    echo -e "${RED}❌${NC} $description (encontrado em $file)"
    ((errors++))
  fi
}

echo ""
echo "📋 Verificando arquivos principais..."

# Verificar arquivos principais
check_file "docker-compose.yml" "Compose tradicional"
check_file "docker-compose.gitops.yml" "Compose GitOps"
check_file ".env.example" "Template env local"
check_file ".env.portainer.example" "Template env Portainer"
check_file "config/apps.conf" "Configuração de aplicações"

echo ""
echo "📋 Verificando scripts..."

check_file "scripts/generate-multi-app-sql.sh" "Script multi-app"
check_file "scripts/generate-gitops-sql.sh" "Script GitOps"
check_file "scripts/add-new-app.sh" "Script adicionar app local"
check_file "scripts/add-gitops-app.sh" "Script adicionar app GitOps"
check_file "scripts/clean-init-sql.sh" "Script limpeza"

echo ""
echo "📋 Verificando documentação..."

check_file "README.md" "Documentação principal"
check_file "PORTAINER.md" "Guia GitOps/Portainer"
check_file "LOCAL_VS_GITOPS.md" "Comparação modos"
check_file "MIGRATION.md" "Guia migração"
check_file "EXAMPLE.md" "Exemplos práticos"
check_file "CHANGELOG.md" "Histórico de mudanças"

echo ""
echo "🔍 Verificando formato v2.0..."

# Verificar se usa formato novo
check_content "config/apps.conf" "backlog:backlog_dev:backlog_user" "Formato backlog_dev (novo)"
check_content "config/apps.conf" "portal:portal_dev:portal_user" "Formato portal_dev (novo)"
check_content "config/apps.conf" "api:api_dev:api_user" "Formato api_dev (novo)"

# Verificar se não usa formato antigo
check_not_content ".env.example" "backlog_dim_dev" "Sem backlog_dim_dev (formato antigo)"
check_not_content ".env.example" "portal_anpd_dev" "Sem portal_anpd_dev (formato antigo)"
check_not_content ".env.example" "api_lgpd_dev" "Sem api_lgpd_dev (formato antigo)"

echo ""
echo "🔍 Verificando configurações DEPRECATED..."

check_content ".env.example" "# BACKLOG_DB=" "Configuração legada comentada"
check_content ".env.example" "DEPRECATED" "Marcação DEPRECATED presente"

echo ""
echo "📊 Resumo da verificação:"
echo -e "${GREEN}Sucessos${NC}: $(($(grep -c "✅" <<< "$(bash $0 2>/dev/null)") || 0))"
echo -e "${YELLOW}Avisos${NC}: $warnings"
echo -e "${RED}Erros${NC}: $errors"

if [[ $errors -eq 0 && $warnings -eq 0 ]]; then
  echo ""
  echo -e "${GREEN}🎉 Tudo está no formato v2.0 padronizado!${NC}"
  exit 0
elif [[ $errors -eq 0 ]]; then
  echo ""
  echo -e "${YELLOW}⚠️ Verificação com avisos - revise os itens marcados${NC}"
  exit 1
else
  echo ""
  echo -e "${RED}❌ Verificação falhou - corrija os erros encontrados${NC}"
  exit 2
fi
