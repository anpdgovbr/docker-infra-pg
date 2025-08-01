# 🐘 Docker Infraestrutura PostgreSQL - ANPD

> **Infraestrutura genérica e auto-configurável para qualquer projeto ANPD**

## 🚀 Setup Rápido (Uma Linha)

No seu projeto, execute:

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash
```

**Pronto!** Seu projeto agora tem uma infraestrutura PostgreSQL isolada e configurada.

## 📋 Pré-requisitos

Seu projeto deve ter:

1. **package.json** com nome do projeto
2. **.env** com configuração atual do banco:
   ```bash
   POSTGRES_DB=meu_projeto_dev
   DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"
   ```

## 🎯 Como Funciona

1. **Script lê seu projeto** (package.json + .env)
2. **Gera credenciais únicas** automaticamente
3. **Clona esta infraestrutura** para pasta `infra-db/`
4. **Configura tudo** baseado no seu projeto
5. **Fornece nova DATABASE_URL** segura

## ✅ Resultado

- ✅ PostgreSQL isolado para seu projeto
- ✅ Credenciais únicas e seguras
- ✅ Zero configuração manual
- ✅ Banco pronto para Prisma/migrations

## 📖 Scripts Recomendados

Adicione ao seu `package.json`:

```json
{
  "scripts": {
    "infra:setup": "curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed"
  }
}
```

## 🔒 Segurança

- ✅ **Zero senhas hardcoded** no código
- ✅ **Credenciais sempre únicas** por projeto/execução
- ✅ **Bancos isolados** entre projetos
- ✅ **Senhas geradas** com criptografia forte

## 📚 Documentação

- **[COMO USAR](REPLICAR-EM-PROJETOS.md)** - Guia completo
- **[docs/](docs/)** - Documentação técnica detalhada

---

**Uma infraestrutura. Todos os projetos ANPD. Zero configuração.** 🎉
