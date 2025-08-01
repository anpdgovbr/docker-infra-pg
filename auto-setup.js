#!/usr/bin/env node

/**
 * Auto Setup para Projetos ANPD
 * Configura infraestrutura PostgreSQL automaticamente
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

// Verifica se o arquivo é um projeto Node.js
function isNodeProject() {
  return fs.existsSync('package.json')
}

// Lê o package.json atual
function readPackageJson() {
  try {
    const content = fs.readFileSync('package.json', 'utf8')
    return JSON.parse(content)
  } catch (error) {
    throw new Error('Não foi possível ler package.json')
  }
}

// Escreve o package.json atualizado
function writePackageJson(pkg) {
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
}

// Configura .gitignore
function setupGitignore() {
  const gitignoreContent = `
# Infraestrutura PostgreSQL ANPD
.infra/
infra-db/
`

  let currentGitignore = ''
  if (fs.existsSync('.gitignore')) {
    currentGitignore = fs.readFileSync('.gitignore', 'utf8')
  }

  // Verifica se já está configurado
  if (
    currentGitignore.includes('.infra/') ||
    currentGitignore.includes('infra-db/')
  ) {
    log('✅ .gitignore já configurado', 'green')
    return
  }

  // Adiciona as configurações
  fs.writeFileSync('.gitignore', currentGitignore + gitignoreContent)
  log('✅ .gitignore configurado', 'green')
}

// Scripts da infraestrutura
const infraScripts = {
  'infra:setup':
    'mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js > .infra/setup-cross-platform.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js > .infra/docker-helper.js && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js > .infra/db-helper.js && node .infra/setup-cross-platform.js',
  'infra:setup:manual': 'node .infra/setup-cross-platform.js --manual',
  'infra:setup:force': 'node .infra/setup-cross-platform.js --force --auto',
  'infra:up': 'node .infra/docker-helper.js up',
  'infra:down': 'node .infra/docker-helper.js down',
  'infra:logs': 'node .infra/docker-helper.js logs',
  'infra:reset': 'node .infra/docker-helper.js reset',
  'infra:clean': 'node .infra/docker-helper.js clean',
  'infra:psql': 'node .infra/docker-helper.js psql',
  'infra:status': 'node .infra/docker-helper.js status',
  'infra:backup': 'node .infra/docker-helper.js backup',
  'infra:db:init': 'node .infra/db-helper.js setup',
  'infra:db:fresh': 'node .infra/db-helper.js fresh',
  'infra:db:migrate': 'node .infra/db-helper.js migrate',
  'infra:db:seed': 'node .infra/db-helper.js seed',
  'infra:db:studio': 'node .infra/db-helper.js studio',
  'infra:db:reset': 'node .infra/db-helper.js reset'
}

// Adiciona scripts ao package.json
function addInfraScripts(pkg) {
  if (!pkg.scripts) {
    pkg.scripts = {}
  }

  let addedCount = 0
  for (const [key, value] of Object.entries(infraScripts)) {
    if (!pkg.scripts[key]) {
      pkg.scripts[key] = value
      addedCount++
    }
  }

  return addedCount
}

// Função principal
function main() {
  try {
    log('🚀 Configurando Infraestrutura PostgreSQL ANPD', 'green')

    // Verificações
    if (!isNodeProject()) {
      log(
        '❌ Este não parece ser um projeto Node.js (package.json não encontrado)',
        'red'
      )
      process.exit(1)
    }

    log('📦 Projeto Node.js detectado', 'blue')

    // Lê package.json atual
    const pkg = readPackageJson()
    log(`✅ Projeto: ${pkg.name || 'sem nome'}`, 'green')

    // Adiciona scripts
    const addedCount = addInfraScripts(pkg)
    if (addedCount > 0) {
      writePackageJson(pkg)
      log(`✅ ${addedCount} scripts adicionados ao package.json`, 'green')
    } else {
      log('✅ Scripts da infraestrutura já estão configurados', 'green')
    }

    // Configura .gitignore
    setupGitignore()

    // Cria pasta .infra se não existir
    if (!fs.existsSync('.infra')) {
      fs.mkdirSync('.infra')
      log('✅ Pasta .infra criada', 'green')
    }

    log('', 'reset')
    log('🎉 Configuração concluída!', 'green')
    log('', 'reset')
    log('📋 Próximos passos:', 'blue')
    log('  1. npm run infra:setup     # Configurar infraestrutura', 'reset')
    log('  2. npm run dev             # Iniciar desenvolvimento', 'reset')
    log('', 'reset')
    log('📚 Documentação completa:', 'blue')
    log('  https://github.com/anpdgovbr/docker-infra-pg', 'reset')
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { addInfraScripts, setupGitignore, infraScripts }
