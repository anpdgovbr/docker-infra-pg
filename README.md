# Infraestrutura Docker para PostgreSQL e pgAdmin (ANPD)

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/get-docker/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![pgAdmin](https://img.shields.io/badge/pgAdmin-326690?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.pgadmin.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![ANPD](https://img.shields.io/badge/ANPD-Governo%20Federal-blue?style=for-the-badge)](https://www.gov.br/anpd/)

Este repositório fornece uma configuração robusta de ambiente de desenvolvimento local utilizando Docker e Docker Compose, projetada especificamente para as necessidades da **ANPD (Autoridade Nacional de Proteção de Dados)**.

A infraestrutura é composta por containers para PostgreSQL 15 e pgAdmin4, com **suporte nativo a múltiplas aplicações e bancos de dados**, facilitando o desenvolvimento e a manutenção de diversos sistemas simultaneamente.

## 🌟 Características Principais

- **Multi-Database Nativo**: Suporte completo a múltiplas aplicações com bancos isolados
- **GitOps Ready**: Deploy automatizado via Portainer ou Kubernetes
- **Configuração Versionada**: Estrutura de aplicações versionada no repositório
- **Segurança Integrada**: Credenciais separadas do código, suporte a secrets
- **Zero Config**: Aplicações são criadas automaticamente no primeiro deploy
- **Documentação Completa**: Guias detalhados para todos os cenários de uso

---

## 📋 Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas em sua máquina:

- **[Docker](https://docs.docker.com/get-docker/)** (versão 20.10+)
- **[Docker Compose](https://docs.docker.com/compose/install/)** (versão 2.0+)
- **Bash** (para executar os scripts de configuração)

---

## ⚙️ Configuração

### � **Escolha seu Modo de Deploy**

Este projeto suporta dois modos de deployment:

| Modo                                               | Descrição                               | Ideal Para                    |
| -------------------------------------------------- | --------------------------------------- | ----------------------------- |
| 🏠 **[Local](#-setup-local)**                      | Execução tradicional via docker-compose | Desenvolvimento local, testes |
| 🌐 **[GitOps/Portainer](#-setup-gitopsportainer)** | Deploy automatizado via Portainer Stack | Servidores de dev, produção   |

---

### 🏠 Setup Local

#### 1. **Clone o repositório:**

```bash
git clone https://github.com/anpdgovbr/docker-infra-pg.git
cd docker-infra-pg
```

#### 2. **Crie o arquivo de ambiente:**

```bash
cp .env.example .env
```

#### 3. **Configure suas aplicações no `.env`:**

**Para múltiplas aplicações (recomendado):**

```env
APPS_CONFIG=backlog:backlog_dim_dev:backlog_user_db:senha_backlog,controladores:controladores_api_dev:controladores_user:senha_controladores
```

**Para configuração legada (DEPRECATED):**

````env
# BACKLOG_DB=backlog_dim_dev
# BACKLOG_USER=backlog_user_db
# BACKLOG_PASS=senha_backlog
```#### 4. **Gere os arquivos de inicialização:**

```bash
bash scripts/generate-local-sql.sh
````

---

### 🌐 Setup GitOps/Portainer

#### 📋 **Características:**

- ✅ **Configurações versionadas** no repositório (`config/apps.conf`)
- ✅ **Senhas seguras** no Portainer (não versionadas)
- ✅ **Auto-deploy** quando o código é atualizado
- ✅ **Gestão centralizada** via interface Portainer

#### 🚀 **Setup Rápido:**

1. **No Portainer, criar Stack GitOps:**

   - Repository: `https://github.com/anpdgovbr/docker-infra-pg`
   - Compose: `docker-compose.yml` (arquivo unificado)
   - Auto-update: ✅ Enabled

2. **Configurar Environment Variables:**

   ```env
   POSTGRES_PASSWORD=senha_super_secreta
   PGADMIN_DEFAULT_PASSWORD=senha_pgadmin
   BACKLOG_PASSWORD=senha_backlog
   CONTROLADORES_PASSWORD=senha_controladores
   # ... outras senhas conforme apps.conf
   ```

3. **Deploy automático** 🚀

📖 **[Guia Completo GitOps/Portainer →](docs/PORTAINER.md)**

---

## 🚀 Como Executar o Ambiente

### Iniciando os Serviços

```bash
docker compose up -d
```

Este comando irá:

- 📥 Baixar as imagens do PostgreSQL 15 e pgAdmin4
- 🔧 Criar e iniciar os containers `anpd-postgres-dev` e `anpd-pgadmin-dev`
- 💾 Criar volume `pgdata-anpd-dev` para persistência dos dados
- 🗄️ Executar SQLs de criação de bancos e usuários para cada aplicação
- 🌐 Criar network `pg-net` para comunicação entre containers

### Parando os Serviços

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
3. O servidor `anpd-postgres-dev` já estará configurado automaticamente
4. Todos os bancos das aplicações configuradas estarão visíveis

---

## 🗃️ Gestão Multi-Database

### 📱 Adicionando Nova Aplicação

#### 🏠 **Modo Local:**

**Método 1: Script Automatizado (Recomendado)**

```bash
bash scripts/add-new-app.sh minha_app minha_app_dev app_user app_pass
```

**Método 2: Edição Manual do .env**

```env
# Adicione sua aplicação à lista separada por vírgulas
APPS_CONFIG=app1:db1:user1:pass1,app2:db2:user2:pass2,nova_app:nova_db:novo_user:nova_pass
```

#### 🌐 **Modo GitOps/Portainer:**

**Método 1: Script GitOps (Recomendado)**

```bash
# 1. Adiciona configuração (sem senha)
bash scripts/add-gitops-app.sh nova_app nova_db novo_user

# 2. Commit e push
git add config/apps.conf
git commit -m "feat: adiciona aplicação nova_app"
git push

# 3. No Portainer: Adiciona variável NOVA_APP_PASSWORD
# 4. Auto-deploy via GitOps 🚀
```

**Método 2: Edição Manual**

```bash
# 1. Edite config/apps.conf:
echo "nova_app:nova_db:novo_user" >> config/apps.conf

# 2. Git push + Portainer env var
```

### 🔄 Aplicando Mudanças

Após adicionar uma nova aplicação:

```bash
# Regenera os arquivos de configuração
bash scripts/generate-local-sql.sh

# Reinicia os containers para aplicar mudanças
docker compose down
docker compose up -d
```

### 📊 Estrutura de Dados por Aplicação

Para cada aplicação configurada, é criado:

- ✅ **Banco de dados** isolado com o nome especificado
- 👤 **Usuário dedicado** com privilégios completos no banco
- 🔐 **Permissões granulares** para máxima segurança
- 🛠️ **Suporte a migrations** (compatível com Prisma, Sequelize, etc.)

---

## 💾 Backup e Restauração

### 📤 Backup

**Backup de uma aplicação específica:**

```bash
docker exec -t anpd-postgres-dev pg_dump -U USUARIO -d BANCO > backup_app.sql
```

**Backup de todos os bancos:**

```bash
docker exec -t anpd-postgres-dev pg_dumpall -U admin > backup_completo.sql
```

### 📥 Restauração

**Restaurar uma aplicação:**

```bash
cat backup_app.sql | docker exec -i anpd-postgres-dev psql -U USUARIO -d BANCO
```

**Restaurar backup completo:**

```bash
cat backup_completo.sql | docker exec -i anpd-postgres-dev psql -U admin
```

### 📍 Localização dos Dados

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

### ❌ Problemas Comuns

**Porta em uso:**

```bash
# Verificar processos usando as portas
netstat -tulpn | grep :5432
netstat -tulpn | grep :8085
```

**Ver logs dos containers:**

```bash
docker logs anpd-postgres-dev
docker logs anpd-pgadmin-dev
docker logs run-init-scripts
```

**Problemas de permissão:**

```bash
# No Linux/Mac, ajustar permissões dos scripts
chmod +x scripts/*.sh
```

**Problemas de conectividade:**

```bash
# Verificar se os containers estão na mesma rede
docker network ls
docker network inspect docker-infra-pg_pg-net
```

### 🔍 Debug Avançado

**Conectar diretamente ao PostgreSQL:**

```bash
docker exec -it anpd-postgres-dev psql -U admin -d postgres
```

**Verificar aplicações configuradas:**

```bash
# Lista bancos criados
docker exec -it anpd-postgres-dev psql -U admin -c "\l"

# Lista usuários criados
docker exec -it anpd-postgres-dev psql -U admin -c "\du"
```

---

## 📚 Estrutura do Projeto

```
docker-infra-pg/
├── 📄 docker-compose.yml          # Configuração principal dos serviços
├── 🐳 Dockerfile.init-runner      # Container para execução de scripts
├── 🔧 pgadmin-init.sh            # Script de inicialização do pgAdmin
├── 📖 README.md                  # Esta documentação
├── 📁 scripts/                   # Scripts de automação
│   ├── 🚀 generate-local-sql.sh  # Executa todos os scripts (modo local)
│   ├── 🗄️ generate-init-sql.sh   # Gera SQLs (modo legado)
│   ├── 🗄️ generate-multi-app-sql.sh # Gera SQLs multi-app
│   ├── ⚙️ generate-servers-json.sh # Configura pgAdmin
│   └── ➕ add-new-app.sh         # Adiciona nova aplicação
├── 📁 templates/                 # Templates de configuração
│   ├── 🗄️ create-app-db.sql.tpl  # Template SQL para bancos
│   └── ⚙️ servers.json.tpl       # Template configuração pgAdmin
├── 📁 init/                      # SQLs gerados automaticamente
└── 📁 config/                    # Configurações geradas
```

---

## 🔒 Segurança

### ⚠️ Importantes Considerações

- **NUNCA** versione o arquivo `.env` com credenciais reais
- Este ambiente é projetado para **desenvolvimento local**
- Para produção, utilize secrets managers e configurações específicas
- Mantenha senhas complexas e rotacione regularmente
- Configure adequadamente firewalls e acessos de rede

### 🛡️ Boas Práticas

- Use senhas diferentes para cada aplicação
- Implemente princípio do menor privilégio
- Monitore logs de acesso regularmente
- Mantenha backups atualizados
- Atualize imagens Docker periodicamente

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🏛️ Sobre a ANPD

A **Autoridade Nacional de Proteção de Dados (ANPD)** é o órgão da administração pública federal responsável por zelar, implementar e fiscalizar o cumprimento da Lei Geral de Proteção de Dados Pessoais (LGPD) em todo o território nacional.

---

## � Documentação Adicional

- 📖 **[Guia GitOps/Portainer](docs/PORTAINER.md)** - Setup completo com Portainer
- 🔄 **[Migração Local ↔ GitOps](docs/LOCAL_VS_GITOPS.md)** - Comparação e migração
- 🧪 **[Exemplos Práticos](docs/EXAMPLE.md)** - Testes e configurações
- 📋 **[Guia de Migração](docs/MIGRATION.md)** - Migração de versões antigas
- 🐛 **[Resolução de Conflitos](docs/CONFLICT_TEST.md)** - Troubleshooting avançado

---

## �📞 Suporte

Para questões relacionadas a este projeto:

- 🐛 **Issues**: [GitHub Issues](https://github.com/anpdgovbr/docker-infra-pg/issues)
- 📧 **Contato**: Divisão de Desenvolvimento e Sustentação de Sistemas - ANPD
- 🌐 **Site**: [www.gov.br/anpd](https://www.gov.br/anpd/)

---

🛡️ **ANPD | Divisão de Desenvolvimento e Sustentação de Sistemas**
