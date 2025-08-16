#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync: _execSync } = require('child_process')
const crypto = require('crypto')

// Arquivo escolhido para port-manager após download (ex: 'port-manager.cjs' ou 'port-manager.mjs')
let portManagerFilename = null

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

  console.log(`🔄 Baixando ${targetFile}...`)

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
    console.log(`✅ ${targetFile} baixado com sucesso!`)
    portManagerFilename = targetFile
    return true
  } catch (err) {
    // se a preferência falhou, tentar baixar a variante .cjs como fallback
    if (preferExt !== fallbackExt) {
      const fallbackFile = `port-manager.${fallbackExt}`
      const fallbackPath = path.join(__dirname, fallbackFile)
      const fallbackUrl = `https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/${fallbackFile}`
      try {
        console.log(`ℹ️  Não foi possível baixar ${targetFile} (tentando ${fallbackFile})`)
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
        console.log(`✅ ${fallbackFile} baixado com sucesso! (fallback)`)
        portManagerFilename = fallbackFile
        return true
      } catch (err2) {
        console.warn(
          '⚠️  Não foi possível baixar port-manager (nem variante preferida nem fallback), usando detecção básica de porta'
        )
        if (err2?.message) console.warn('Detalhes do erro:', err2.message)
        return false
      }
    }

    console.warn('⚠️  Não foi possível baixar port-manager, usando detecção básica de porta')
    if (err?.message) console.warn('Detalhes do erro:', err.message)
    return false
  }
}

// Função para detectar porta inteligente (fallback local se port-manager não estiver disponível)
async function getSmartPort() {
  const hasPortManager = await ensurePortManager()

  if (hasPortManager) {
    try {
      // carrega dinamicamente a variante baixada
      if (
        portManagerFilename &&
        portManagerFilename.endsWith('.cjs') &&
        typeof require === 'function'
      ) {
        const portManager = require(`./${portManagerFilename}`)
        return await portManager.getSmartPort()
      }

      if (portManagerFilename && portManagerFilename.endsWith('.mjs')) {
        // em runtime ESM: importar dinamicamente; se o módulo for CommonJS fallback, usamos createRequire
        try {
          const portManager = await import(`./${portManagerFilename}`)
          // suportar export padrão ou named
          const pm = portManager.default || portManager
          return await pm.getSmartPort()
        } catch (importErr) {
          // tentar fallback para require via createRequire (compatível com CommonJS)
          try {
            const { createRequire } = require('module')
            const requireFn = createRequire(__filename)
            const portManager = requireFn(`./port-manager.cjs`)
            return await portManager.getSmartPort()
          } catch (creqErr) {
            console.warn(
              '⚠️  Erro ao importar port-manager.mjs; usando detecção básica:',
              importErr.message
            )
          }
        }
      }

      // fallback geral: tentar carregar .cjs com require se estiver disponível
      if (
        typeof require === 'function' &&
        fs.existsSync(path.join(__dirname, 'port-manager.cjs'))
      ) {
        const portManager = require('./port-manager.cjs')
        return await portManager.getSmartPort()
      }
    } catch (error) {
      console.warn('⚠️  Erro ao usar port-manager, usando detecção básica:', error.message)
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

  const databaseUrl = `postgresql://${username}:${password}@localhost:${port}/${dbName}?schema=public`

  let envContent = ''
  let existingEnv = {}

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

  // Atualizar ou adicionar variáveis
  const envVars = {
    POSTGRES_DB: dbName,
    POSTGRES_USER: username,
    POSTGRES_PASSWORD: password,
    DATABASE_URL: `"${databaseUrl}"`
  }

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
  console.log('🚀 Configurando infraestrutura PostgreSQL com detecção inteligente de porta...\n')

  try {
    // Detectar configuração do projeto
    const { projectName: _projectName, envConfig } = detectProjectConfig()
    const projectName = _projectName
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
      password: existingDb.password || envConfig.POSTGRES_PASSWORD || generateSecurePassword()
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

    // Opção recomendada para a maioria dos usuários (usa os scripts do package.json)
    console.log('\n� Recomendado (mais simples):')
    console.log('   1. npm run infra:up')
    console.log('   2. Aguarde ~30s para inicialização completa')

    // Alternativa manual para usuários avançados
    console.log('\n📋 Alternativa manual:')
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
