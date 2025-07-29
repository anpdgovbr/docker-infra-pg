#!/bin/bash
# ============================================================================
# MONITOR DE APLICAÇÕES: Verifica periodicamente por novas apps
# ============================================================================
# Este script pode ser executado como cronjob ou chamado periodicamente
# para garantir que todas as aplicações em apps.conf tenham seus bancos

echo "🔍 [monitor-apps.sh] Verificação rápida de sincronização..."

# Executar auto-sync silencioso (sem interação)
if bash "$(dirname "$0")/auto-sync-databases.sh" > /tmp/sync-output.log 2>&1; then
    # Se houve criações, mostrar resultado
    if grep -q "🆕 Bancos criados:" /tmp/sync-output.log; then
        echo "🆕 Novas aplicações detectadas e configuradas:"
        grep -A 10 "🆕 Bancos criados:" /tmp/sync-output.log | grep -E "^\s*-"
    else
        echo "✅ Todos os bancos estão sincronizados"
    fi
else
    echo "⚠️  Problemas detectados na sincronização"
    echo "📄 Execute para detalhes: bash /app/scripts/auto-sync-databases.sh"
fi

rm -f /tmp/sync-output.log
