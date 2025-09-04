# 🔌 Gerenciamento Inteligente de Portas

> **Objetivo**: Entender como funciona a detecção automática de portas e o isolamento completo entre projetos.

## 🎯 Problema Resolvido

### Antes: Conflitos Constantes

```bash
❌ PROBLEMA:
Projeto A: localhost:5432 ✅
Projeto B: localhost:5432 ❌ ERRO: Port already in use
Projeto C: localhost:5432 ❌ ERRO: Port already in use
```

### Agora: Detecção Automática

```bash
✅ SOLUÇÃO:
Projeto A: localhost:5432 ✅
Projeto B: localhost:5433 ✅ (auto-detectado)
Projeto C: localhost:5434 ✅ (auto-detectado)
```

## 🤖 Como Funciona o Sistema

### 1. Detecção Inteligente

O sistema analisa **múltiplas fontes** para encontrar a porta ideal:

```bash
🔍 Verificações automáticas:
✅ Containers Docker ativos com PostgreSQL
✅ Processos do sistema usando portas 5432-5450
✅ Arquivos .env de outros projetos ANPD
✅ Configurações salvas anteriormente
```

### 2. Configuração Persistente

```bash
# Arquivo .infra/port-config.json (criado automaticamente)
{
  "port": 5433,
  "project": "backlog-dim",
  "createdAt": "2025-09-04T12:30:00.000Z",
  "database": "backlog_dim_dev"
}
```

### 3. Isolamento Completo

Cada projeto recebe:

- **Container único**: `projeto-postgres`
- **Rede isolada**: `projeto_network`
- **Volume exclusivo**: `projeto_postgres_data`
- **Porta única**: detectada automaticamente

## 🚀 Exemplo Prático

### Cenário: 3 Projetos na Mesma VM

```bash
# 1. Primeiro projeto (backlog-dim)
cd ~/projetos/backlog-dim
npm run infra:setup

🔍 Detectando porta disponível...
🎯 Porta selecionada: 5432
💾 Configuração salva: 5432

# 2. Segundo projeto (controladores)
cd ~/projetos/controladores
npm run infra:setup

🔍 Detectando porta disponível...
📊 Portas PostgreSQL já em uso: 5432
🎯 Porta selecionada: 5433
💾 Configuração salva: 5433

# 3. Terceiro projeto (transparencia)
cd ~/projetos/transparencia
npm run infra:setup

🔍 Detectando porta disponível...
📊 Portas PostgreSQL já em uso: 5432, 5433
🎯 Porta selecionada: 5434
💾 Configuração salva: 5434
```

### Resultado Final

```bash
# Todos rodando simultaneamente:
docker ps --filter "name=postgres"

CONTAINER ID   IMAGE         PORTS                    NAMES
abc123def456   postgres:15   0.0.0.0:5432->5432/tcp   backlog_dim-postgres
789abc123def   postgres:15   0.0.0.0:5433->5432/tcp   controladores-postgres
456def789abc   postgres:15   0.0.0.0:5434->5432/tcp   transparencia-postgres
```

## ⚙️ Estratégia de Busca de Portas

### Ordem de Tentativas

1. **5432** (porta padrão PostgreSQL)
2. **5433, 5434, 5435...** (sequencial)
3. **Teste real**: faz bind na porta para confirmar disponibilidade
4. **Para na primeira livre**: otimizado para velocidade

### Algoritmo Inteligente

```javascript
// Pseudocódigo simplificado
async function findAvailablePort() {
  const usedPorts = await getUsedPostgrePorts()

  for (let port = 5432; port <= 5500; port++) {
    if (!usedPorts.includes(port)) {
      if (await testPortAvailable(port)) {
        return port
      }
    }
  }
}
```

## � Configuração Gerada

### Docker Compose Personalizado

```yaml
# infra-db/docker-compose.yml (gerado automaticamente)
services:
  postgres:
    image: postgres:15
    container_name: backlog_dim-postgres # ← Nome único por projeto
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-backlog_dim_dev}
      POSTGRES_USER: ${POSTGRES_USER:-dev_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - '5433:5432' # ← Porta detectada inteligentemente
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backlog_dim_network # ← Rede isolada

volumes:
  postgres_data:
    name: backlog_dim_postgres_data # ← Volume único

networks:
  backlog_dim_network: # ← Rede única
    driver: bridge
    name: backlog_dim_network
```

### Arquivo .env Sincronizado

```bash
# .env do projeto (atualizado automaticamente)
DATABASE_URL="postgresql://dev_user:ABC123xyz789@localhost:5433/backlog_dim_dev"
POSTGRES_HOST=localhost
POSTGRES_PORT=5433                          # ← Porta detectada
POSTGRES_DB=backlog_dim_dev
POSTGRES_USER=dev_user
POSTGRES_PASSWORD=ABC123xyz789
```

## 🎮 Comandos de Controle

### Ver Portas em Uso

```bash
npm run infra:debug
# Ou manualmente:
docker ps --filter "name=postgres" --format "table {{.Names}}\t{{.Ports}}"
```

### Forçar Nova Porta

```bash
# Regenera tudo incluindo nova detecção de porta
npm run infra:setup:force
```

### Escolher Porta Específica

```bash
npm run infra:setup:manual
# Permite escolher porta manualmente (ex: 5435)
```

## 🚀 Casos de Uso

### Desenvolvimento Local

```bash
# Primeira vez em qualquer projeto
npm run infra:setup
🎯 Porta selecionada: 5432

# Segunda vez (outro projeto, mesma máquina)
npm run infra:setup
🎯 Porta selecionada: 5433 (5432 detectada em uso)
```

### Servidor de Desenvolvimento (Múltiplas Pessoas)

```bash
# Dev A
cd ~/projetos/projeto-a && npm run infra:setup
# → 5432

# Dev B
cd ~/projetos/projeto-b && npm run infra:setup
# → 5433

# Dev C
cd ~/projetos/projeto-c && npm run infra:setup
# → 5434
```

### CI/CD (Pipelines Paralelos)

```bash
# Job 1
npm run infra:setup:ci
# → 5432

# Job 2 (simultâneo)
npm run infra:setup:ci
# → 5433
```

## 🔐 Isolamento e Segurança

### Isolamento de Dados

- **Volumes únicos**: Cada projeto tem seu volume PostgreSQL
- **Bancos separados**: Dados nunca se misturam
- **Credenciais únicas**: Senhas diferentes por projeto

### Isolamento de Rede

- **Redes Docker isoladas**: Projetos não se "veem"
- **Containers únicos**: Nomes únicos evitam conflitos
- **Portas únicas**: Acesso externo isolado

### Exemplo de Isolamento

```bash
# Projeto A
Container: projeto_a-postgres
Network: projeto_a_network
Volume: projeto_a_postgres_data
Port: localhost:5432

# Projeto B (totalmente isolado)
Container: projeto_b-postgres
Network: projeto_b_network
Volume: projeto_b_postgres_data
Port: localhost:5433
```

## 🔍 Diagnóstico e Monitoramento

### Verificar Configuração Atual

```bash
# Ver porta salva
cat .infra/port-config.json

# Ver containers rodando
docker ps --filter "name=postgres"

# Ver redes criadas
docker network ls | grep -E "(projeto|backlog|control)"

# Ver volumes
docker volume ls | grep postgres
```

### Debug Completo

```bash
npm run infra:debug

# Saída típica:
🔍 Diagnóstico da Infraestrutura PostgreSQL
✅ Docker: 24.0.6
✅ Compose: v2.21.0
📊 Porta configurada: 5433
🐳 Container: backlog_dim-postgres (running)
🌐 Rede: backlog_dim_network
💾 Volume: backlog_dim_postgres_data
📋 Portas em uso: 5432, 5433
```

## ⚡ Comandos Avançados

### Resetar Configuração de Porta

```bash
# Remove configuração salva e detecta nova porta
rm .infra/port-config.json
npm run infra:setup
```

### Migrar para Nova Porta

```bash
# Parar containers atuais
npm run infra:down

# Forçar nova configuração
npm run infra:setup:force

# Subir com nova porta
npm run infra:up
```

### Ver Histórico de Portas

```bash
# Verificar logs de setup anteriores
grep -r "Porta selecionada" .infra/ 2>/dev/null || echo "Nenhum log encontrado"
```

## 🚨 Troubleshooting de Portas

### "Port already in use" mesmo com detecção

```bash
# 1. Ver processos usando a porta
sudo lsof -i :5433  # Linux/macOS
netstat -ano | findstr :5433  # Windows

# 2. Forçar nova porta
npm run infra:setup:force

# 3. Usar porta específica
npm run infra:setup:manual  # Escolher porta manualmente
```

### "Não consegue detectar portas em uso"

```bash
# 1. Verificar permissões Docker
docker ps  # Deve funcionar sem sudo

# 2. Verificar se port-manager existe
ls .infra/port-manager.*

# 3. Re-baixar helpers
npm run infra:update
```

### "Containers não param corretamente"

```bash
# 1. Parar forçadamente
docker stop $(docker ps -q --filter "name=postgres")

# 2. Remover containers órfãos
docker container prune

# 3. Limpar redes órfãs
docker network prune
```

## 💡 Boas Práticas

### Para Desenvolvimento Solo

- Use detecção automática (padrão)
- Mantenha configuração salva (não delete port-config.json)
- Use `npm run infra:status` para monitorar

### Para Equipes

- Documente portas em uso no README
- Use `infra:debug` para ajudar colegas
- Configure monitoramento com `docker ps`

### Para Servidores Compartilhados

- Use range de portas específico (ex: 5440-5450)
- Monitore uso de recursos com `docker system df`
- Configure alertas para containers órfãos

---

**🎯 Resumo**: O sistema detecta automaticamente a melhor porta, isola completamente cada projeto e lembra da configuração para sempre. Zero conflitos, zero configuração manual!\*\*
