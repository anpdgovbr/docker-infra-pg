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
const REPO_BASE = 'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main'

const SCRIPTS = ['setup-cross-platform.js', 'docker-helper.js', 'db-helper.js', 'port-manager.js']

// Download de um script
function downloadScript(scriptName, targetPath) {
  return new Promise((resolve, reject) => {
    const url = `${REPO_BASE}/${scriptName}`

    https
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${url}`))
          return
        }

        let data = ''
        response.on('data', chunk => (data += chunk))
        response.on('end', () => {
          try {
            const exists = fs.existsSync(targetPath)
            const previous = exists ? fs.readFileSync(targetPath, 'utf8') : null

            if (previous === data) {
              // Sem alteração
              log(`ℹ️  Sem alterações: ${path.basename(targetPath)}`, 'blue')
              resolve({ name: path.basename(targetPath), status: 'unchanged' })
            } else {
              fs.writeFileSync(targetPath, data)
              if (exists) {
                log(`✅ Atualizado: ${path.basename(targetPath)}`, 'green')
                resolve({ name: path.basename(targetPath), status: 'updated' })
              } else {
                log(`✅ Criado: ${path.basename(targetPath)}`, 'green')
                resolve({ name: path.basename(targetPath), status: 'created' })
              }
            }
          } catch (error) {
            reject(error)
          }
        })
      })
      .on('error', reject)
  })
}

// Gera todos os scripts de infraestrutura
function generateInfraScripts(extension) {
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

// Verifica e atualiza package.json com todos os scripts
async function updatePackageJsonScripts(extension) {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    // Obtém todos os scripts da infraestrutura mais atuais
    const currentInfraScripts = generateInfraScripts(extension)
    let addedCount = 0
    let updatedCount = 0
    const addedScripts = []
    const updatedScripts = []

    log('🔍 Verificando scripts no package.json...', 'blue')

    // Adiciona ou atualiza scripts
    for (const [scriptName, scriptCommand] of Object.entries(currentInfraScripts)) {
      if (!packageJson.scripts[scriptName]) {
        // Script novo - adiciona
        packageJson.scripts[scriptName] = scriptCommand
        addedCount++
        addedScripts.push(scriptName)
        log(`➕ Novo script: ${scriptName}`, 'green')
      } else if (packageJson.scripts[scriptName] !== scriptCommand) {
        // Script existe mas está desatualizado - atualiza
        packageJson.scripts[scriptName] = scriptCommand
        updatedCount++
        updatedScripts.push(scriptName)
        log(`🔄 Script atualizado: ${scriptName}`, 'yellow')
      }
    }

    // Salva package.json se houve mudanças
    if (addedCount > 0 || updatedCount > 0) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

      if (addedCount > 0) {
        log(`✅ ${addedCount} novos scripts adicionados ao package.json`, 'green')
      }
      if (updatedCount > 0) {
        log(`✅ ${updatedCount} scripts atualizados no package.json`, 'green')
      }
    } else {
      log('✅ Todos os scripts já estão atualizados no package.json', 'green')
    }

    return { addedCount, updatedCount, addedScripts, updatedScripts }
  } catch (error) {
    log(`⚠️  Erro ao atualizar package.json: ${error.message}`, 'yellow')
    return { addedCount: 0, updatedCount: 0, addedScripts: [], updatedScripts: [] }
  }
}

// Função auxiliar para garantir a existência da pasta .infra
function ensureInfraDir(infraDir, infraDbDir) {
  if (!fs.existsSync(infraDir)) {
    if (fs.existsSync(infraDbDir)) {
      log('🔄 Infraestrutura antiga detectada (pasta infra-db/ existe)', 'yellow')
      log('📦 Criando pasta .infra/ e baixando scripts...', 'blue')
      fs.mkdirSync(infraDir, { recursive: true })
      log('✅ Pasta .infra/ criada', 'green')
    } else {
      log('❌ Pasta .infra não encontrada!', 'red')
      log('💡 Execute primeiro: npm run infra:setup', 'yellow')
      process.exit(1)
    }
  }
}

// Função auxiliar para baixar todos os scripts
async function downloadAllScripts(scripts, infraDir, extension) {
  const results = []
  for (const script of scripts) {
    const targetPath = path.join(infraDir, script.replace('.js', `.${extension}`))
    try {
      const res = await downloadScript(script, targetPath)
      results.push(res)
    } catch (error) {
      log(`❌ Erro ao baixar ${script}: ${error.message}`, 'red')
      process.exit(1)
    }
  }
  return results
}

// Função principal
async function main() {
  try {
    log('🔄 Atualizando scripts da infraestrutura...', 'blue')

    if (!fs.existsSync('package.json')) {
      log('❌ Este não é um projeto Node.js (package.json não encontrado)', 'red')
      process.exit(1)
    }

    const infraDir = path.join(process.cwd(), '.infra')
    const infraDbDir = path.join(process.cwd(), 'infra-db')

    ensureInfraDir(infraDir, infraDbDir)

    const isESModule = isESModuleProject()
    const extension = isESModule ? 'cjs' : 'js'

    log(
      `📦 Projeto ${isESModule ? 'ES Module' : 'CommonJS'} detectado - usando .${extension}`,
      'blue'
    )

    const downloadResults = await downloadAllScripts(SCRIPTS, infraDir, extension)

    const { addedCount, updatedCount, addedScripts, updatedScripts } =
      await updatePackageJsonScripts(extension)

    log('', 'reset')
    log('🎉 Atualização completa!', 'green')
    log('', 'reset')
    log('📋 Resumo da atualização:', 'blue')

    // Mostrar apenas scripts que foram criados ou atualizados
    const changed = (downloadResults || []).filter(
      r => r && (r.status === 'created' || r.status === 'updated')
    )
    const unchanged = (downloadResults || []).filter(r => r && r.status === 'unchanged')

    if (changed.length > 0) {
      changed.forEach(r =>
        log(`  ✅ ${r.status === 'created' ? 'Criado' : 'Atualizado'}: .infra/${r.name}`, 'green')
      )
    }
    if (unchanged.length > 0) {
      unchanged.forEach(r => log(`  ℹ️  Sem alterações: .infra/${r.name}`, 'blue'))
    }

    if (addedCount > 0 || updatedCount > 0) {
      log('', 'reset')
      log('📦 Scripts do package.json:', 'blue')
      if (addedCount > 0) {
        log(`  ➕ ${addedCount} novos scripts adicionados`, 'green')
        addedScripts.forEach(s => log(`    - ${s}`, 'green'))
      }
      if (updatedCount > 0) {
        log(`  🔄 ${updatedCount} scripts atualizados`, 'yellow')
        updatedScripts.forEach(s => log(`    - ${s}`, 'yellow'))
      }
    }

    log('', 'reset')
    log('💡 Agora você pode usar todos os comandos com as últimas melhorias!', 'yellow')
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
  downloadScript,
  generateInfraScripts,
  updatePackageJsonScripts,
  main
}
