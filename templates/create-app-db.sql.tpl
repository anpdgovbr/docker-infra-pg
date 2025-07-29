-- =======================================================
-- Banco e usuário da aplicação: {{APP_NAME}}
-- =======================================================
-- Gerado automaticamente pelo docker-infra-pg
-- Database: {{APP_DB}}
-- User: {{APP_USER}}
-- =======================================================

-- Criação do banco de dados
CREATE DATABASE {{APP_DB}};

-- Criação do usuário (com verificação opcional)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{{APP_USER}}') THEN
    CREATE USER {{APP_USER}} WITH ENCRYPTED PASSWORD '{{APP_PASS}}';
  END IF;
END
$$;

-- Garante que o usuário pode criar bancos (requerido pelo Prisma migrate dev)
ALTER ROLE {{APP_USER}} CREATEDB;

-- Garantir privilégios no banco
GRANT ALL PRIVILEGES ON DATABASE {{APP_DB}} TO {{APP_USER}};

-- =======================================================
-- Fim da configuração para {{APP_NAME}}
-- =======================================================
