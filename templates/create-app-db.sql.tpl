-- Banco e usuário da aplicação backlog-dim (gerado automaticamente)

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

-- Garantir privilégios no banco
GRANT ALL PRIVILEGES ON DATABASE {{APP_DB}} TO {{APP_USER}};

-- Conectar ao banco criado para aplicar permissões no schema
\connect {{APP_DB}}

-- Garantir permissões no schema public
GRANT ALL PRIVILEGES ON SCHEMA public TO {{APP_USER}};

-- Permissões em objetos já existentes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {{APP_USER}};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {{APP_USER}};
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO {{APP_USER}};

-- Permissões em objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO {{APP_USER}};
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO {{APP_USER}};
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO {{APP_USER}};
