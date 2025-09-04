#!/usr/bin/env node

/**
 * Auto Setup para Projetos ANPD
 * Configura infraestrutura PostgreSQL automaticamente
 * Funciona tanto via pipe quanto via download direto
 */

const fs = require('fs')
const _path = require('path')
const { execSync } = require('child_process')
const os = require('os')

// Detecta se está sendo executado via pipe
const isRunningViaPipe = !process.stdin.isTTY && process.argv[1] === '/dev/stdin'

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

// Detecta se o projeto usa ES modules
function isESModuleProject() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    return packageJson.type === 'module'
  } catch {
    return false
  }
}

// Lê o package.json atual
function readPackageJson() {
  try {
    const content = fs.readFileSync('package.json', 'utf8')
    return JSON.parse(content)
  } catch {
    throw new Error('Não foi possível ler package.json')
  }
}

// Escreve o package.json atualizado
function writePackageJson(pkg) {
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
}

// Configura .gitignore
function setupGitignore() {
  const requiredLines = [
    '# Infraestrutura PostgreSQL ANPD',
    '.infra/',
    'infra-db/',
    '',
    '# Scripts temporários da infraestrutura (caso fiquem na raiz)',
    'setup-infra.sh',
    'setup-infra-temp.sh'
  ]

  let lines = []
  if (fs.existsSync('.gitignore')) {
    const content = fs.readFileSync('.gitignore', 'utf8')
    lines = content.split(/\r?\n/)
  }

  const set = new Set(lines.filter(l => l !== undefined))
  let added = 0
  for (const l of requiredLines) {
    if (!set.has(l)) {
      set.add(l)
      lines.push(l)
      added++
    }
  }

  fs.writeFileSync('.gitignore', lines.join('\n').replace(/\n+$/, '') + '\n')
  log(added > 0 ? '✅ .gitignore atualizado' : '✅ .gitignore já estava configurado', 'green')
}

// Remove arquivos temporários da raiz do projeto
function cleanupTempFiles() {
  const tempFiles = [
    'setup-infra.sh',
    'setup-infra-temp.sh',
    'docker-helper.js',
    'db-helper.js',
    'setup-cross-platform.js'
  ]

  let removedCount = 0
  for (const file of tempFiles) {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file)
        removedCount++
        log(`🧹 Removido arquivo temporário: ${file}`, 'yellow')
      } catch (error) {
        log(`⚠️  Não foi possível remover ${file}: ${error.message}`, 'yellow')
      }
    }
  }

  if (removedCount > 0) {
    log(`✅ ${removedCount} arquivos temporários removidos da raiz`, 'green')
  }
}

// Gera scripts da infraestrutura baseado no tipo de módulo
function generateInfraScripts() {
  const isESModule = isESModuleProject()
  const extension = isESModule ? 'cjs' : 'js'

  log(
    `📦 Projeto ${isESModule ? 'ES Module' : 'CommonJS'} detectado - usando .${extension}`,
    'blue'
  )

  return {
    'infra:setup': `curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js -o .infra/setup-cross-platform.${extension} && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js -o .infra/docker-helper.${extension} && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js -o .infra/db-helper.${extension} && node .infra/setup-cross-platform.${extension}`,
    'infra:setup:manual': `curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js -o .infra/setup-cross-platform.${extension} && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js -o .infra/docker-helper.${extension} && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js -o .infra/db-helper.${extension} && node .infra/setup-cross-platform.${extension} --manual`,
    'infra:setup:force': `curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-cross-platform.js -o .infra/setup-cross-platform.${extension} && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/docker-helper.js -o .infra/docker-helper.${extension} && curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/db-helper.js -o .infra/db-helper.${extension} && node .infra/setup-cross-platform.${extension} --force --auto`,
    'infra:update': `curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/update-scripts.js -o .infra/update-scripts.${extension} && node .infra/update-scripts.${extension}`,
    'infra:debug': `curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/diagnostic.js -o .infra/diagnostic.${extension} && node .infra/diagnostic.${extension}`,
    'infra:fix': `curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/fix-credentials.js -o .infra/fix-credentials.${extension} && node .infra/fix-credentials.${extension}`,
    'infra:up': `node .infra/docker-helper.${extension} up`,
    'infra:down': `node .infra/docker-helper.${extension} down`,
    'infra:logs': `node .infra/docker-helper.${extension} logs`,
    'infra:reset': `node .infra/docker-helper.${extension} reset`,
    'infra:clean': `node .infra/docker-helper.${extension} clean`,
    'infra:psql': `node .infra/docker-helper.${extension} psql`,
    'infra:status': `node .infra/docker-helper.${extension} status`,
    'infra:backup': `node .infra/docker-helper.${extension} backup`,
    'infra:db:init': `node .infra/db-helper.${extension} setup`,
    'infra:db:fresh': `node .infra/db-helper.${extension} fresh`,
    'infra:db:migrate': `node .infra/db-helper.${extension} migrate`,
    'infra:db:seed': `node .infra/db-helper.${extension} seed`,
    'infra:db:studio': `node .infra/db-helper.${extension} studio`,
    'infra:db:reset': `node .infra/db-helper.${extension} reset`
  }
}

// Adiciona scripts ao package.json
function addInfraScripts(pkg) {
  if (!pkg.scripts) {
    pkg.scripts = {}
  }

  const infraScripts = generateInfraScripts()
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
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    log('🤖 Auto-Setup Infra PostgreSQL ANPD', 'green')
    log('', 'reset')
    log('Uso:', 'blue')
    log(
      '  curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node',
      'reset'
    )
    log('', 'reset')
    log('Docs: https://github.com/anpdgovbr/docker-infra-pg', 'yellow')
    process.exit(0)
  }

  // Detecta se está sendo executado via pipe
  const isViaPipe = !process.stdin.isTTY && process.argv[1] === 'stdin'

  if (isViaPipe) {
    // Quando executado via pipe, usar estratégia de download
    log('🚀 Quick Setup Cross-Platform', 'green')
    log(`📊 SO detectado: ${os.platform()} ${os.arch()}`, 'blue')

    // Verifica se há package.json no diretório atual
    if (!fs.existsSync('package.json')) {
      log(`⚠️  Nenhum package.json encontrado no diretório atual`, 'yellow')
      log(`💡 Este comando deve ser executado na raiz de um projeto Node.js`, 'blue')
      log(`� Diretório atual: ${process.cwd()}`, 'reset')
      process.exit(1)
    }

    try {
      // Detecta SO
      const platform = os.platform()
      const isWindows = platform === 'win32'
      const deleteCommand = isWindows ? 'del' : 'rm'

      // URL do script atual
      const scriptUrl =
        'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js'

      // Comando para download e execução
      const command = `curl -sSL ${scriptUrl} -o temp-setup.cjs && node temp-setup.cjs && ${deleteCommand} temp-setup.cjs`

      log(`💻 Executando: ${command}`, 'blue')

      execSync(command, {
        stdio: 'inherit',
        shell: true
      })

      log(`✅ Setup concluído!`, 'green')
    } catch (error) {
      log(`❌ Erro durante setup: ${error.message}`, 'red')
      process.exit(1)
    }
    return
  }

  try {
    log('�🚀 Configurando Infraestrutura PostgreSQL ANPD', 'green')

    // Verificações
    if (!isNodeProject()) {
      log('❌ Este não parece ser um projeto Node.js (package.json não encontrado)', 'red')
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

    // Remove arquivos temporários da raiz
    cleanupTempFiles()

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

module.exports = {
  addInfraScripts,
  setupGitignore,
  generateInfraScripts,
  cleanupTempFiles
}
