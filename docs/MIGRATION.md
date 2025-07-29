# 🔄 Guia de Migração para Multi-Database

Este documento orienta sobre como migrar projetos existentes para a nova funcionalidade multi-database sem quebrar configurações atuais.

## 📋 Compatibilidade

### ✅ **Projetos Existentes (Sem Alteração Necessária)**

Se você já tem um projeto funcionando com as variáveis:

```env
BACKLOG_DB=backlog_dev
BACKLOG_USER=backlog_user
BACKLOG_PASS=backlog_pass
```

**Não é necessário fazer nenhuma alteração.** O sistema continuará funcionando normalmente.

### 🚀 **Para Aproveitar Multi-Database**

Se você quer adicionar mais aplicações ao mesmo ambiente PostgreSQL:

1. **Mantenha as configurações legadas** (para não quebrar)
2. **Adicione a nova configuração**:

   ```env
   # Configuração legada (mantenha temporariamente)
   BACKLOG_DB=backlog_dev
   BACKLOG_USER=backlog_user
   BACKLOG_PASS=backlog_pass

   # Nova configuração multi-app (recomendada)
   APPS_CONFIG=backlog:backlog_dev:backlog_user:backlog_pass,portal:portal_dev:portal_user:portal_pass
   ```

3. **Execute a regeneração**:
   ```bash
   bash scripts/generate-local-sql.sh
   docker compose down
   docker compose up -d
   ```

## 🔄 Fluxo de Migração Gradual

### Fase 1: Teste (Sem Impacto)

```bash
# 1. Backup do .env atual
cp .env .env.backup

# 2. Adicione apenas a linha APPS_CONFIG incluindo sua app atual
echo "APPS_CONFIG=backlog:$BACKLOG_DB:$BACKLOG_USER:$BACKLOG_PASS" >> .env

# 3. Teste a geração
bash scripts/generate-local-sql.sh

# 4. Verifique se gerou os mesmos arquivos
diff init/01-create-backlog-db.sql init/10-create-backlog-db.sql
```

### Fase 2: Adição de Novas Apps

```bash
# Use o script auxiliar para adicionar novas aplicações
bash scripts/add-new-app.sh sistema2 sistema2_dev sistema2_user sistema2_pass
```

### Fase 3: Limpeza (Opcional - Futuro)

Quando todos os projetos estiverem migrados, você pode remover as variáveis legadas:

```env
# Remover essas linhas (somente após migração completa)
# BACKLOG_DB=backlog_dev
# BACKLOG_USER=backlog_user  
# BACKLOG_PASS=backlog_pass
```

## 🛠️ Scripts Disponíveis

### Modo Automático

- `generate-multi-app-sql.sh`: Novo script principal (multi-app)
- `generate-init-sql.sh`: Script legado (compatibilidade)

### Utilitários

- `add-new-app.sh`: Adiciona nova aplicação facilmente
- `generate-local-sql.sh`: Executa todos os scripts necessários

## 📊 Comparação de Funcionalidades

| Recurso              | Configuração Legada | Multi-Database    |
| -------------------- | ------------------- | ----------------- |
| Número de Apps       | 1 (hardcoded)       | Ilimitado         |
| Adição de Apps       | Edição manual       | Script automático |
| Retrocompatibilidade | ✅                  | ✅                |
| Isolamento de Dados  | ✅                  | ✅                |
| Configuração pgAdmin | ✅                  | ✅                |

## ⚠️ Pontos de Atenção

1. **Nomes Únicos**: Cada aplicação deve ter nome único
2. **Formato APPS_CONFIG**: Respeite o formato `app:db:user:pass`
3. **Separadores**: Use vírgulas entre aplicações, dois pontos entre campos
4. **Senhas Seguras**: Evite caracteres especiais que quebrem parsing (`,`, `:`)
5. **⚡ IMPORTANTE**: O `generate-local-sql.sh` **NÃO sobrescreve** arquivos SQL existentes
   - Arquivos adicionados manualmente são preservados
   - Use `--force` para regeneração completa quando necessário

## �️ Gestão de Conflitos

### Adição Sob Demanda vs generate-local-sql.sh

O sistema foi projetado para **preservar adições manuais**:

```bash
# ✅ SEGURO: Adicionar nova app não quebra existentes
bash scripts/add-new-app.sh nova_app nova_db novo_user nova_pass

# ✅ SEGURO: generate-local-sql.sh preserva arquivos existentes
bash scripts/generate-local-sql.sh

# ⚠️ CUIDADO: Force regeneration apaga tudo e recria
bash scripts/generate-multi-app-sql.sh --force
```

### Limpeza Controlada

Use o script de limpeza quando necessário:

```bash
# Lista arquivos existentes
bash scripts/clean-init-sql.sh --list

# Remove uma aplicação específica
bash scripts/clean-init-sql.sh --app nome_da_app

# Remove tudo (com confirmação)
bash scripts/clean-init-sql.sh --all
```

## 🔍 Validação

Para validar se a migração foi bem-sucedida:

```bash
# 1. Verificar se os SQLs foram gerados
bash scripts/clean-init-sql.sh --list

# 2. Verificar se os bancos foram criados
docker exec -it anpd-postgres-dev psql -U admin -c "\l"

# 3. Verificar se os usuários foram criados
docker exec -it anpd-postgres-dev psql -U admin -c "\du"

# 4. Testar conectividade de cada app
docker exec -it anpd-postgres-dev psql -U backlog_user -d backlog_dev -c "SELECT current_database(), current_user;"
```

## 🛠️ Scripts Disponíveis (Atualizado)

### Scripts Principais

- `generate-multi-app-sql.sh`: Novo script principal (multi-app, preserva existentes)
- `generate-init-sql.sh`: Script legado (compatibilidade)
- `generate-local-sql.sh`: Executa todos os scripts necessários

### Utilitários Avançados

- `add-new-app.sh`: Adiciona nova aplicação e gera SQL imediatamente
- `clean-init-sql.sh`: Limpeza controlada de arquivos SQL

### Comandos Úteis

```bash
# Regeneração forçada (apaga tudo e recria)
bash scripts/generate-multi-app-sql.sh --force

# Limpeza seletiva
bash scripts/clean-init-sql.sh --app nome_da_app
```

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Restaure o backup: `cp .env.backup .env`
2. Execute: `bash scripts/generate-local-sql.sh && docker compose up -d`
3. Documente o erro e abra uma issue no repositório

---

**Lembre-se**: A migração é opcional e gradual. Projetos existentes continuam funcionando sem modificações.
