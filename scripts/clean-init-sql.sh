#!/bin/bash
# Utilitário para limpeza controlada de arquivos SQL gerados

echo "🧹 [clean-init-sql.sh] Utilitário de limpeza de arquivos SQL"

# Função para mostrar ajuda
show_help() {
  echo "Uso: $0 [OPÇÃO]"
  echo ""
  echo "Opções:"
  echo "  --all       Remove todos os arquivos SQL gerados"
  echo "  --app NAME  Remove apenas os arquivos da aplicação específica"
  echo "  --list      Lista todos os arquivos SQL existentes"
  echo "  --help      Mostra esta ajuda"
  echo ""
  echo "Exemplos:"
  echo "  $0 --list                    # Lista arquivos existentes"
  echo "  $0 --app backlog            # Remove apenas arquivos do backlog"
  echo "  $0 --all                    # Remove todos os arquivos"
}

# Função para listar arquivos
list_files() {
  echo "📋 [clean-init-sql.sh] Arquivos SQL existentes:"
  if [[ -d init ]]; then
    find init -name "*-create-*-db.sql" -type f | sort | while read file; do
      echo "   📄 $file"
    done
  else
    echo "   (nenhum arquivo encontrado - pasta init não existe)"
  fi
}

# Função para remover todos os arquivos
clean_all() {
  echo "⚠️  [clean-init-sql.sh] Removendo TODOS os arquivos SQL gerados..."
  read -p "Tem certeza? Esta ação não pode ser desfeita. (y/N): " confirm
  
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    if [[ -d init ]]; then
      rm -f init/*-create-*-db.sql
      echo "✅ [clean-init-sql.sh] Todos os arquivos SQL removidos"
    else
      echo "ℹ️  [clean-init-sql.sh] Pasta init não existe - nada para remover"
    fi
  else
    echo "❌ [clean-init-sql.sh] Operação cancelada"
  fi
}

# Função para remover arquivos de uma aplicação específica
clean_app() {
  local app_name="$1"
  
  if [[ -z "$app_name" ]]; then
    echo "❌ [clean-init-sql.sh] Nome da aplicação é obrigatório"
    echo "   Uso: $0 --app NOME_DA_APP"
    exit 1
  fi
  
  echo "🗑️  [clean-init-sql.sh] Removendo arquivos SQL da aplicação: $app_name"
  
  if [[ -d init ]]; then
    files_found=$(find init -name "*-create-${app_name}-db.sql" -type f)
    
    if [[ -n "$files_found" ]]; then
      echo "Arquivos que serão removidos:"
      echo "$files_found" | while read file; do
        echo "   📄 $file"
      done
      
      read -p "Confirma remoção? (y/N): " confirm
      
      if [[ "$confirm" =~ ^[Yy]$ ]]; then
        rm -f init/*-create-${app_name}-db.sql
        echo "✅ [clean-init-sql.sh] Arquivos da aplicação '$app_name' removidos"
      else
        echo "❌ [clean-init-sql.sh] Operação cancelada"
      fi
    else
      echo "ℹ️  [clean-init-sql.sh] Nenhum arquivo encontrado para a aplicação '$app_name'"
    fi
  else
    echo "ℹ️  [clean-init-sql.sh] Pasta init não existe - nada para remover"
  fi
}

# Processa argumentos
case "$1" in
  --help)
    show_help
    ;;
  --list)
    list_files
    ;;
  --all)
    clean_all
    ;;
  --app)
    if [[ -z "$2" ]]; then
      echo "❌ [clean-init-sql.sh] Nome da aplicação é obrigatório"
      show_help
      exit 1
    fi
    clean_app "$2"
    ;;
  "")
    echo "❌ [clean-init-sql.sh] Parâmetro obrigatório"
    show_help
    exit 1
    ;;
  *)
    echo "❌ [clean-init-sql.sh] Parâmetro inválido: $1"
    show_help
    exit 1
    ;;
esac
