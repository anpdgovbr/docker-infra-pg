# Infraestrutura Docker para PostgreSQL e pgAdmin (ANPD)

Este repositório fornece uma configuração de ambiente de desenvolvimento local utilizando Docker e Docker Compose. Ele é composto por um container para o banco de dados PostgreSQL 15 e outro para a ferramenta de administração pgAdmin4.

O ambiente foi projetado para ser simples, robusto e facilmente adaptável para futuras implantações em ambientes de produção, como o Kubernetes.

---

## 📋 Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas em sua máquina:

- **[Docker](https://docs.docker.com/get-docker/)**
- **[Docker Compose](https://docs.docker.com/compose/install/)**

---

## ⚙️ Configuração

O projeto utiliza variáveis de ambiente para configurar os serviços. Para personalizar suas configurações, siga os passos abaixo:

1. **Crie um arquivo de ambiente:**
   Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env`. Este arquivo não é versionado e conterá suas configurações locais.

   ```bash
   cp .env.example .env
   ```

2. **Gere os arquivos de inicialização:**
   Execute o script que gera todos os arquivos necessários com base nas variáveis definidas no `.env`:

   ```bash
   bash scripts/run-all.sh
   ```

   Esse script irá:

   - Gerar `init/01-create-backlog-dim.sql` com o banco da aplicação
   - Gerar `config/servers.json` com a configuração do pgAdmin pré-carregada

3. **Ajuste as variáveis:**
   Abra o `.env` e modifique conforme necessário:

   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: superusuário e banco padrão
   - `BACKLOG_DB`, `BACKLOG_USER`, `BACKLOG_PASS`: banco e usuário da aplicação
   - `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD`: credenciais de acesso ao pgAdmin

---

## 🚀 Como Executar o Ambiente

Com o Docker em execução, suba os containers:

```bash
docker compose up -d
```

Este comando irá:

- Baixar as imagens do PostgreSQL 15 e pgAdmin4, se ainda não existirem localmente.
- Criar e iniciar os containers `anpd-postgres-dev` e `anpd-pgadmin-dev`.
- Criar um volume chamado `pgdata-anpd-dev` para persistir os dados.
- Executar o SQL de criação do banco/backlog, caso o volume esteja vazio.
- Criar uma network chamada `pg-net` para a comunicação entre os containers.

Para parar os serviços:

```bash
docker compose down
```

---

## 🛠️ Serviços Disponíveis

| Serviço    | Container           | Porta Host | Porta Interna | Volume de Dados   |
| ---------- | ------------------- | ---------- | ------------- | ----------------- |
| PostgreSQL | `anpd-postgres-dev` | `5432`     | `5432`        | `pgdata-anpd-dev` |
| pgAdmin    | `anpd-pgadmin-dev`  | `8085`     | `80`          | `pgadmin-data`    |

---

## 🌐 Acessando o pgAdmin4

1. Acesse `http://localhost:8085`
2. Login com `PGADMIN_DEFAULT_EMAIL` e `PGADMIN_DEFAULT_PASSWORD` definidos no `.env`
3. O servidor `anpd-postgres-dev` já estará visível automaticamente se o `servers.json` for gerado corretamente.

---

## 💾 Backup e Restauração

**Backup:**

```bash
docker exec -t anpd-postgres-dev pg_dump -U USUARIO -d BANCO > backup.sql
```

**Restauração:**

```bash
cat backup.sql | docker exec -i anpd-postgres-dev psql -U USUARIO -d BANCO
```

**Localização dos dados:**

```bash
docker volume inspect pgdata-anpd-dev
```

---

## 🔄 Atualizando as Imagens

```bash
docker compose pull
docker compose up -d
```

---

## 🧪 Troubleshooting

- **Porta em uso:** Verifique se há conflitos nas portas `5432` ou `8085`
- **Ver logs:**
  ```bash
  docker logs anpd-postgres-dev
  docker logs anpd-pgadmin-dev
  ```

---

## ⚠️ Segurança

- Nunca versionar `.env` com credenciais reais
- Este ambiente é voltado para desenvolvimento

---

🛡️ **ANPD | Divisão de Desenvolvimento e Sustentação de Sistemas**
