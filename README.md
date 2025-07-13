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

1.  **Crie um arquivo de ambiente:**
    Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env`. Este arquivo não é versionado e conterá suas configurações locais.

    ```bash
    cp .env.example .env
    ```

2.  **Ajuste as variáveis:**
    Abra o arquivo `.env` e modifique as variáveis conforme necessário. As principais são:

    - `POSTGRES_USER`: Usuário do banco de dados.
    - `POSTGRES_PASSWORD`: Senha do banco de dados.
    - `POSTGRES_DB`: Nome do banco de dados padrão a ser criado.
    - `PGADMIN_DEFAULT_EMAIL`: E-mail de login para o pgAdmin.
    - `PGADMIN_DEFAULT_PASSWORD`: Senha de login para o pgAdmin.

---

## 🚀 Como Executar o Ambiente

Com o Docker em execução, suba os containers em modo detached (background):

```bash
docker compose up -d
```

Este comando irá:
- Baixar as imagens do PostgreSQL 15 e pgAdmin4, se ainda não existirem localmente.
- Criar e iniciar os containers `pg-puro-dev` e `pgadmin-anpd`.
- Criar um volume chamado `pgdata-puro` para persistir os dados do PostgreSQL.
- Criar uma network chamada `pg-net` para a comunicação entre os containers.

Para parar os serviços, execute:

```bash
docker compose down
```

---

## 🛠️ Serviços Disponíveis

| Serviço | Nome do Container | Porta Exposta (Host) | Porta Interna | Volume de Dados |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | `pg-puro-dev` | `5432` | `5432` | `pgdata-puro` |
| **pgAdmin** | `pgadmin-anpd` | `8085` | `80` | - |

---

## 🌐 Acessando o pgAdmin4

1.  **Abra no navegador:**
    Acesse `http://localhost:8085`

2.  **Faça o login:**
    Utilize o e-mail e a senha que você configurou no arquivo `.env` (`PGADMIN_DEFAULT_EMAIL` e `PGADMIN_DEFAULT_PASSWORD`).

3.  **Adicione o servidor PostgreSQL:**
    - Clique em "Add New Server".
    - Na aba **General**, defina um nome (ex: `pg-puro-dev`).
    - Na aba **Connection**, preencha os seguintes campos:
      - **Host name/address:** `postgres` (este é o nome do serviço no `docker-compose.yml`)
      - **Port:** `5432`
      - **Maintenance database:** O valor de `POSTGRES_DB` do seu `.env`.
      - **Username:** O valor de `POSTGRES_USER` do seu `.env`.
      - **Password:** O valor de `POSTGRES_PASSWORD` do seu `.env`.
    - Clique em "Save".

---

## 🐘 Conectando ao Banco de Dados

Você pode se conectar ao PostgreSQL de diferentes maneiras:

- **De outros containers na mesma rede Docker:**
  - **Host:** `postgres`
  - **Porta:** `5432`

- **Da sua máquina local (Host):**
  - **Host:** `localhost`
  - **Porta:** `5432`

Utilize o usuário e senha definidos no seu arquivo `.env`.

---

## 💾 Backups e Gerenciamento de Dados

### Realizando um Backup (Dump)

Para criar um backup do seu banco de dados, execute o seguinte comando no seu terminal:

```bash
docker exec -t pg-puro-dev pg_dump -U SEU_USER -d SEU_DB > backup.sql
```
Substitua `SEU_USER` e `SEU_DB` pelo seu usuário e nome do banco de dados.

### Restaurando um Backup

Para restaurar um banco de dados a partir de um arquivo `.sql`:

```bash
cat backup.sql | docker exec -i pg-puro-dev psql -U SEU_USER -d SEU_DB
```

### Localização dos Dados

Os dados do PostgreSQL são persistidos no volume `pgdata-puro`. Para inspecionar o volume e ver onde os arquivos estão armazenados no seu sistema, utilize:

```bash
docker volume inspect pgdata-puro
```

---

## 🔄 Atualizando as Imagens

Para garantir que você está usando as versões mais recentes do PostgreSQL e pgAdmin, puxe as atualizações das imagens:

```bash
docker compose pull
```

Depois de baixar as novas imagens, suba os containers novamente para que as alterações tenham efeito:

```bash
docker compose up -d
```

---

##  troubleshooting

- **Erro de porta em uso (`port is already allocated`):**
  Verifique se não há outro serviço (ou um container antigo) utilizando as portas `5432` ou `8085`. Você pode alterar as portas no arquivo `docker-compose.yml` se necessário.

- **Container não inicia:**
  Verifique os logs do container para identificar o problema:
  ```bash
  docker logs pg-puro-dev
  docker logs pgadmin-anpd
  ```

---

## ⚠️ Segurança

- **Não use as credenciais padrão em produção.** O arquivo `.env` não deve ser versionado com senhas e dados sensíveis.
- Este ambiente é configurado para desenvolvimento. Para produção, recomenda-se revisões de segurança e configurações de rede mais restritivas.

---

🛡️ **ANPD | Divisão de Desenvolvimento e Sustentação de Sistemas**