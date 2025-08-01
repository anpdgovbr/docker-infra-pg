# 📋 CHECKLIST: Como Aplicar Esta Infraestrutura em Outros Projetos

## 🎯 Para o Projeto Atual (backlog-dim)

### 1. **Copie os arquivos do AppX para o projeto real:**

```bash
# No projeto backlog-dim real:
cp appX/.env.example .env.example
cp appX/setup-backlog-infra.sh .
cp appX/COMO-USAR.md docs/
```

### 2. **Adicione scripts ao package.json:**

```json
{
  "scripts": {
    "infra:setup": "bash setup-backlog-infra.sh",
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "infra:logs": "cd infra-db && docker-compose logs -f postgres",
    "infra:reset": "cd infra-db && docker-compose down -v && docker-compose up -d",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed",
    "db:fresh": "npm run infra:reset && sleep 10 && npm run db:setup"
  }
}
```

### 3. **Instrução para desenvolvedores:**

```bash
# Setup inicial (uma vez)
npm run infra:setup

# Desenvolvimento diário
npm run db:setup
npm run dev
```

## 🚀 Para Projetos Novos

### 1. **Configure .env.example do projeto:**

```bash
# Obrigatório
POSTGRES_DB=nome_projeto_dev
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# Next.js padrão
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NODE_TLS_REJECT_UNAUTHORIZED=0

# Específicos do projeto...
```

### 2. **Adicione ao README do projeto:**

```markdown
## 🗄️ Banco de Dados

### Setup inicial:

\`\`\`bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh | bash
cd infra-db && docker-compose up -d
\`\`\`

### Desenvolvimento:

\`\`\`bash
npm run prisma:migrate
npm run prisma:seed
npm run dev
\`\`\`
```

### 3. **Scripts recomendados (package.json):**

```json
{
  "scripts": {
    "infra:up": "cd infra-db && docker-compose up -d",
    "infra:down": "cd infra-db && docker-compose down",
    "db:setup": "npm run infra:up && sleep 5 && npm run prisma:migrate && npm run prisma:seed"
  }
}
```

## 🔧 Customizações por Projeto

### **Projetos com Prisma:**

- Garanta que `DATABASE_URL` esteja no .env.example
- Adicione `POSTGRES_DB` com o nome do banco
- Scripts de migrate e seed funcionarão automaticamente

### **Projetos com Auth:**

- Adicione variáveis de `NEXTAUTH_*`
- Configure providers (Azure AD, Google, etc.)

### **Projetos com APIs externas:**

- Adicione URLs de APIs no .env.example
- Use `NEXT_PUBLIC_*` para variáveis do frontend

## ✅ Resultado Esperado

Cada projeto ANPD terá:

- ✅ Setup de banco padronizado
- ✅ Comando único para configurar infraestrutura
- ✅ Desenvolvimento simplificado
- ✅ Isolamento entre projetos
- ✅ Documentação consistente

## 📝 Notas Importantes

1. **Nunca** commite arquivo `.env` real
2. **Sempre** configure `.env.example` completo
3. **Use** nomes descritivos para bancos (`projeto_dev`, não `db`)
4. **Documente** variáveis específicas do projeto
5. **Teste** o setup em ambiente limpo

---

**Padronização = Produtividade!** 🎯
