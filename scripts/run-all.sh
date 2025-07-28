#!/bin/bash
# Executa todos os scripts .sh dentro da pasta scripts/, exceto ele mesmo

echo "🚀 Executando todos os scripts em scripts/"

for script in ./scripts/*.sh; do
  if [[ "$script" != *"run-all.sh" ]]; then
    echo "🔧 Rodando $script"
    bash "$script"
  fi
done

echo "✅ Todos os scripts executados com sucesso."
