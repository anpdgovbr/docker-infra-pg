#!/usr/bin/env node

/**
 * Cross-Platform Database Helper
 * Funciona em Windows, macOS e Linux com Prisma
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

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

// Sleep cross-platform
function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

// Executa comando com tratamento de erro
function runCommand(command, options = {}) {
  try {
    log(`🔧 Executando: ${command}`, 'blue')
    const result = execSync(command, {
      stdio: 'inherit',
      shell: true,
      cwd: options.cwd || process.cwd(),
      ...options
    })
    return result
  } catch (error) {
    log(`❌ Erro ao executar: ${command}`, 'red')
    throw error
  }
}

// Verifica se o Prisma está instalado
function checkPrisma() {
  try {
    execSync('npx prisma --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Verifica se a infraestrutura está rodando
function checkInfra() {
  const infraDir = path.join(process.cwd(), 'infra-db')
  if (!fs.existsSync(infraDir)) {
    log('❌ Infraestrutura não configurada!', 'red')
    log('💡 Execute: npm run infra:setup', 'yellow')
    return false
  }

  try {
    execSync('docker-compose ps', { cwd: infraDir, stdio: 'ignore' })
    return true
  } catch {
    log('❌ Infraestrutura não está rodando!', 'red')
    log('💡 Execute: npm run infra:up', 'yellow')
    return false
  }
}

// Comandos disponíveis
const commands = {
  setup: async () => {
    log('🚀 Configurando banco de dados...', 'green')

    // 1. Garantir que a infraestrutura está rodando
    const dockerHelper = require('./docker-helper.js')
    try {
      await dockerHelper.up()
    } catch {
      log('⚠️  Infraestrutura não estava rodando, iniciando...', 'yellow')
      await dockerHelper.up()
    }

    // 2. Aguardar o banco estar pronto
    log('⏳ Aguardando PostgreSQL ficar pronto...', 'blue')
    await sleep(5)

    // 3. Executar migrações se Prisma estiver disponível
    if (checkPrisma()) {
      log('📊 Executando migrações Prisma...', 'blue')
      runCommand('npx prisma migrate dev')

      // 4. Executar seed se existir
      const packageJson = path.join(process.cwd(), 'package.json')
      if (fs.existsSync(packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'))
        if (pkg.scripts && pkg.scripts['prisma:seed']) {
          log('🌱 Executando seed...', 'blue')
          runCommand('npm run prisma:seed')
        }
      }
    } else {
      log('⚠️  Prisma não encontrado, pulando migrações', 'yellow')
    }

    log('✅ Banco de dados configurado!', 'green')
  },

  fresh: async () => {
    log('🔄 Resetando banco de dados...', 'yellow')

    const dockerHelper = require('./docker-helper.js')
    await dockerHelper.reset()

    log('⏳ Aguardando PostgreSQL reiniciar...', 'blue')
    await sleep(10)

    await commands.setup()
    log('✅ Banco resetado e reconfigurado!', 'green')
  },

  migrate: () => {
    if (!checkPrisma()) {
      log('❌ Prisma não encontrado!', 'red')
      process.exit(1)
    }

    if (!checkInfra()) {
      process.exit(1)
    }

    log('📊 Executando migrações...', 'blue')
    runCommand('npx prisma migrate dev')
    log('✅ Migrações executadas!', 'green')
  },

  seed: () => {
    if (!checkPrisma()) {
      log('❌ Prisma não encontrado!', 'red')
      process.exit(1)
    }

    if (!checkInfra()) {
      process.exit(1)
    }

    const packageJson = path.join(process.cwd(), 'package.json')
    if (!fs.existsSync(packageJson)) {
      log('❌ package.json não encontrado!', 'red')
      process.exit(1)
    }

    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'))
    if (!pkg.scripts || !pkg.scripts['prisma:seed']) {
      log('❌ Script prisma:seed não encontrado no package.json!', 'red')
      process.exit(1)
    }

    log('🌱 Executando seed...', 'blue')
    runCommand('npm run prisma:seed')
    log('✅ Seed executado!', 'green')
  },

  studio: () => {
    if (!checkPrisma()) {
      log('❌ Prisma não encontrado!', 'red')
      process.exit(1)
    }

    if (!checkInfra()) {
      process.exit(1)
    }

    log('🎨 Abrindo Prisma Studio...', 'blue')
    runCommand('npx prisma studio')
  },

  reset: () => {
    if (!checkPrisma()) {
      log('❌ Prisma não encontrado!', 'red')
      process.exit(1)
    }

    if (!checkInfra()) {
      process.exit(1)
    }

    log('🔄 Resetando migrações Prisma...', 'yellow')
    runCommand('npx prisma migrate reset --force')
    log('✅ Migrações resetadas!', 'green')
  },

  generate: () => {
    if (!checkPrisma()) {
      log('❌ Prisma não encontrado!', 'red')
      process.exit(1)
    }

    log('⚡ Gerando cliente Prisma...', 'blue')
    runCommand('npx prisma generate')
    log('✅ Cliente gerado!', 'green')
  }
}

// Função principal
function main() {
  const command = process.argv[2]

  if (!command || !commands[command]) {
    log('🗄️  Database Helper - Cross Platform', 'green')
    log('', 'reset')
    log('Comandos disponíveis:', 'blue')
    log('  setup    - Configurar banco (up + migrate + seed)', 'reset')
    log('  fresh    - Reset completo (reset infra + setup)', 'reset')
    log('  migrate  - Executar migrações Prisma', 'reset')
    log('  seed     - Executar seed', 'reset')
    log('  studio   - Abrir Prisma Studio', 'reset')
    log('  reset    - Reset migrações Prisma', 'reset')
    log('  generate - Gerar cliente Prisma', 'reset')
    log('', 'reset')
    log('Uso: node db-helper.js <comando>', 'yellow')
    process.exit(1)
  }

  // Executa o comando
  commands[command]().catch((error) => {
    log(`❌ Falha na execução: ${error.message}`, 'red')
    process.exit(1)
  })
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = commands
