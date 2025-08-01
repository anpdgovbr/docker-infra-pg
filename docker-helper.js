#!/usr/bin/env node

/**
 * Cross-Platform Docker Compose Helper
 * Funciona em Windows, macOS e Linux
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const os = require('os')

const isWindows = os.platform() === 'win32'

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
    log(`❌ ${error.message}`, 'red')
    throw error
  }
}

// Verifica se o diretório infra-db existe
function checkInfraDir() {
  const infraDir = path.join(process.cwd(), 'infra-db')
  if (!fs.existsSync(infraDir)) {
    log('❌ Diretório infra-db não encontrado!', 'red')
    log('💡 Execute primeiro: npm run infra:setup', 'yellow')
    process.exit(1)
  }
  return infraDir
}

// Comandos disponíveis
const commands = {
  up: () => {
    const infraDir = checkInfraDir()
    log('🚀 Subindo infraestrutura PostgreSQL...', 'green')
    runCommand('docker-compose up -d', { cwd: infraDir })
    log('✅ Infraestrutura iniciada!', 'green')
  },

  down: () => {
    const infraDir = checkInfraDir()
    log('🛑 Parando infraestrutura PostgreSQL...', 'yellow')
    runCommand('docker-compose down', { cwd: infraDir })
    log('✅ Infraestrutura parada!', 'green')
  },

  logs: () => {
    const infraDir = checkInfraDir()
    log('📋 Mostrando logs do PostgreSQL...', 'blue')
    runCommand('docker-compose logs -f postgres', { cwd: infraDir })
  },

  reset: async () => {
    const infraDir = checkInfraDir()
    log('🔄 Resetando infraestrutura PostgreSQL...', 'yellow')
    runCommand('docker-compose down -v', { cwd: infraDir })
    log('⏳ Aguardando 3 segundos...', 'blue')
    await sleep(3)
    runCommand('docker-compose up -d', { cwd: infraDir })
    log('✅ Infraestrutura resetada!', 'green')
  },

  clean: () => {
    const infraDir = checkInfraDir()
    log('🧹 Limpando infraestrutura...', 'yellow')

    // Para os containers
    runCommand('docker-compose down', { cwd: infraDir })

    // Remove o diretório (cross-platform)
    if (isWindows) {
      runCommand(`rmdir /s /q "${infraDir}"`)
    } else {
      runCommand(`rm -rf "${infraDir}"`)
    }

    log('✅ Infraestrutura removida!', 'green')
  },

  psql: () => {
    const infraDir = checkInfraDir()
    log('🐘 Conectando ao PostgreSQL...', 'blue')
    runCommand('docker-compose exec postgres psql -U admin postgres', {
      cwd: infraDir
    })
  },

  status: () => {
    const infraDir = checkInfraDir()
    log('📊 Status da infraestrutura:', 'blue')
    runCommand('docker-compose ps', { cwd: infraDir })
  },

  backup: () => {
    const infraDir = checkInfraDir()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = `backup-${timestamp}.sql`

    log(`💾 Criando backup: ${backupFile}`, 'blue')
    runCommand(
      `docker-compose exec -T postgres pg_dump -U admin postgres > ${backupFile}`,
      { cwd: infraDir }
    )
    log(`✅ Backup criado: ${path.join(infraDir, backupFile)}`, 'green')
  },

  restore: () => {
    const infraDir = checkInfraDir()
    const backupFile = process.argv[3]

    if (!backupFile) {
      log('❌ Especifique o arquivo de backup:', 'red')
      log('💡 Uso: node docker-helper.js restore backup.sql', 'yellow')
      process.exit(1)
    }

    if (!fs.existsSync(path.join(infraDir, backupFile))) {
      log(`❌ Arquivo não encontrado: ${backupFile}`, 'red')
      process.exit(1)
    }

    log(`📥 Restaurando backup: ${backupFile}`, 'blue')
    runCommand(
      `docker-compose exec -T postgres psql -U admin postgres < ${backupFile}`,
      { cwd: infraDir }
    )
    log('✅ Backup restaurado!', 'green')
  }
}

// Função principal
function main() {
  const command = process.argv[2]

  if (!command || !commands[command]) {
    log('🐳 Docker Compose Helper - Cross Platform', 'green')
    log('', 'reset')
    log('Comandos disponíveis:', 'blue')
    log('  up      - Iniciar infraestrutura', 'reset')
    log('  down    - Parar infraestrutura', 'reset')
    log('  logs    - Ver logs do PostgreSQL', 'reset')
    log('  reset   - Resetar infraestrutura (remove dados)', 'reset')
    log('  clean   - Remover tudo', 'reset')
    log('  psql    - Conectar ao PostgreSQL', 'reset')
    log('  status  - Ver status dos containers', 'reset')
    log('  backup  - Criar backup do banco', 'reset')
    log('  restore - Restaurar backup (restore backup.sql)', 'reset')
    log('', 'reset')
    log('Uso: node docker-helper.js <comando>', 'yellow')
    process.exit(1)
  }

  // Executa o comando
  try {
    commands[command]()
  } catch (error) {
    log(`❌ Falha na execução: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = commands
