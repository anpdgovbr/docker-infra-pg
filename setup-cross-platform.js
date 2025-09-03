#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync: _execSync } = require('child_process')
const crypto = require('crypto')

// Arquivo escolhido para port-manager após download (ex: 'port-manager.cjs' ou 'port-manager.mjs')
let portManagerFilename = null

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

function isVerbose() {
  return process.argv.includes('--verbose') || process.env.VERBOSE === '1'
}

// Carrega dinamicamente o módulo port-manager já baixado (ou null)
async function loadPortManager() {
  if (!portManagerFilename) return null

  const verbose = isVerbose()

  const tryRequire = file => {
    if (typeof require !== 'function') return null
    try {
      return require(file)
    } catch (e) {
      if (verbose && e?.stack) log(e.stack, 'red')
      return null
    }
  }

  // Se for .cjs, tentar require diretamente
  if (portManagerFilename.endsWith('.cjs')) {
    return tryRequire(`./${portManagerFilename}`) || null
  }

  // Se for .mjs, tentar import dinâmico e fallback para .cjs via require
  if (portManagerFilename.endsWith('.mjs')) {
    try {
      const mod = await import(`./${portManagerFilename}`)
      return mod && (mod.default || mod)
    } catch {
      // tentar fallback para CommonJS
      return tryRequire('./port-manager.cjs') || null
    }
  }

  // fallback final: tentar carregar .cjs se existir
  return tryRequire('./port-manager.cjs') || null
}

// Baixa a variante adequada de port-manager: prefere .cjs quando possível, usa .mjs via import se o runtime for ESM
async function ensurePortManager() {
  // Detecta se estamos em um runtime CommonJS (require existe)
  const preferCjs = typeof require === 'function'
  const preferExt = preferCjs ? 'cjs' : 'mjs'
  const fallbackExt = 'cjs'

  const targetFile = `port-manager.${preferExt}`
  const targetPath = path.join(__dirname, targetFile)
  const repoUrl = `https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/${targetFile}`

  // Se já existe, apenas marcar e retornar
  if (fs.existsSync(targetPath)) {
    portManagerFilename = targetFile
    return true
  }

  log(`🔄 Baixando ${targetFile}...`, 'blue')

  const https = require('https')

  // tenta baixar a variante preferida; se não encontrar (404), tenta fallback (.cjs)
  try {
    const data = await new Promise((resolve, reject) => {
      https
        .get(repoUrl, res => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`))
            return
          }
          let body = ''
          res.on('data', chunk => (body += chunk))
          res.on('end', () => resolve(body))
          res.on('error', reject)
        })
        .on('error', reject)
    })
    fs.writeFileSync(targetPath, data)
    log(`✅ ${targetFile} baixado com sucesso!`, 'green')
    portManagerFilename = targetFile
    return true
  } catch (err) {
    // se a preferência falhou, tentar baixar a variante .cjs como fallback
    if (preferExt !== fallbackExt) {
      const fallbackFile = `port-manager.${fallbackExt}`
      const fallbackPath = path.join(__dirname, fallbackFile)
      const fallbackUrl = `https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/${fallbackFile}`
      try {
        log(`ℹ️  Não foi possível baixar ${targetFile} (tentando ${fallbackFile})`, 'yellow')
        const data2 = await new Promise((resolve, reject) => {
          https
            .get(fallbackUrl, res => {
              if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`))
                return
              }
              let body = ''
              res.on('data', chunk => (body += chunk))
              res.on('end', () => resolve(body))
              res.on('error', reject)
            })
            .on('error', reject)
        })
        fs.writeFileSync(fallbackPath, data2)
        log(`✅ ${fallbackFile} baixado com sucesso! (fallback)`, 'green')
        portManagerFilename = fallbackFile
        return true
      } catch (err2) {
        log(
          '⚠️  Não foi possível baixar port-manager (nem variante preferida nem fallback), usando detecção básica de porta',
          'yellow'
        )
        if (err2?.message) log(`Detalhes do erro: ${err2.message}`, 'yellow')
        return false
      }
    }
    log('⚠️  Não foi possível baixar port-manager, usando detecção básica de porta', 'yellow')
    if (err?.message) log(`Detalhes do erro: ${err.message}`, 'yellow')
    return false
  }
}

// Função para detectar porta inteligente (fallback local se port-manager não estiver disponível)
async function getSmartPort() {
  const hasPortManager = await ensurePortManager()

  if (hasPortManager) {
    const pm = await loadPortManager()
    if (pm && typeof pm.getSmartPort === 'function') {
      try {
        return await pm.getSmartPort()
      } catch (err) {
        if (isVerbose() && err?.stack) log(err.stack, 'red')
        log(
          '⚠️  Erro ao usar port-manager, usando detecção básica: ' + (err?.message || String(err)),
          'yellow'
        )
      }
    }
  }

  // Fallback: detecção básica de porta
  const net = require('net')

  const isPortAvailable = port => {
    return new Promise(resolve => {
      const server = net.createServer()

      function onListen() {
        server.once('close', onClose)
        server.close()
      }

      function onClose() {
        resolve(true)
      }

      function onError() {
        resolve(false)
      }

      server.listen(port, onListen)
      server.on('error', onError)
    })
  }

  // Testa portas comuns PostgreSQL
  for (let port = 5432; port <= 5450; port++) {
    if (await isPortAvailable(port)) {
      log(`🎯 Porta ${port} disponível (detecção básica)`, 'green')
      return port
    }
  }

  log('⚠️  Nenhuma porta padrão disponível, usando 5432', 'yellow')
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
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envConfig[key.trim()] = valueParts
          .join('=')
          .trim()
          .replace(/^((["'])|(["'])$)/g, '')
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

// Mascara a senha na DATABASE_URL para logs
function maskDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return databaseUrl
  try {
    const u = new URL(databaseUrl)
    if (u.password) {
      u.password = '****'
    }
    return u.toString()
  } catch {
    // fallback simples: substituir :<senha>@ por :****@
    return databaseUrl.replace(/:([^:@]+)@/, ':****@')
  }
}

// Função para criar docker-compose.yml
function createDockerCompose(config) {
  const { projectName, port, dbName, username, password } = config

  // Função para sanitizar nomes Docker (não pode começar com underscore, hífen ou ponto)
  const sanitizeName = name => {
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
  const { port, dbName, username, password } = config
  const projectRoot = process.cwd()
  const envPath = path.join(projectRoot, '.env')
  const envExamplePath = path.join(projectRoot, '.env.example')

  const databaseUrl = `postgresql://${username}:${password}@localhost:${port}/${dbName}?schema=public`

  let envContent = ''
  let existingEnv = {}
  let exampleEnv = {}

  // Ler .env existente
  if (fs.existsSync(envPath)) {
    const currentContent = fs.readFileSync(envPath, 'utf8')
    envContent = currentContent

    // Parse existing env
    currentContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        existingEnv[key.trim()] = valueParts.join('=').trim()
      }
    })
  }

  // Ler .env.example (se existir) para detectar variáveis opcionais, como as do Keycloak
  if (fs.existsSync(envExamplePath)) {
    try {
      const exampleContent = fs.readFileSync(envExamplePath, 'utf8')
      exampleContent.split('\n').forEach(line => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          exampleEnv[key.trim()] = valueParts.join('=').trim()
        }
      })
    } catch {
      // Ignorar erros ao ler .env.example
    }
  }

  // Atualizar ou adicionar variáveis
  const envVars = {
    POSTGRES_DB: dbName,
    POSTGRES_USER: username,
    POSTGRES_PASSWORD: password,
    DATABASE_URL: `"${databaseUrl}"`
  }

  // Se o projeto declarar variáveis do Keycloak em .env.example, aplicar mesma lógica do Postgres
  const keycloakVars = ['KEYCLOAK_ADMIN_PASSWORD', 'KEYCLOAK_DB_PASSWORD']
  keycloakVars.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(exampleEnv, k)) {
      // Manter se já existe com valor; gerar se ausente ou vazio
      const current = existingEnv[k]
      const shouldGenerate = !current || current.replace(/^"|"$/g, '').trim() === ''
      envVars[k] = shouldGenerate ? generateSecurePassword() : current
    }
  })

  // Compatibilidade com stacks comuns (NestJS/TypeORM, Spring Boot, Quarkus, psql)
  // Só preenche se a variável existir no .env.example para evitar poluir o .env
  const decide = (key, value) => {
    const current = existingEnv[key]
    const isEmpty = !current || current.replace(/^\"|\"$/g, '').trim() === ''
    return isEmpty ? value : current
  }

  const jdbcUrl = `jdbc:postgresql://localhost:${port}/${dbName}`

  const candidates = {
    // Genéricos
    DB_HOST: 'localhost',
    DB_PORT: String(port),
    DB_NAME: dbName,
    DB_USER: username,
    DB_USERNAME: username,
    DB_PASSWORD: password,

    // Variáveis padrão psql
    PGHOST: 'localhost',
    PGPORT: String(port),
    PGDATABASE: dbName,
    PGUSER: username,
    PGPASSWORD: password,

    // NestJS (TypeORM)
    TYPEORM_HOST: 'localhost',
    TYPEORM_PORT: String(port),
    TYPEORM_USERNAME: username,
    TYPEORM_PASSWORD: password,
    TYPEORM_DATABASE: dbName,

    // Spring Boot
    SPRING_DATASOURCE_URL: jdbcUrl,
    SPRING_DATASOURCE_USERNAME: username,
    SPRING_DATASOURCE_PASSWORD: password,

    // Quarkus
    QUARKUS_DATASOURCE_DB_KIND: 'postgresql',
    QUARKUS_DATASOURCE_JDBC_URL: jdbcUrl,
    QUARKUS_DATASOURCE_USERNAME: username,
    QUARKUS_DATASOURCE_PASSWORD: password
  }

  Object.entries(candidates).forEach(([k, v]) => {
    if (Object.prototype.hasOwnProperty.call(exampleEnv, k)) {
      envVars[k] = decide(k, v)
    }
  })

  Object.entries(envVars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm')
    if (regex.exec(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`)
    } else {
      envContent += `${envContent && !envContent.endsWith('\n') ? '\n' : ''}${key}=${value}\n`
    }
  })

  fs.writeFileSync(envPath, envContent)

  return databaseUrl
}

// Função principal
async function main() {
  log('🚀 Configurando infraestrutura PostgreSQL com detecção inteligente de porta...\n', 'blue')

  try {
    // Detectar configuração do projeto
    const { projectName: _projectName, envConfig } = detectProjectConfig()
    const projectName = _projectName
    log(`📦 Projeto detectado: ${projectName}`, 'blue')

    // Detectar porta inteligente
    log('🔍 Detectando porta disponível...', 'blue')
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
      password: existingDb.password || envConfig.POSTGRES_PASSWORD || generateSecurePassword()
    }

    log('📋 Configuração final:', 'blue')
    log(`   🎯 Porta: ${dbConfig.port}`, 'blue')
    log(`   🗄️  Banco: ${dbConfig.dbName}`, 'blue')
    log(`   👤 Usuário: ${dbConfig.username}`, 'blue')
    log(`   🔐 Senha: ${'*'.repeat(dbConfig.password.length)}`, 'blue')

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
    log('\n📝 Criando arquivos...', 'blue')

    // docker-compose.yml
    const dockerComposePath = path.join(infraPath, 'docker-compose.yml')
    fs.writeFileSync(dockerComposePath, createDockerCompose(dbConfig))
    log('✅ docker-compose.yml criado', 'green')

    // Script de inicialização
    const initScriptPath = path.join(initPath, '01-create-app-database.sh')
    fs.writeFileSync(initScriptPath, createInitScript(dbConfig))
    log('✅ Script de inicialização criado', 'green')

    // Atualizar .env
    const databaseUrl = updateEnvFile(dbConfig)
    log('✅ .env atualizado', 'green')

    log('\n🎉 Infraestrutura configurada com sucesso!', 'green')

    // Opção recomendada para a maioria dos usuários (usa os scripts do package.json)
    log('\n✨ Recomendado (mais simples):', 'blue')
    log('   1. npm run infra:up', 'blue')
    log('   2. Aguarde ~30s para inicialização completa', 'blue')

    // Alternativa manual para usuários avançados
    log('\n📋 Alternativa manual:', 'blue')
    log('   1. cd infra-db', 'blue')
    log('   2. docker-compose up -d', 'blue')
    log('   3. Aguarde ~30s para inicialização completa', 'blue')
    log(`   4. Teste a conexão: psql "${databaseUrl}"`, 'blue')
    log('   5. Execute suas migrations/seeds', 'blue')

    const args = process.argv.slice(2)
    const showSecrets = args.includes('--show-secrets') || process.env.SHOW_SECRETS === '1'

    log('\n🔗 DATABASE_URL configurada:', 'blue')
    if (showSecrets) {
      log(`   ${databaseUrl}`, 'yellow')
    } else {
      log(`   ${maskDatabaseUrl(databaseUrl)}`, 'yellow')
      log(
        '   ℹ️  Senha oculta nos logs. Use --show-secrets ou SHOW_SECRETS=1 para ver a URL completa',
        'yellow'
      )
    }
  } catch (error) {
    log('❌ Erro durante a configuração: ' + (error?.message || String(error)), 'red')
    if (isVerbose() && error?.stack) log(error.stack, 'red')
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
