# 🧪 Teste da Infraestrutura

## Como testar esta configuração:

### 1. Certifique-se que o Docker está rodando

```bash
docker --version
docker-compose --version
```

### 2. Suba a infraestrutura

```bash
docker-compose up -d
```

### 3. Verifique se funcionou

```bash
# Ver containers rodando
docker ps

# Ver logs do PostgreSQL
docker logs todo-api-postgres

# Conectar ao banco criado
docker exec -it todo-api-postgres psql -U todo_user -d todo_api_dev
```

### 4. Teste a conexão na sua aplicação

```bash
# String de conexão para usar na sua app:
DATABASE_URL=postgresql://todo_user:senha_todo_456@localhost:5432/todo_api_dev
```

### 5. Limpeza (quando terminar)

```bash
# Parar containers
docker-compose down

# Remover dados (CUIDADO!)
docker-compose down -v
```

## ✅ Se tudo deu certo, você verá:

- Container `todo-api-postgres` rodando
- Banco `todo_api_dev` criado
- Usuário `todo_user` com acesso ao banco
- Dados persistindo no volume `todo-api_postgres_data`

## 🎯 Próximos passos:

1. Copie esta estrutura para o seu projeto
2. Ajuste as variáveis no `.env`
3. Configure sua aplicação para usar a `DATABASE_URL`
4. Desenvolva! 🚀
