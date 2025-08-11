#!/usr/bin/env node

/**
 * Fix Credentials - Corrige credenciais do container PostgreSQL
 * Recria container com as credenciais corretas do projeto
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Lê variáveis de um arquivo .env
function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const vars = {}

    content.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/"/g, '').trim()
        vars[key.trim()] = value
      }
    })

    return vars
  } catch (error) {
    return null
  }
}

// Gera docker-compose.yml com credenciais corretas e porta inteligente
function generateDockerCompose(dbName, dbUser, dbPassword, dbPort = 5432) {
  // Função para sanitizar nomes Docker (não pode começar com underscore, hífen ou ponto)
  const sanitizeName = (name) => {
    return name
      .replace(/[^a-zA-Z0-9]/g, '_') // Substituir caracteres especiais por underscore
      .replace(/^[^a-zA-Z0-9]+/, '') // Remover underscores, hífens do início
      .replace(/^$/, 'project') // Se vazio, usar 'project'
      .toLowerCase() // Docker prefere lowercase
  }

  const projectName = sanitizeName(path.basename(process.cwd()))

  return `name: ${projectName}-stack

services:
  postgres:
    image: postgres:15
    container_name: ${projectName}_postgres
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-${dbName}}
      POSTGRES_USER: \${POSTGRES_USER:-${dbUser}}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-${dbPassword}}
    ports:
      - "${dbPort}:5432"
    volumes:
      - ${projectName}_postgres_data:/var/lib/postgresql/data
    networks:
      - ${projectName}_network

volumes:
  ${projectName}_postgres_data:
    name: ${projectName}_postgres_data

networks:
  ${projectName}_network:
    name: ${projectName}_network
    driver: bridge
`
}

// Obtém porta inteligente
async function getSmartPort() {
  try {
    // Tenta usar port manager local
    const portManagerPath = path.join('.infra', 'port-manager.js')
    if (fs.existsSync(portManagerPath)) {
      const portManager = require(path.resolve(portManagerPath))
      return await portManager.getSmartPort(false)
    }

    // Tenta usar versão existente no docker-compose.yml
    const dockerComposePath = path.join('infra-db', 'docker-compose.yml')
    if (fs.existsSync(dockerComposePath)) {
      const dockerContent = fs.readFileSync(dockerComposePath, 'utf8')
      const portMatch = dockerContent.match(/- "(\d+):5432"/)
      if (portMatch) {
        return parseInt(portMatch[1])
      }
    }

    // Usa porta padrão
    return 5432
  } catch (error) {
    log(
      `⚠️  Usando porta padrão 5432 (erro na detecção: ${error.message})`,
      'yellow'
    )
    return 5432
  }
}

async function main() {
  try {
    log('🔧 Corrigindo credenciais do container PostgreSQL...', 'blue')

    // Verifica se é projeto Node.js
    if (!fs.existsSync('package.json')) {
      log(
        '❌ Este não é um projeto Node.js (package.json não encontrado)',
        'red'
      )
      process.exit(1)
    }

    // Verifica arquivos
    const projectEnvPath = path.join(process.cwd(), '.env')
    const infraDbPath = path.join(process.cwd(), 'infra-db')
    const dockerComposePath = path.join(infraDbPath, 'docker-compose.yml')
    const infraEnvPath = path.join(infraDbPath, '.env')

    if (!fs.existsSync(projectEnvPath)) {
      log('❌ Arquivo .env do projeto não encontrado', 'red')
      process.exit(1)
    }

    if (!fs.existsSync(infraDbPath)) {
      log('❌ Pasta infra-db/ não encontrada', 'red')
      process.exit(1)
    }

    // Lê credenciais do projeto
    const projectEnv = readEnvFile(projectEnvPath)
    if (!projectEnv) {
      log('❌ Não foi possível ler .env do projeto', 'red')
      process.exit(1)
    }

    // Extrai credenciais da DATABASE_URL se existir
    let dbName, dbUser, dbPassword

    if (projectEnv.DATABASE_URL) {
      const dbUrlMatch = projectEnv.DATABASE_URL.match(
        /postgresql:\/\/([^:]+):([^@]+)@[^\/]+\/([^?]+)/
      )
      if (dbUrlMatch) {
        dbUser = dbUrlMatch[1]
        dbPassword = dbUrlMatch[2]
        dbName = dbUrlMatch[3]
        log('📄 Credenciais extraídas da DATABASE_URL:', 'blue')
      }
    }

    // Fallback para variáveis individuais
    if (!dbName || !dbUser || !dbPassword) {
      dbName =
        projectEnv.POSTGRES_DB ||
        `${path
          .basename(process.cwd())
          .replace(/[@\/]/g, '')
          .replace(/-/g, '_')}_dev`
      dbUser = projectEnv.POSTGRES_USER || 'dev_user'
      dbPassword = projectEnv.POSTGRES_PASSWORD || 'dev_password'
      log('📄 Usando credenciais das variáveis individuais:', 'blue')
    }

    log(`  DB: ${dbName}`, 'reset')
    log(`  User: ${dbUser}`, 'reset')
    log(
      `  Password: ${dbPassword.replace(/(.{2}).+(.{2})/, '$1***$2')}`,
      'reset'
    )

    // Detecta porta inteligente
    log('🔍 Detectando porta...', 'blue')
    const dbPort = await getSmartPort()
    log(`  Port: ${dbPort}`, 'reset')

    // Para containers existentes
    log('🛑 Parando containers existentes...', 'yellow')
    try {
      execSync('docker-compose down -v', { cwd: infraDbPath, stdio: 'inherit' })
    } catch (error) {
      log('⚠️  Nenhum container para parar', 'yellow')
    }

    // Gera novo docker-compose.yml com porta inteligente
    log(
      '📝 Gerando docker-compose.yml com credenciais e porta corretas...',
      'blue'
    )
    const dockerComposeContent = generateDockerCompose(
      dbName,
      dbUser,
      dbPassword,
      dbPort
    )
    fs.writeFileSync(dockerComposePath, dockerComposeContent)

    // Atualiza .env da infraestrutura
    log('📝 Atualizando .env da infraestrutura...', 'blue')
    const infraEnvContent = `# PostgreSQL Configuration
POSTGRES_DB=${dbName}
POSTGRES_USER=${dbUser}
POSTGRES_PASSWORD=${dbPassword}
POSTGRES_HOST=localhost
POSTGRES_PORT=${dbPort}
DATABASE_URL="postgresql://${dbUser}:${dbPassword}@localhost:${dbPort}/${dbName}"
`
    fs.writeFileSync(infraEnvPath, infraEnvContent)

    // Inicia containers com novas credenciais
    log('🚀 Iniciando container com credenciais corretas...', 'green')
    execSync('docker-compose up -d', { cwd: infraDbPath, stdio: 'inherit' })

    log('', 'reset')
    log('✅ Credenciais corrigidas com sucesso!', 'green')
    log('', 'reset')
    log('📋 Configuração final:', 'blue')
    log(`  🔌 Porta: ${dbPort}`, 'reset')
    log(`  🗄️  Database: ${dbName}`, 'reset')
    log('', 'reset')
    log('🧪 Agora teste o Prisma:', 'blue')
    log('  npx prisma migrate dev', 'yellow')
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { main }
