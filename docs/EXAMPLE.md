# 🧪 Exemplo de Teste da Funcionalidade Multi-Database

Este arquivo demonstra como testar a nova funcionalidade multi-database.

## 📝 Exemplo de Configuração

### 1. Configure o .env com múltiplas aplicações:

```env
# ----------------------------
# Variáveis do Postgres (superusuário)
# ----------------------------
POSTGRES_USER=admin
POSTGRES_PASSWORD=supersecret
POSTGRES_DB=postgres
POSTGRES_TIMEZONE=America/Sao_Paulo

# ----------------------------
# Variáveis do pgAdmin
# ----------------------------
PGADMIN_DEFAULT_EMAIL=admin@anpd.gov.br
PGADMIN_DEFAULT_PASSWORD=supersecret

# ----------------------------
# Configuração Multi-DB (padrão atual)
# ----------------------------
APPS_CONFIG=backlog:backlog_dev:backlog_user:backlog_pass,portal:portal_dev:portal_user:portal_pass,api:api_dev:api_user:api_pass

# ----------------------------
# Configuração Legada (DEPRECATED)
# ----------------------------
# BACKLOG_DB=backlog_dev
# BACKLOG_USER=backlog_user
# BACKLOG_PASS=backlog_pass
```

### 2. Execute os scripts de geração:

```bash
# Gera todos os arquivos necessários
bash scripts/generate-local-sql.sh
```

### 3. Resultado esperado:

Após executar, você deve ver os seguintes arquivos gerados:

```
init/
├── 10-create-backlog-db.sql    # Banco da aplicação backlog
├── 11-create-portal-db.sql     # Banco da aplicação portal
└── 12-create-api-db.sql        # Banco da aplicação api

config/
└── servers.json                # Configuração do pgAdmin
```

### 4. Suba o ambiente:

```bash
docker compose up -d
```

### 5. Verificação:

```bash
# Lista todos os bancos criados
docker exec -it anpd-postgres-dev psql -U admin -c "\l"

# Lista todos os usuários criados
docker exec -it anpd-postgres-dev psql -U admin -c "\du"

# Testa conexão de cada aplicação
docker exec -it anpd-postgres-dev psql -U backlog_user -d backlog_dev -c "SELECT 'Backlog conectado!' as status;"
docker exec -it anpd-postgres-dev psql -U portal_user -d portal_dev -c "SELECT 'Portal conectado!' as status;"
docker exec -it anpd-postgres-dev psql -U api_user -d api_dev -c "SELECT 'API conectada!' as status;"
```

## 🔧 Teste com Script Auxiliar

Teste adicionar uma nova aplicação dinamicamente:

```bash
# Adiciona uma nova aplicação
bash scripts/add-new-app.sh relatorio relatorio_dev relatorio_user relatorio_123

# Regenera os arquivos
bash scripts/generate-local-sql.sh

# Aplica as mudanças
docker compose down
docker compose up -d
```

## 📊 Estrutura Final

Com a configuração de exemplo acima, você terá:

| Aplicação | Banco de Dados | Usuário      | Arquivo SQL              |
| --------- | -------------- | ------------ | ------------------------ |
| backlog   | backlog_dev    | backlog_user | 10-create-backlog-db.sql |
| portal    | portal_dev     | portal_user  | 11-create-portal-db.sql  |
| api       | api_dev        | api_user     | 12-create-api-db.sql     |

## 🎯 Casos de Uso Reais

### Desenvolvimento de Múltiplos Sistemas

- Sistema de Backlog de Demandas
- Portal Público da ANPD
- API de Consulta LGPD
- Sistema de Relatórios
- Dashboard Administrativo

### Ambientes Isolados

- Cada aplicação com seu banco isolado
- Usuários com privilégios específicos
- Facilita desenvolvimento paralelo
- Reduz conflitos entre equipes

---

**Dica**: Comece com uma aplicação e vá adicionando gradualmente conforme a necessidade!
