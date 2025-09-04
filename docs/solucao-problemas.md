# 🛠️ Solução de Problemas - Troubleshooting Completo

> **Objetivo**: Resolver qualquer problema relacionado à infraestrutura PostgreSQL com soluções práticas e testadas.

## � Problemas Mais Comuns

### 1. "Port already in use" / "Porta já está em uso"

**Sintoma**: Erro ao subir o PostgreSQL

```bash
Error starting userland proxy: listen tcp 0.0.0.0:5432: bind: address already in use
```

**🔧 Solução Rápida:**

```bash
# Forçar nova detecção de porta
npm run infra:setup:force
```

**🔍 Diagnóstico Completo:**

```bash
# Ver que portas PostgreSQL estão em uso
npm run infra:debug

# Ver containers Docker ativos
docker ps --filter "name=postgres"

# Ver processos usando porta 5432
# Linux/macOS
sudo lsof -i :5432
# Windows
netstat -ano | findstr :5432
```

**💡 Soluções Alternativas:**

```bash
# Opção 1: Parar outros PostgreSQL
docker stop $(docker ps -q --filter "name=postgres")

# Opção 2: Usar porta específica
npm run infra:setup:manual  # Escolher porta manualmente

# Opção 3: Limpar tudo e reconfigurar
npm run infra:clean && npm run infra:setup
```

### 2. "Docker not found" / "Docker não encontrado"

**Sintoma**:

```bash
docker: command not found
```

**🔧 Solução por Plataforma:**

**Windows:**

```bash
# 1. Baixar Docker Desktop: https://docker.com/products/docker-desktop
# 2. Instalar e reiniciar
# 3. Verificar: docker --version
```

**macOS:**

```bash
# Opção 1: Docker Desktop
# 1. Baixar: https://docker.com/products/docker-desktop
# 2. Instalar via drag-and-drop

# Opção 2: Homebrew
brew install docker docker-compose
```

**Linux (Ubuntu/Debian):**

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Logout/login para aplicar
newgrp docker

# Verificar
docker --version
```

### 3. "Permission denied" / "Permissão negada"

**Sintoma (Linux/macOS):**

```bash
permission denied while trying to connect to the Docker daemon socket
```

**🔧 Solução:**

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar imediatamente (ou fazer logout/login)
newgrp docker

# Testar
docker ps
```

**Sintoma (Windows - scripts):**

```bash
execution of scripts is disabled on this system
```

**🔧 Solução:**

```bash
# PowerShell como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou usar cmd/Git Bash em vez do PowerShell
```

### 4. "Authentication failed" / "Falha de autenticação"

**Sintoma**: Prisma/aplicação não consegue conectar

```bash
P1001: Can't reach database server at `localhost:5432`
```

**🔧 Solução Automática:**

```bash
npm run infra:fix  # Corrige credenciais automaticamente
```

**🔍 Diagnóstico Manual:**

```bash
# 1. Verificar se o banco está rodando
npm run infra:status

# 2. Testar conexão direta
npm run infra:psql

# 3. Verificar credenciais no .env
cat .env | grep -E "(DATABASE_URL|POSTGRES_)"

# 4. Ver logs do PostgreSQL
npm run infra:logs
```

**💡 Soluções por Causa:**

**Credenciais incorretas:**

```bash
# Regenerar credenciais
npm run infra:setup:force
```

**Banco não iniciou:**

```bash
# Restart completo
npm run infra:down && npm run infra:up
```

**Porta errada:**

```bash
# Verificar porta no docker-compose
cat infra-db/docker-compose.yml | grep ports
```

### 5. "Scripts não encontrados" / Scripts Missing

**Sintoma**:

```bash
npm ERR! missing script: infra:fix
```

**� Solução:**

```bash
# Atualização inteligente (adiciona scripts novos)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node
```

**💡 Se ainda não funcionar:**

```bash
# Setup completo novamente
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

### 6. Problemas com ES Modules

**Sintoma**:

```bash
Error [ERR_REQUIRE_ESM]: require() of ES modules is not supported
```

**🔧 Solução:**

```bash
# Para projetos com "type": "module" no package.json
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs
node temp-setup.cjs
rm temp-setup.cjs
```

### 7. Container não inicia

**Sintoma**: `docker-compose up` falha

```bash
ERROR: for postgres  Container "xxxxx" exited with code 1
```

**🔧 Diagnóstico:**

```bash
# Ver logs detalhados
npm run infra:logs

# Verificar recursos disponíveis
docker system df
docker system prune  # Remove containers/images não usados
```

**� Soluções Comuns:**

**Falta de espaço em disco:**

```bash
docker system prune -a  # Remove tudo não usado
```

**Volumes corrompidos:**

```bash
npm run infra:reset  # Remove volumes e recria
```

**Conflito de nomes:**

```bash
# Ver containers existentes
docker ps -a | grep postgres
docker rm $(docker ps -aq --filter "name=postgres")  # Remove antigos
```

## 🔍 Diagnóstico Avançado

### Verificação Completa do Sistema

```bash
# Script de diagnóstico completo
npm run infra:debug

# Ou manualmente:
echo "=== DOCKER ==="
docker --version
docker-compose --version
docker ps

echo "=== POSTGRESQL ==="
docker ps --filter "name=postgres"
netstat -an | grep 5432

echo "=== ARQUIVOS ==="
ls -la .infra/
ls -la infra-db/
cat .env | grep -E "(DATABASE|POSTGRES)"

echo "=== LOGS ==="
docker logs $(docker ps -q --filter "name=postgres") --tail 20
```

### Logs e Debugging

**Ver logs em tempo real:**

```bash
npm run infra:logs
```

**Logs com timestamps:**

```bash
docker-compose -f infra-db/docker-compose.yml logs -f -t postgres
```

**Debug de conexão:**

```bash
# Dentro do container
docker exec -it $(docker ps -q --filter "name=postgres") psql -U postgres -c "\l"

# Testar de fora
pg_isready -h localhost -p 5432
```

## 🚀 Reset Completo (Última Solução)

Se nada funcionou, reset completo:

```bash
# 1. Parar tudo
npm run infra:down 2>/dev/null || true
docker stop $(docker ps -q --filter "name=postgres") 2>/dev/null || true

# 2. Remover containers e volumes
docker rm $(docker ps -aq --filter "name=postgres") 2>/dev/null || true
docker volume rm $(docker volume ls -q | grep postgres) 2>/dev/null || true

# 3. Limpar configuração local
rm -rf .infra infra-db

# 4. Setup do zero
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
npm run infra:setup

# 5. Testar
npm run infra:up
npm run infra:psql
```

## 🆘 Problemas Específicos por Plataforma

### Windows

**Git Bash não funciona:**

```bash
# Usar PowerShell ou CMD
# Comandos curl no PowerShell:
Invoke-WebRequest -Uri "https://..." -OutFile "temp.js"
node temp.js
```

**Paths com espaços:**

```bash
# Usar aspas
cd "C:\Users\Nome Com Espaço\projeto"
```

### macOS

**M1/M2 (Apple Silicon):**

```bash
# Usar imagens nativas
export DOCKER_DEFAULT_PLATFORM=linux/arm64
npm run infra:setup
```

### Linux

**SELinux/AppArmor:**

```bash
# Temporariamente desabilitar se necessário
sudo setenforce 0  # SELinux
```

## 📞 Quando Pedir Ajuda

Se chegou até aqui e ainda não resolveu:

1. **Colete informações:**

```bash
# Execute e cole a saída completa
npm run infra:debug

# Sistema operacional
uname -a  # Linux/macOS
systeminfo | findstr /B /C:"OS"  # Windows

# Versões
node --version
npm --version
docker --version
docker-compose --version
```

2. **Abra issue no GitHub:**

   - [GitHub Issues](https://github.com/anpdgovbr/docker-infra-pg/issues)
   - Cole as informações coletadas
   - Descreva o que estava tentando fazer
   - Inclua mensagens de erro completas

3. **Para dúvidas gerais:**
   - [GitHub Discussions](https://github.com/anpdgovbr/docker-infra-pg/discussions)

---

**💡 Dica**: 90% dos problemas se resolvem com `npm run infra:setup:force` seguido de `npm run infra:up`. Tente isso primeiro!
