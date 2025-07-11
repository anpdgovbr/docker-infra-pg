# pg-puro-dev (ANPD)

Este projeto contém o ambiente Docker para um PostgreSQL 15 puro e um pgAdmin4,
ideal para uso em ambiente de desenvolvimento local, mas já projetado para
facilitar futura migração para produção em Kubernetes (HCI Nutanix).

---

## 🚀 Como subir o ambiente

Clone o repositório (exemplo usando GitLab / GitHub):

```
cd /srv/docker
git clone https://git.seu-org/anpd-docker-infra.git
cd anpd-docker-infra/pg-puro-dev
```

Suba o ambiente com Docker Compose:

```
docker compose up -d
```

Isso irá:
- Criar um container `pg-puro-dev` rodando PostgreSQL 15, armazenando dados no volume `pgdata-puro`.
- Criar um container `pgadmin-anpd` rodando pgAdmin4 acessível na porta 8085.

---

## 🌐 Acessando o pgAdmin4

Acesse no navegador:

```
http://localhost:8085
```

- **Login:** `admin@anpd.gov.br`
- **Senha:** `supersecret`

Para adicionar o PostgreSQL no pgAdmin:

- **Name:** pg-puro-dev
- **Host name/address:** `postgres`
- **Port:** `5432`
- **Username:** `admin`
- **Password:** `supersecret`

---

## 🐘 Conexões PostgreSQL

- Dentro do mesmo network Docker:
  - `host=postgres`, `port=5432`, `user=admin`, `password=supersecret`
- Para expor ao host (se quiser testar fora do Docker), basta abrir a porta 5432 no compose.

---

## 🔄 Atualizar imagens

Para atualizar para a última versão do Postgres/pgAdmin:

```
docker compose pull
docker compose up -d
```

---

## 💾 Backups

Para identificar o volume Docker e copiar snapshots:

```
docker volume inspect pgdata-puro
```

Ou para rodar dumps diretos:

```
docker exec -it pg-puro-dev pg_dump -U admin -d nome_do_banco > backup.sql
```

---

## ⚠ Observações importantes

- Este ambiente está configurado para **uso DEV**, em **VM compartilhada**, com isolamento via multi-DB.
- Ideal para separar aplicações com `CREATE DATABASE monolito_db;` e `CREATE DATABASE microservice_db;`
- Em produção (Kubernetes com PVC Nutanix), cada aplicação poderá ter seu cluster ou banco isolado.
- Configurações sensíveis estão no `.env`, **não versionar com senhas reais em prod**.

---

🛡️ **ANPD | Divisão de Desenvolvimento e Sustentação de Sistemas**
