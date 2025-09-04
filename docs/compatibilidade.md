# 🌍 Compatibilidade Cross-Platform

> **Objetivo**: Garantir que a infraestrutura funcione perfeitamente em Windows, macOS e Linux, com suporte completo a projetos ES Modules e CommonJS.

## ✅ Plataformas Suportadas

| Plataforma        | Terminal   | Status | Notas                  |
| ----------------- | ---------- | ------ | ---------------------- |
| **Windows 11/10** | PowerShell | ✅     | Suporte nativo         |
| **Windows 11/10** | CMD        | ✅     | Suporte nativo         |
| **Windows 11/10** | Git Bash   | ✅     | Recomendado para devs  |
| **macOS**         | Terminal   | ✅     | Suporte nativo         |
| **macOS**         | iTerm2     | ✅     | Funcionamento perfeito |
| **Linux Ubuntu**  | bash/zsh   | ✅     | Suporte nativo         |
| **Linux CentOS**  | bash       | ✅     | Suporte nativo         |
| **Alpine Linux**  | ash        | ✅     | Para containers        |

## 🚀 Por que Cross-Platform?

### Problemas dos Scripts Bash Tradicionais

- ❌ `curl | bash` não funciona no PowerShell
- ❌ `wget` não existe no Windows/macOS por padrão
- ❌ `chmod +x` não existe no Windows
- ❌ `rm -rf` tem comportamento diferente
- ❌ Paths com `\` vs `/` causam problemas

### Solução: Helpers Node.js

- ✅ **Node.js está em todo lugar**: Já instalado em projetos web
- ✅ **Comportamento idêntico**: Mesmo código em todas as plataformas
- ✅ **Sem dependências**: Não precisa instalar ferramentas extras
- ✅ **Tratamento robusto**: Erros claros e informativos

## 🔧 Arquitetura dos Helpers

### 3 Helpers Principais

#### 1. `setup-cross-platform.js` - Configuração da Infraestrutura

```bash
# Funciona em qualquer plataforma
node .infra/setup-cross-platform.js

# Com opções
node .infra/setup-cross-platform.js --force --auto
```

**Funcionalidades:**

- ✅ Detecção automática de plataforma
- ✅ Geração de credenciais seguras
- ✅ Detecção inteligente de portas
- ✅ Sincronização do .env

#### 2. `docker-helper.js` - Comandos Docker

```bash
# Comandos básicos
node .infra/docker-helper.js up
node .infra/docker-helper.js down
node .infra/docker-helper.js logs

# Comandos avançados
node .infra/docker-helper.js psql
node .infra/docker-helper.js backup
```

**Funcionalidades:**

- ✅ Comandos Docker unificados
- ✅ Sleep nativo do Node.js
- ✅ Verificação de pré-requisitos
- ✅ Logs coloridos

#### 3. `db-helper.js` - Comandos de Banco

```bash
# Setup completo
node .infra/db-helper.js setup

# Comandos específicos
node .infra/db-helper.js migrate
node .infra/db-helper.js seed
```

**Funcionalidades:**

- ✅ Integração inteligente com Prisma
- ✅ Detecção de frameworks (Next.js, NestJS)
- ✅ Aguarda PostgreSQL ficar pronto
- ✅ Execução de migrations e seeds

## 🔍 Detecção Automática de Plataforma

### Windows

```javascript
// Detecção automática no helper
if (process.platform === 'win32') {
  // Usa PowerShell ou CMD nativo
  // Converte paths automaticamente
  // Trata comandos específicos do Windows
}
```

### macOS/Linux

```javascript
// Detecção automática no helper
if (process.platform === 'darwin' || process.platform === 'linux') {
  // Usa bash/zsh nativo
  // Preserva permissões Unix
  // Suporte total a comandos Unix
}
```

## 📦 Suporte a ES Modules vs CommonJS

### Problema Comum

```bash
Error [ERR_REQUIRE_ESM]: require() of ES modules is not supported
```

### Solução Automática

#### Para Projetos CommonJS (padrão)

````bash
## 🚀 Comandos de Setup

### **Quick-Setup (Método Recomendado)**
```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/quick-setup.js | node
````

### **Auto-Setup (Download Direto)**

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o setup.js && node setup.js && rm setup.js
```

> 💡 **Quick-setup é mais robusto** para execução via pipe em todos os ambientes (Windows, macOS, Linux).

````

#### Para Projetos ES Modules (`"type": "module"`)

```bash
# Windows (PowerShell/CMD)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && del temp-setup.cjs

# macOS/Linux
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && rm temp-setup.cjs
````

### Detecção Automática no Auto-Setup

```javascript
// O auto-setup detecta automaticamente o tipo do projeto
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const isESModule = packageJson.type === 'module'

if (isESModule) {
  // Usa extensões .cjs para helpers
  // Adapta scripts npm automaticamente
} else {
  // Usa extensões .js normais
}
```

## 🛠️ Setup por Plataforma

### Windows

#### Usando PowerShell (Recomendado)

```powershell
# Auto-setup
curl -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js" | node

# Setup manual se necessário
curl -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js" -OutFile "temp-setup.js"
node temp-setup.js
Remove-Item temp-setup.js
```

#### Usando CMD

```cmd
REM Auto-setup
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node

REM Setup manual se necessário
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.js
node temp-setup.js
del temp-setup.js
```

#### Usando Git Bash

```bash
# Funciona como Linux/macOS
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

### macOS

```bash
# Terminal ou iTerm2
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node

# Para projetos ES Module
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs
node temp-setup.cjs
rm temp-setup.cjs
```

### Linux (Ubuntu, CentOS, Alpine)

```bash
# Qualquer distribuição
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node

# Para projetos ES Module
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js -o temp-setup.cjs
node temp-setup.cjs
rm temp-setup.cjs
```

## 🐛 Troubleshooting por Plataforma

### Windows

#### "Execution of scripts is disabled"

```powershell
# PowerShell como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou usar CMD/Git Bash
```

#### "curl not found" (Versões antigas)

```powershell
# Usar Invoke-WebRequest
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js" -OutFile "temp-setup.js"
node temp-setup.js
Remove-Item temp-setup.js
```

#### "Docker não encontrado"

```bash
# 1. Baixar Docker Desktop: https://docker.com/products/docker-desktop
# 2. Instalar e reiniciar
# 3. Iniciar Docker Desktop
# 4. Testar: docker --version
```

### macOS

#### "Permission denied" no Docker

```bash
# Geralmente não precisa, mas se acontecer:
sudo chmod 666 /var/run/docker.sock

# Ou adicionar usuário ao grupo docker (se instalou via Homebrew)
sudo dscl . -append /Groups/docker GroupMembership $(whoami)
```

#### Apple Silicon (M1/M2)

```bash
# Usar imagens nativas se necessário
export DOCKER_DEFAULT_PLATFORM=linux/arm64

# Na maioria dos casos não precisa, PostgreSQL tem imagem nativa
npm run infra:setup
```

### Linux

#### "Docker daemon not running"

```bash
# Ubuntu/Debian
sudo systemctl start docker
sudo systemctl enable docker

# CentOS/RHEL
sudo systemctl start docker
sudo systemctl enable docker
```

#### "Permission denied" Docker

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar sem logout
newgrp docker

# Testar
docker ps
```

#### "Node.js não encontrado"

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm

# Alpine
apk add nodejs npm
```

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente Cross-Platform

#### Windows (PowerShell)

```powershell
$env:SHOW_SECRETS = "1"
$env:VERBOSE = "1"
npm run infra:setup
```

#### Windows (CMD)

```cmd
set SHOW_SECRETS=1
set VERBOSE=1
npm run infra:setup
```

#### macOS/Linux

```bash
export SHOW_SECRETS=1
export VERBOSE=1
npm run infra:setup
```

### Paths e Separadores

#### O problema

```javascript
// ❌ Problema: hardcoded separators
const configPath = '.infra/config.json' // Funciona
const configPath = '.infra\\config.json' // Só Windows

// ✅ Solução: Node.js path
const path = require('path')
const configPath = path.join('.infra', 'config.json') // Funciona em tudo
```

#### Nossa implementação

```javascript
// Todos os helpers usam:
const path = require('path')
const os = require('os')

// Paths sempre corretos
const infraDir = path.join(process.cwd(), '.infra')
const configFile = path.join(infraDir, 'port-config.json')
```

## 🚀 CI/CD Cross-Platform

### GitHub Actions

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup infrastructure
        run: npm run infra:setup:ci

      - name: Run tests
        run: npm test
```

### Comandos CI Universais

```bash
# Funcionam em qualquer plataforma de CI
npm run infra:setup:ci  # Modo não-interativo
npm run infra:up        # Subir infraestrutura
npm run infra:db:init   # Setup do banco
npm run test           # Seus testes
```

## 🎯 Compatibilidade com Ferramentas

### Gerenciadores de Pacote

- ✅ **npm**: Suporte nativo
- ✅ **yarn**: Suporte nativo
- ✅ **pnpm**: Funciona normalmente
- ✅ **bun**: Compatível

### Editores e IDEs

- ✅ **VS Code**: Funciona perfeitamente
- ✅ **WebStorm**: Suporte completo
- ✅ **Vim/Neovim**: Terminal nativo
- ✅ **Emacs**: Terminal nativo

### Ferramentas de Build

- ✅ **Next.js**: Integração nativa
- ✅ **Vite**: Funciona normalmente
- ✅ **Webpack**: Compatível
- ✅ **Rollup**: Compatível

## 📊 Matriz de Compatibilidade Completa

| Recurso                 | Windows | macOS | Linux | Notas                        |
| ----------------------- | ------- | ----- | ----- | ---------------------------- |
| **Auto-setup**          | ✅      | ✅    | ✅    | Funcionamento idêntico       |
| **Detecção de portas**  | ✅      | ✅    | ✅    | Usa Node.js nativo           |
| **ES Modules**          | ✅      | ✅    | ✅    | Detecção automática          |
| **CommonJS**            | ✅      | ✅    | ✅    | Suporte padrão               |
| **Docker Compose**      | ✅      | ✅    | ✅    | Requer Docker Desktop/Engine |
| **Scripts npm**         | ✅      | ✅    | ✅    | Funcionamento idêntico       |
| **Logs coloridos**      | ✅      | ✅    | ✅    | Terminal nativo              |
| **Mascaramento senhas** | ✅      | ✅    | ✅    | Segurança garantida          |

## 💡 Dicas de Boas Práticas

### Para Equipes Multi-Plataforma

1. **Use auto-setup**: Funciona igual em tudo
2. **Documente comandos essenciais**: `npm run infra:setup` e `npm run dev`
3. **Evite scripts de shell**: Use apenas scripts npm
4. **Configure CI matrix**: Teste em Windows, macOS e Linux

### Para Desenvolvimento

1. **Use terminal nativo**: PowerShell no Windows, Terminal no macOS/Linux
2. **Mantenha Node.js atualizado**: Versão 16+ recomendada
3. **Configure Docker corretamente**: Docker Desktop no Windows/macOS
4. **Use .gitignore padrão**: Ignora `.infra/` e `infra-db/`

### Para Debugging

1. **Use flags universais**: `--verbose` e `--show-secrets` funcionam em tudo
2. **Verifique logs**: `npm run infra:logs` em qualquer plataforma
3. **Teste diagnóstico**: `npm run infra:debug` funciona igual
4. **Use comandos padrão**: `npm run infra:status` para verificar

---

**🎯 Resumo**: A infraestrutura funciona de forma idêntica em Windows, macOS e Linux. Um comando funciona, funciona em tudo. Zero configuração específica por plataforma!\*\*

Depois execute:

```bash
npm install  # Baixa os helpers automaticamente
npm run infra:setup  # Configura a infraestrutura
```

### **Opção 2: Download Manual**

#### Windows PowerShell:

```powershell
mkdir .infra -Force
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js" -OutFile ".infra/setup-cross-platform.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js" -OutFile ".infra/docker-helper.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js" -OutFile ".infra/db-helper.js"
```

#### macOS/Linux:

```bash
mkdir -p .infra
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js
```

## 🔧 Detecção de Plataforma

Os helpers detectam automaticamente:

### **Windows:**

- Tenta usar **Git Bash** primeiro
- Se não tiver, usa **WSL**
- Se não tiver, mostra erro orientativo

### **macOS/Linux:**

- Usa **bash** nativo
- Funciona em qualquer terminal

## 🎨 Saída Colorida

Todos os helpers têm saída colorida:

- 🟢 **Verde**: Sucessos e confirmações
- 🔵 **Azul**: Informações e comandos sendo executados
- 🟡 **Amarelo**: Avisos e aguardando
- 🔴 **Vermelho**: Erros

## 📊 Compatibilidade Testada

| Plataforma   | Terminal   | Status |
| ------------ | ---------- | ------ |
| Windows 11   | PowerShell | ✅     |
| Windows 11   | CMD        | ✅     |
| Windows 11   | Git Bash   | ✅     |
| Windows 10   | PowerShell | ✅     |
| macOS        | Terminal   | ✅     |
| macOS        | iTerm2     | ✅     |
| Ubuntu       | bash       | ✅     |
| CentOS       | bash       | ✅     |
| Alpine Linux | ash        | ✅     |

## 🚀 Vantagens

### **Para Desenvolvedores:**

- ✅ Funciona em qualquer máquina sem configuração
- ✅ Não precisa instalar ferramentas extras
- ✅ Mensagens claras em português
- ✅ Tratamento inteligente de erros

### **Para Equipes:**

- ✅ Onboarding mais rápido
- ✅ Menos problemas de ambiente
- ✅ Scripts padronizados para todos
- ✅ Funciona em CI/CD de qualquer plataforma

### **Para CI/CD:**

- ✅ GitHub Actions (Ubuntu/Windows/macOS)
- ✅ GitLab CI (Docker/Shell)
- ✅ Azure DevOps
- ✅ Jenkins (qualquer agent)

## 🔍 Troubleshooting

### **Erro: "Bash não encontrado" no Windows**

**Solução 1 - Instalar Git Bash:**

1. Baixe Git for Windows: https://git-scm.com/download/win
2. Execute o instalador
3. Teste: `git --version`

**Solução 2 - Habilitar WSL:**

1. Abra PowerShell como Admin
2. Execute: `wsl --install`
3. Reinicie o sistema
4. Teste: `wsl --version`

### **Erro: "Docker not found"**

**Solução:**

1. Instale Docker Desktop: https://docker.com/
2. Inicie Docker Desktop
3. Teste: `docker --version`

### **Erro: "Permission denied" no macOS/Linux**

**Solução:**

```bash
chmod +x setup-cross-platform.js
chmod +x docker-helper.js
chmod +x db-helper.js
```

## 🧭 Notas Rápidas

- Se seu projeto usa ES Modules (`"type": "module"`), os helpers baixados tentam carregar versões compatíveis; quando necessário a recomendação é usar um arquivo temporário `.cjs` (ex.: `temp-setup.cjs`) e executar com `node temp-setup.cjs`.

- Logs: por padrão senhas são mascaradas; use `--show-secrets` ou `SHOW_SECRETS=1` para revelar durante diagnóstico. Use `--verbose` ou `VERBOSE=1` para ver pilhas completas.

---

**Agora você tem infraestrutura PostgreSQL que funciona em QUALQUER plataforma! 🎉**
