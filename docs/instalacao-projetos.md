# � Instalação em Projetos Existentes

> **Objetivo**: Adicionar a infraestrutura PostgreSQL em qualquer projeto ANPD existente sem quebrar nada que já funciona.

## 🎯 Resumo Executivo

- ⚡ **1 comando**: Auto-setup adiciona a infraestrutura automaticamente
- 🛡️ **Zero conflitos**: Scripts usam prefixo `infra:*`, não interferem com existentes
- 💾 **Preserva dados**: Mantém configurações do `.env` atual
- 🔄 **Reversível**: Fácil de remover se não quiser mais

## 🚀 Método Recomendado: Auto-Setup

### Para qualquer projeto existente

```bash
# Na raiz do seu projeto
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

**✅ O que acontece automaticamente:**

- Adiciona ~20 scripts `infra:*` ao `package.json`
- Cria pasta `.infra/` com helpers (ignorada pelo Git)
- Atualiza `.gitignore` para ignorar arquivos da infraestrutura
- **Preserva todos os scripts existentes**

### Configurar infraestrutura

```bash
npm run infra:setup
```

**✅ O que acontece:**

- Detecta configurações existentes no `.env`
- **Preserva credenciais existentes**
- Detecta porta disponível automaticamente
- Cria infraestrutura isolada

## 📋 Projetos Típicos da ANPD

### Next.js + Prisma (Ex: @anpdgovbr/backlog-dim)

**Antes** (seu `package.json` atual):

```json
{
  "scripts": {
    "dev": "npm run build-routes && next dev --turbopack",
    "build": "npx prisma generate && next build",
    "prisma:studio": "npx prisma studio",
    "prisma:migrate": "npx prisma migrate dev"
  }
}
```

**Depois** (automaticamente adicionado pelo auto-setup):

```json
{
  "scripts": {
    "dev": "npm run build-routes && next dev --turbopack",
    "build": "npx prisma generate && next build",
    "prisma:studio": "npx prisma studio",
    "prisma:migrate": "npx prisma migrate dev",

    // ✅ Novos scripts adicionados (sem conflitos)
    "infra:setup": "node .infra/setup-cross-platform.js",
    "infra:up": "node .infra/docker-helper.js up",
    "infra:down": "node .infra/docker-helper.js down",
    "infra:db:init": "node .infra/db-helper.js setup"
    // ... mais ~15 scripts
  }
}
```

### NestJS + TypeORM

**Integração opcional no script de desenvolvimento:**

```json
{
  "scripts": {
    "start:dev": "npm run infra:db:init && nest start --watch"
  }
}
```

### Node.js/Express

**Integração opcional:**

```json
{
  "scripts": {
    "dev": "npm run infra:up && nodemon src/server.js"
  }
}
```

## 🔄 Fluxo de Trabalho

### Primeira vez (setup)

```bash
npm run infra:setup
```

### Desenvolvimento diário

**Opção 1 - Manual (recomendado inicialmente):**

```bash
npm run infra:up    # Subir banco quando necessário
npm run dev         # Seu comando normal
```

**Opção 2 - Automático (quando se sentir confortável):**

```bash
# Modificar script dev para incluir:
"dev": "npm run infra:db:init && next dev"
# Assim o banco sobe automaticamente
```

### Uso paralelo

Você pode usar **ambos os sistemas**:

```bash
# Comandos da infraestrutura
npm run infra:up && npm run prisma:studio

# Ou comandos nativos
npm run prisma:studio  # (depois de npm run infra:up)
```

## 📁 Estrutura Criada

Após o auto-setup e configuração:

```
meu-projeto/
├── package.json          # ✅ Scripts infra:* adicionados
├── .env                  # ✅ Atualizado com DATABASE_URL
├── .gitignore           # ✅ Ignora .infra/ e infra-db/
├── .infra/              # � Scripts auxiliares (não versionado)
│   ├── setup-cross-platform.js
│   ├── docker-helper.js
│   ├── db-helper.js
│   └── port-config.json # 💾 Porta salva automaticamente
├── infra-db/            # 🐳 PostgreSQL isolado (não versionado)
│   ├── docker-compose.yml
│   └── .env
└── src/                 # 📂 Seu código (inalterado)
    ├── components/
    └── pages/
```

## 🎮 Comandos Adicionados

### Scripts de infraestrutura

```bash
npm run infra:setup         # Configurar infraestrutura
npm run infra:setup:manual  # Configuração manual
npm run infra:setup:force   # Reconfigurar do zero
npm run infra:up            # Subir PostgreSQL
npm run infra:down          # Parar PostgreSQL
npm run infra:logs          # Ver logs
npm run infra:status        # Status dos containers
npm run infra:psql          # Conectar ao banco
```

### Scripts de banco

```bash
npm run infra:db:init       # Setup completo (up + migrate + seed)
npm run infra:db:fresh      # Reset + migrate + seed
npm run infra:db:migrate    # Apenas migrações
npm run infra:db:seed       # Apenas seed
npm run infra:db:studio     # Prisma Studio (se detectado)
```

### Scripts de manutenção

```bash
npm run infra:fix           # Corrigir problemas automaticamente
npm run infra:update        # Atualizar scripts
npm run infra:clean         # Limpar tudo (remove infra-db/)
```

## 🌟 Vantagens da Integração

### ✅ **Sem Conflitos**

- Prefixo `infra:*` não interfere com scripts existentes
- Seus comandos atuais funcionam exatamente como antes
- Pode usar os dois sistemas em paralelo

### ✅ **Flexibilidade Total**

```bash
# Use comandos nativos quando quiser
npm run prisma:studio
npm run next:dev

# Use comandos da infraestrutura quando for conveniente
npm run infra:db:init && npm run prisma:studio
```

### ✅ **Isolamento Completo**

- PostgreSQL roda em container isolado
- Não interfere com instalações locais
- Cada projeto tem sua própria porta e credenciais

### ✅ **Cross-Platform**

- Funciona em Windows, macOS, Linux
- Mesmo comportamento para toda equipe
- Sem dependências específicas do sistema

## 🎯 Casos de Uso Específicos

### Novo desenvolvedor na equipe

```bash
git clone projeto-existente
npm install
npm run infra:setup  # Configura automaticamente
npm run dev          # Funciona imediatamente
```

### Desenvolvimento solo

```bash
npm run infra:up     # Uma vez por sessão
npm run dev          # Desenvolvimento normal
```

### Onboarding de estagiário

```bash
# Apenas explicar 2 comandos:
npm run infra:up     # "Liga o banco"
npm run dev          # "Liga o projeto"
```

### CI/CD

```bash
npm run infra:setup:ci  # Setup automático sem interação
npm run test            # Testes com banco funcionando
```

## 🔄 Remoção (Se Não Quiser Mais)

Para remover completamente a infraestrutura:

```bash
# 1. Parar containers
npm run infra:down

# 2. Limpar arquivos
npm run infra:clean

# 3. Remover scripts (opcional)
# Edite package.json e remova linhas que começam com "infra:"

# 4. Limpar .gitignore (opcional)
# Remover linhas: .infra/ e infra-db/
```

## 🚨 Troubleshooting Rápido

### "Scripts não encontrados"

```bash
# Executar auto-setup novamente
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

### "Port already in use"

```bash
# Forçar nova porta
npm run infra:setup:force
```

### "Docker não encontrado"

```bash
# Instalar Docker Desktop e iniciar
docker --version  # Deve mostrar versão
```

## 💡 Dicas de Boas Práticas

### Para equipes

1. Executar auto-setup no README do projeto
2. Documentar que `npm run infra:up` é necessário
3. Incluir no onboarding

### Para CI/CD

1. Usar `npm run infra:setup:ci` nos pipelines
2. Adicionar como step antes dos testes
3. Usar flags `--verbose` para debug

### Para desenvolvimento

1. Manter comandos nativos como backup
2. Usar `infra:db:init` para setup completo
3. Usar `infra:fix` quando algo quebrar

## 📞 Próximos Passos

Após integrar com sucesso:

1. **Comandos básicos**: Leia [`comandos.md`](comandos.md) para dominar a ferramenta
2. **Múltiplos projetos**: Veja [`gerenciamento-portas.md`](gerenciamento-portas.md)
3. **Problemas**: Consulte [`solucao-problemas.md`](solucao-problemas.md)
4. **CI/CD**: Configure com [`ci-cd.md`](ci-cd.md)

---

**� Resumo**: Um comando (`auto-setup`) + um comando (`infra:setup`) = PostgreSQL funcionando no seu projeto existente sem quebrar nada!\*\*
