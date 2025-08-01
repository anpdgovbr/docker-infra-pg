#!/usr/bin/env node

/**
 * Update Scripts - Atualiza scripts da infraestrutura
 * Baixa as versões mais recentes dos scripts do repositório
 */

const fs = require('fs')
const https = require('https')
const path = require('path')

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

// Detecta se é projeto ES Module
function isESModuleProject() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    return packageJson.type === 'module'
  } catch {
    return false
  }
}

// URLs dos scripts
const REPO_BASE =
  'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main'

const SCRIPTS = ['setup-cross-platform.js', 'docker-helper.js', 'db-helper.js']

// Download de um script
function downloadScript(scriptName, targetPath) {
  return new Promise((resolve, reject) => {
    const url = `${REPO_BASE}/${scriptName}`

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${url}`))
          return
        }

        let data = ''
        response.on('data', (chunk) => (data += chunk))
        response.on('end', () => {
          try {
            fs.writeFileSync(targetPath, data)
            log(`✅ Atualizado: ${path.basename(targetPath)}`, 'green')
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      })
      .on('error', reject)
  })
}

// Verifica e atualiza package.json se necessário
async function checkAndUpdatePackageJson(extension) {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    // Verifica se tem script infra:update
    if (!packageJson.scripts['infra:update']) {
      log('📦 Adicionando script infra:update ao package.json...', 'yellow')

      packageJson.scripts[
        'infra:update'
      ] = `curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/update-scripts.js -o .infra/update-scripts.${extension} && node .infra/update-scripts.${extension}`

      // Salva package.json atualizado
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n'
      )
      log('✅ Script infra:update adicionado!', 'green')
    }

    // Verifica se scripts existentes estão usando extensão correta
    let scriptsUpdated = 0
    const infraScripts = Object.keys(packageJson.scripts).filter((key) =>
      key.startsWith('infra:')
    )

    for (const scriptKey of infraScripts) {
      const script = packageJson.scripts[scriptKey]
      const wrongExtension = extension === 'cjs' ? '.js' : '.cjs'
      const correctExtension = `.${extension}`

      if (script.includes(`/infra/`) && script.includes(wrongExtension)) {
        packageJson.scripts[scriptKey] = script.replace(
          new RegExp(
            `\\.infra/([^\\s]+)${wrongExtension.replace('.', '\\.')}`,
            'g'
          ),
          `.infra/$1${correctExtension}`
        )
        scriptsUpdated++
      }
    }

    if (scriptsUpdated > 0) {
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n'
      )
      log(
        `✅ ${scriptsUpdated} scripts atualizados no package.json para usar .${extension}`,
        'green'
      )
    }
  } catch (error) {
    log(
      `⚠️  Aviso: Não foi possível verificar package.json: ${error.message}`,
      'yellow'
    )
  }
}

// Função principal
async function main() {
  try {
    log('🔄 Atualizando scripts da infraestrutura...', 'blue')

    // Verifica se é projeto Node.js
    if (!fs.existsSync('package.json')) {
      log(
        '❌ Este não é um projeto Node.js (package.json não encontrado)',
        'red'
      )
      process.exit(1)
    }

    // Verifica se pasta .infra existe
    const infraDir = path.join(process.cwd(), '.infra')
    const infraDbDir = path.join(process.cwd(), 'infra-db')

    if (!fs.existsSync(infraDir)) {
      // Verifica se tem pasta infra-db (infraestrutura antiga)
      if (fs.existsSync(infraDbDir)) {
        log(
          '🔄 Infraestrutura antiga detectada (pasta infra-db/ existe)',
          'yellow'
        )
        log('📦 Criando pasta .infra/ e baixando scripts...', 'blue')

        // Cria pasta .infra
        fs.mkdirSync(infraDir, { recursive: true })
        log('✅ Pasta .infra/ criada', 'green')
      } else {
        log('❌ Pasta .infra não encontrada!', 'red')
        log('💡 Execute primeiro: npm run infra:setup', 'yellow')
        process.exit(1)
      }
    }

    // Detecta extensão correta
    const isESModule = isESModuleProject()
    const extension = isESModule ? 'cjs' : 'js'

    log(
      `📦 Projeto ${
        isESModule ? 'ES Module' : 'CommonJS'
      } detectado - usando .${extension}`,
      'blue'
    )

    // Baixa cada script
    for (const script of SCRIPTS) {
      const targetPath = path.join(
        infraDir,
        script.replace('.js', `.${extension}`)
      )

      try {
        await downloadScript(script, targetPath)
      } catch (error) {
        log(`❌ Erro ao baixar ${script}: ${error.message}`, 'red')
        process.exit(1)
      }
    }

    // Verifica se precisa atualizar package.json (para projetos que migraram)
    await checkAndUpdatePackageJson(extension)

    log('', 'reset')
    log('🎉 Todos os scripts foram atualizados!', 'green')
    log('', 'reset')
    log('📋 Scripts atualizados:', 'blue')
    SCRIPTS.forEach((script) => {
      const fileName = script.replace('.js', `.${extension}`)
      log(`  ✅ .infra/${fileName}`, 'green')
    })
    log('', 'reset')
    log(
      '💡 Agora você pode usar os comandos com as últimas melhorias!',
      'yellow'
    )
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { downloadScript, main }
