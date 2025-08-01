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

const SCRIPTS = [
  'setup-cross-platform.js',
  'docker-helper.js', 
  'db-helper.js'
]

// Download de um script
function downloadScript(scriptName, targetPath) {
  return new Promise((resolve, reject) => {
    const url = `${REPO_BASE}/${scriptName}`
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`))
        return
      }

      let data = ''
      response.on('data', (chunk) => data += chunk)
      response.on('end', () => {
        try {
          fs.writeFileSync(targetPath, data)
          log(`✅ Atualizado: ${path.basename(targetPath)}`, 'green')
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }).on('error', reject)
  })
}

// Função principal
async function main() {
  try {
    log('🔄 Atualizando scripts da infraestrutura...', 'blue')

    // Verifica se é projeto Node.js
    if (!fs.existsSync('package.json')) {
      log('❌ Este não é um projeto Node.js (package.json não encontrado)', 'red')
      process.exit(1)
    }

    // Verifica se pasta .infra existe
    const infraDir = path.join(process.cwd(), '.infra')
    if (!fs.existsSync(infraDir)) {
      log('❌ Pasta .infra não encontrada!', 'red')
      log('💡 Execute primeiro: npm run infra:setup', 'yellow')
      process.exit(1)
    }

    // Detecta extensão correta
    const isESModule = isESModuleProject()
    const extension = isESModule ? 'cjs' : 'js'
    
    log(`📦 Projeto ${isESModule ? 'ES Module' : 'CommonJS'} detectado - usando .${extension}`, 'blue')

    // Baixa cada script
    for (const script of SCRIPTS) {
      const targetPath = path.join(infraDir, script.replace('.js', `.${extension}`))
      
      try {
        await downloadScript(script, targetPath)
      } catch (error) {
        log(`❌ Erro ao baixar ${script}: ${error.message}`, 'red')
        process.exit(1)
      }
    }

    log('', 'reset')
    log('🎉 Todos os scripts foram atualizados!', 'green')
    log('', 'reset')
    log('📋 Scripts atualizados:', 'blue')
    SCRIPTS.forEach(script => {
      const fileName = script.replace('.js', `.${extension}`)
      log(`  ✅ .infra/${fileName}`, 'green')
    })
    log('', 'reset')
    log('💡 Agora você pode usar os comandos com as últimas melhorias!', 'yellow')

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
