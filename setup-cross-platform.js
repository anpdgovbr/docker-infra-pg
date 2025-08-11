#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const crypto = require('crypto')

// Verificar se port-manager.js existe e baixar se necessário
async function ensurePortManager() {
  const portManagerPath = path.join(__dirname, 'port-manager.js')

  if (!fs.existsSync(portManagerPath)) {
    console.log('🔄 Baixando port-manager.js...')
    try {
      const https = require('https')
      const url =
        'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/port-manager.js'

      await new Promise((resolve, reject) => {
        https
          .get(url, (res) => {
            let data = ''
            res.on('data', (chunk) => (data += chunk))
            res.on('end', () => {
              fs.writeFileSync(portManagerPath, data)
              console.log('✅ port-manager.js baixado com sucesso!')
              resolve()
            })
            res.on('error', reject)
          })
          .on('error', reject)
      })
    } catch (error) {
      console.warn(
        '⚠️  Não foi possível baixar port-manager.js, usando detecção básica de porta'
      )
      return false
    }
  }

  return true
}

// Função para detectar porta inteligente (fallback local se port-manager não estiver disponível)
async function getSmartPort() {
  const hasPortManager = await ensurePortManager()

  if (hasPortManager) {
    try {
      const portManager = require('./port-manager.js')
      return await portManager.getSmartPort()
    } catch (error) {
      console.warn(
        '⚠️  Erro ao usar port-manager.js, usando detecção básica:',
        error.message
      )
    }
  }

  // Fallback: detecção básica de porta
  const net = require('net')

  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer()
      server.listen(port, () => {
        server.once('close', () => resolve(true))
        server.close()
      })
      server.on('error', () => resolve(false))
    })
  }

  // Testa portas comuns PostgreSQL
  for (let port = 5432; port <= 5450; port++) {
    if (await isPortAvailable(port)) {
      console.log(`🎯 Porta ${port} disponível (detecção básica)`)
      return port
    }
  }

  console.warn('⚠️  Nenhuma porta padrão disponível, usando 5432')
  return 5432
}

// Função para detectar configurações do projeto
function detectProjectConfig() {
  const projectRoot = process.cwd()

  // Ler package.json
  const packageJsonPath = path.join(projectRoot, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      '❌ package.json não encontrado. Este comando deve ser executado na raiz do projeto.'
    )
    process.exit(1)
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const projectName = packageJson.name || path.basename(projectRoot)

  // Ler .env se existir
  const envPath = path.join(projectRoot, '.env')
  let envConfig = {}

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envConfig[key.trim()] = valueParts
          .join('=')
          .trim()
          .replace(/^["']|["']$/g, '')
      }
    })
  }

  return { projectName, envConfig, packageJson }
}

// Função para gerar senha segura
function generateSecurePassword() {
  return crypto.randomBytes(16).toString('hex')
}

// Função para extrair dados da DATABASE_URL
function parseDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return {}

  try {
    const url = new URL(databaseUrl)
    return {
      username: url.username,
      password: url.password,
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.slice(1).split('?')[0]
    }
  } catch {
    return {}
  }
}

// Função para criar docker-compose.yml
function createDockerCompose(config) {
  const { projectName, port, dbName, username, password } = config

  // Função para sanitizar nomes Docker (não pode começar com underscore, hífen ou ponto)
  const sanitizeName = (name) => {
    return name
      .replace(/[^a-zA-Z0-9]/g, '_') // Substituir caracteres especiais por underscore
      .replace(/^[^a-zA-Z0-9]+/, '') // Remover underscores, hífens do início
      .replace(/^$/, 'project') // Se vazio, usar 'project'
      .toLowerCase() // Docker prefere lowercase
  }

  // Nome do container e network únicos por projeto
  const safeName = sanitizeName(projectName)
  const containerName = `${safeName}_postgres`
  const networkName = `${safeName}_network`
  const volumeName = `${safeName}_postgres_data`

  const dockerComposeContent = `name: ${safeName}-stack

services:
  postgres:
    image: postgres:15
    container_name: ${containerName}
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${username}
      POSTGRES_PASSWORD: ${password}
      POSTGRES_DB: ${dbName}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "${port}:5432"
    volumes:
      - ${volumeName}:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
    networks:
      - ${networkName}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${username} -d ${dbName}"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  ${volumeName}:
    name: ${volumeName}

networks:
  ${networkName}:
    name: ${networkName}
    driver: bridge
`

  return dockerComposeContent
}

// Função para criar script de inicialização
function createInitScript(config) {
  const { dbName, username } = config

  return `#!/bin/bash
set -e

echo "🔄 Configurando banco de dados ${dbName}..."

# Criar usuário se não existir
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO
    \\$\\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${username}') THEN
            CREATE USER ${username} WITH ENCRYPTED PASSWORD '${config.password}';
        END IF;
    END
    \\$\\$;
    
    -- Garantir que o usuário tem permissões no banco
    GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${username};
    
    -- Se estivermos no PostgreSQL 15+, garantir permissões no schema public
    \\c ${dbName}
    GRANT ALL ON SCHEMA public TO ${username};
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${username};
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${username};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${username};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${username};
EOSQL

echo "✅ Banco de dados ${dbName} configurado com sucesso!"
`
}

// Função para atualizar .env
function updateEnvFile(config) {
  const { projectName, port, dbName, username, password } = config
  const projectRoot = process.cwd()
  const envPath = path.join(projectRoot, '.env')

  const databaseUrl = `postgresql://${username}:${password}@localhost:${port}/${dbName}?schema=public`

  let envContent = ''
  let existingEnv = {}

  // Ler .env existente
  if (fs.existsSync(envPath)) {
    const currentContent = fs.readFileSync(envPath, 'utf8')
    envContent = currentContent

    // Parse existing env
    currentContent.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        existingEnv[key.trim()] = valueParts.join('=').trim()
      }
    })
  }

  // Atualizar ou adicionar variáveis
  const envVars = {
    POSTGRES_DB: dbName,
    POSTGRES_USER: username,
    POSTGRES_PASSWORD: password,
    DATABASE_URL: `"${databaseUrl}"`
  }

  Object.entries(envVars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm')
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`)
    } else {
      envContent += `${
        envContent && !envContent.endsWith('\n') ? '\n' : ''
      }${key}=${value}\n`
    }
  })

  fs.writeFileSync(envPath, envContent)

  return databaseUrl
}

// Função principal
async function main() {
  console.log(
    '🚀 Configurando infraestrutura PostgreSQL com detecção inteligente de porta...\n'
  )

  try {
    // Detectar configuração do projeto
    const { projectName, envConfig } = detectProjectConfig()
    console.log(`📦 Projeto detectado: ${projectName}`)

    // Detectar porta inteligente
    console.log('🔍 Detectando porta disponível...')
    const port = await getSmartPort()

    // Extrair dados existentes da DATABASE_URL
    const existingDb = parseDatabaseUrl(envConfig.DATABASE_URL)

    // Configuração do banco
    const dbConfig = {
      projectName,
      port,
      dbName:
        existingDb.database ||
        envConfig.POSTGRES_DB ||
        `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_dev`,
      username: existingDb.username || envConfig.POSTGRES_USER || 'dev_user',
      password:
        existingDb.password ||
        envConfig.POSTGRES_PASSWORD ||
        generateSecurePassword()
    }

    console.log('📋 Configuração final:')
    console.log(`   🎯 Porta: ${dbConfig.port}`)
    console.log(`   🗄️  Banco: ${dbConfig.dbName}`)
    console.log(`   👤 Usuário: ${dbConfig.username}`)
    console.log(`   🔐 Senha: ${'*'.repeat(dbConfig.password.length)}`)

    // Criar pasta infra-db se não existir
    const infraPath = path.join(process.cwd(), 'infra-db')
    if (!fs.existsSync(infraPath)) {
      fs.mkdirSync(infraPath, { recursive: true })
    }

    // Criar pasta init se não existir
    const initPath = path.join(infraPath, 'init')
    if (!fs.existsSync(initPath)) {
      fs.mkdirSync(initPath, { recursive: true })
    }

    // Criar arquivos
    console.log('\n📝 Criando arquivos...')

    // docker-compose.yml
    const dockerComposePath = path.join(infraPath, 'docker-compose.yml')
    fs.writeFileSync(dockerComposePath, createDockerCompose(dbConfig))
    console.log('✅ docker-compose.yml criado')

    // Script de inicialização
    const initScriptPath = path.join(initPath, '01-create-app-database.sh')
    fs.writeFileSync(initScriptPath, createInitScript(dbConfig))
    console.log('✅ Script de inicialização criado')

    // Atualizar .env
    const databaseUrl = updateEnvFile(dbConfig)
    console.log('✅ .env atualizado')

    console.log('\n🎉 Infraestrutura configurada com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('   1. cd infra-db')
    console.log('   2. docker-compose up -d')
    console.log('   3. Aguarde ~30s para inicialização completa')
    console.log(`   4. Teste a conexão: psql "${databaseUrl}"`)
    console.log('   5. Execute suas migrations/seeds')

    console.log('\n🔗 DATABASE_URL configurada:')
    console.log(`   ${databaseUrl}`)
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = {
  getSmartPort,
  detectProjectConfig,
  createDockerCompose,
  updateEnvFile
}
