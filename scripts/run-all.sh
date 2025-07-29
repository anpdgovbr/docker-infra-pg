#!/bin/bash
# Executa todos os scripts .sh dentro da pasta scripts/, exceto ele mesmo, com logging robusto

echo "🚀 [run-all.sh] Iniciando execução dos scripts em scripts/"

for script in ./scripts/*.sh; do
  if [[ "$script" != *"run-all.sh" ]]; then
    echo "🔧 [run-all.sh] Executando $script"
    bash "$script"
    status=$?
    if [[ $status -ne 0 ]]; then
      echo "❌ [run-all.sh] Falha na execução de $script (exit code $status)"
      exit $status
    fi
  fi
done

echo "✅ [run-all.sh] Todos os scripts executados com sucesso."
