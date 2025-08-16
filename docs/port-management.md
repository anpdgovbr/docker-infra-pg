# 🔌 Gerenciamento Inteligente de Portas + Isolamento de Stacks

## 🎯 Dois Problemas Resolvidos

### 1. Conflito de Portas

Quando você tem múltiplos projetos na mesma VM usando PostgreSQL, todos tentavam usar a porta `5432`:

```bash
❌ ANTES:
Projeto A: localhost:5432 ✅
Projeto B: localhost:5432 ❌ ERRO: Port already in use
Projeto C: localhost:5432 ❌ ERRO: Port already in use
```

```bash
✅ AGORA (Detecção Automática):
Projeto A: localhost:5432 ✅
Projeto B: localhost:5433 ✅ (detectado automaticamente)
Projeto C: localhost:5434 ✅ (detectado automaticamente)
```

### 2. Conflito de Stacks Docker

Mesmo com portas diferentes, projetos se sobrepunham porque usavam a mesma stack `infra-db`:

```bash
❌ ANTES (Stack Compartilhada):
cd projeto-a && npm run infra:up  # ✅ Funcionava
cd projeto-b && npm run infra:up  # ✅ Funcionava, mas parava projeto-a
cd projeto-a && npm run infra:up  # ✅ Funcionava, mas parava projeto-b
```

```bash
✅ AGORA (Stacks Isoladas):
cd projeto-a && npm run infra:up  # ✅ Stack: projeto-a-stack
cd projeto-b && npm run infra:up  # ✅ Stack: projeto-b-stack (projeto-a continua funcionando!)
cd projeto-c && npm run infra:up  # ✅ Stack: projeto-c-stack (todos funcionam juntos!)
```

## 🤖 Como Funciona

### 1. **Detecção Automática**

O sistema analisa:

- ✅ **Containers Docker** ativos (PostgreSQL)
- ✅ **Arquivos `.env`** de outros projetos ANPD
- ✅ **Arquivos `docker-compose.yml`** existentes
- ✅ **Portas realmente disponíveis** no sistema

### 2. **Configuração Persistente**

```bash
.infra/port-config.json
{
  "port": 5433,
  "project": "backlog-dim",
  "createdAt": "2025-08-11T15:30:00.000Z",
  "updatedAt": "2025-08-11T15:30:00.000Z"
}
```

### 3. **Containers Isolados**

```yaml
# docker-compose.yml gerado automaticamente
services:
  postgres:
    container_name: backlog_dim-postgres # Nome único
    ports:
      - '5433:5432' # Porta inteligente
    networks:
      - backlog_dim_network # Rede isolada
```

## 🚀 Usando o Sistema

### Setup Inicial (Primeira Vez)

```bash
# Detecta automaticamente a melhor porta
npm run infra:setup
```

**Saída esperada:**

```bash
🔍 Detectando porta disponível...
📊 Portas PostgreSQL já em uso: 5432
🎯 Porta selecionada: 5433
💾 Configuração de porta salva: 5433
```

### Modo Manual (Controle Total)

```bash
# Escolher porta manualmente
npm run infra:setup:manual
```

**Interativo:**

```bash
🔧 Modo manual ativado - Configure as variáveis do banco:
📁 Nome do banco [backlog_dim_dev]:
👤 Usuário do banco [dev_user]:
🔒 Senha do banco [abc123XYZ789]:
🔌 Porta do banco [5433]: 5435    # ← Você pode alterar
```

### Forçar Nova Porta

```bash
# Regenera tudo incluindo nova porta
npm run infra:setup:force
```

## 🔧 Comandos do Port Manager

### Ver Portas em Uso

```bash
# Baixa e executa análise
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/port-manager.js -o temp-port.js
node temp-port.js --show-used
rm temp-port.js
```

**Saída:**

```bash
🔍 Analisando portas PostgreSQL em uso...
📊 Portas em uso: 5432, 5433, 5435
```

### Forçar Nova Porta

```bash
# Força detecção de nova porta (ignora configuração salva)
node temp-port.js --force
```

## 🏗️ Cenários Comuns

### **Cenário 1: Primeira Instalação**

- ✅ Porta 5432 livre → Usa 5432
- ✅ Salva configuração
- ✅ Próximas execuções: usa sempre 5432

### **Cenário 2: Segunda Instalação (Mesma VM)**

- ✅ Detecta 5432 em uso → Usa 5433
- ✅ Salva configuração
- ✅ Próximas execuções: usa sempre 5433

### **Cenário 3: Servidor com Muitos Projetos**

- ✅ Detecta 5432, 5433, 5434 em uso → Usa 5435
- ✅ Cada projeto mantém sua porta
- ✅ Sem conflitos, isolamento total

### **Cenário 4: Mudança de VM**

- ✅ Configuração salva em `.infra/port-config.json`
- ✅ Git ignora `.infra/` (não vaza configuração local)
- ✅ Nova VM: detecta automaticamente nova porta

## 📊 Estratégia de Busca

O sistema busca portas na seguinte ordem:

1. **5432** (padrão PostgreSQL)
2. **5433, 5434, 5435...** (sequencial)
3. **Testa disponibilidade real** (bind na porta)
4. **Para na primeira disponível**

## 🔐 Integração com Credenciais

### Arquivo `.env` Automatizado

```bash
# Gerado automaticamente com porta correta
DATABASE_URL="postgresql://user:pass@localhost:5433/db_name"
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
```

### Sincronização com Projeto

- ✅ **`.env` do projeto** - atualizado automaticamente
- ✅ **`infra-db/.env`** - configuração da infraestrutura
- ✅ **`docker-compose.yml`** - com porta dinâmica

## 🧪 Testando

### Verificar Container

```bash
# Ver container rodando com porta personalizada
docker ps --filter "name=postgres"
```

**Saída:**

```bash
CONTAINER ID   IMAGE         PORTS                    NAMES
abc123def456   postgres:15   0.0.0.0:5433->5432/tcp   backlog_dim-postgres
```

### Testar Conexão

```bash
# Testa se Prisma conecta na porta correta
npx prisma migrate dev
```

### Debug de Porta

```bash
# Verifica se porta está realmente em uso
npm run infra:debug
```

## ⚙️ Configuração Avançada

### Configurar Range de Portas

```javascript
// Em port-manager.js (personalização)
async function findAvailablePort(startPort = 5432) {
  let testPort = startPort
  const maxAttempts = 100 // ← Altere aqui
  // ...
}
```

### Ignorar Projetos Específicos

```javascript
// Customize a busca por projetos existentes
const possiblePaths = [
  path.join(homeDir, 'anpdgovbr'), // ← Seus diretórios
  path.join(homeDir, 'projects') // ← de projetos
  // path.join(homeDir, 'outros')      // ← comentar para ignorar
]
```

## 🚨 Troubleshooting

### Problema: "Port already in use"

```bash
# 1. Verificar que portas estão sendo usadas
npm run infra:debug

# 2. Forçar nova detecção
npm run infra:setup:force

# 3. Verificar containers Docker
docker ps --filter "name=postgres"
```

### Problema: "Não consegue salvar porta"

```bash
# Verificar permissões da pasta .infra
ls -la .infra/

# Recriar pasta se necessário
rm -rf .infra && npm run infra:setup
```

### Problema: "Sempre usa porta 5432"

```bash
# Verificar se port-manager.js existe
ls .infra/port-manager.js

# Re-baixar com smart update
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node
```

## 🎉 Benefícios

- ✅ **Zero Configuração Manual** - Funciona automaticamente
- ✅ **Múltiplos Projetos** - Sem conflitos na mesma VM
- ✅ **Configuração Persistente** - Lembra da porta escolhida
- ✅ **Isolamento Total** - Containers, redes e volumes únicos
- ✅ **Cross-Platform** - Windows, macOS, Linux
- ✅ **CI/CD Ready** - Funciona em pipelines automatizados

## 🔐 Sobre Exposição de Segredos nos Logs

Por padrão a infraestrutura oculta senhas em URLs (ex.: DATABASE_URL) nos logs para evitar vazamento acidental. Para ver a URL completa durante diagnóstico, use `--show-secrets` ou a variável de ambiente `SHOW_SECRETS=1`.

Para obter pilhas completas em erros, adicione `--verbose` ou `VERBOSE=1`.
