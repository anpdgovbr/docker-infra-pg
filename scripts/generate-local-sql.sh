#!/bin/bash
# Gera arquivos SQL para desenvolvimento local - executa apenas scripts essenciais

echo "🚀 [generate-local-sql.sh] Iniciando geração dos arquivos SQL para desenvolvimento local"

# Scripts essenciais para modo local (em ordem de execução)
ESSENTIAL_SCRIPTS=(
  "generate-multi-app-sql.sh"    # Gera SQLs baseado em APPS_CONFIG
  "generate-init-sql.sh"         # Fallback/compatibilidade legado
  "generate-servers-json.sh"     # Configura pgAdmin
)

success_count=0
total_scripts=${#ESSENTIAL_SCRIPTS[@]}

for script_name in "${ESSENTIAL_SCRIPTS[@]}"; do
  script_path="./scripts/$script_name"
  
  if [[ -f "$script_path" ]]; then
    echo "🔧 [generate-local-sql.sh] Executando $script_name"
    bash "$script_path"
    status=$?
    
    if [[ $status -eq 0 ]]; then
      ((success_count++))
      echo "✅ [generate-local-sql.sh] $script_name executado com sucesso"
    else
      echo "❌ [generate-local-sql.sh] Falha na execução de $script_name (exit code $status)"
      echo "    Continuando execução dos demais scripts..."
    fi
  else
    echo "⚠️  [generate-local-sql.sh] Script $script_name não encontrado - pulando"
  fi
done

echo ""
echo "📊 [generate-local-sql.sh] Resumo da execução:"
echo "   Scripts executados com sucesso: $success_count/$total_scripts"

if [[ $success_count -eq $total_scripts ]]; then
  echo "✅ [generate-local-sql.sh] Todos os scripts essenciais executados com sucesso!"
  exit 0
else
  echo "⚠️  [generate-local-sql.sh] Alguns scripts tiveram problemas, mas ambiente pode estar funcional"
  echo "    Verifique os logs acima para detalhes"
  exit 0  # Não falha para permitir que Docker continue
fi
