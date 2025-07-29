#!/bin/bash

# Só copia o servers.json se o banco de dados do pgAdmin ainda não existe
if [ ! -f /var/lib/pgadmin/pgadmin4.db ]; then
  echo "📂 [pgadmin-init.sh] Primeira execução detectada — copiando servers.json"
  if [ -f /pgadmin4/servers.json ]; then
    cp /pgadmin4/servers.json /var/lib/pgadmin/servers.json
    chown pgadmin:pgadmin /var/lib/pgadmin/servers.json
    echo "✅ [pgadmin-init.sh] servers.json copiado com sucesso"
  else
    echo "⚠️  [pgadmin-init.sh] servers.json não encontrado em /pgadmin4/"
  fi
else
  echo "ℹ️  [pgadmin-init.sh] pgadmin4.db já existe — não sobrescrevendo servers.json"
fi

# Continua com o processo padrão
/docker-entrypoint.sh
