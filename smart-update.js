#!/usr/bin/env node

/**
 * Smart Update - Atualização inteligente da infraestrutura
 * Atualiza scripts E adiciona/atualiza scripts no package.json
 */

const fs = require('fs')
const https = require('https')
const _path = require('path')

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

// Função auxiliar para lidar com o fechamento do processo filho
function handleChildClose(tempFile, resolve, reject, code) {
  try {
    fs.unlinkSync(tempFile)
  } catch (error) {
    log(`⚠️  Aviso ao remover arquivo temporário: ${error.message}`, 'yellow')
  }

  if (code === 0) {
    resolve()
  } else {
    reject(new Error(`Processo terminou com código ${code}`))
  }
}

// Função auxiliar para executar o script baixado
function executeUpdateScript(tempFile, resolve, reject) {
  log('🚀 Executando atualização completa...', 'blue')
  const { spawn } = require('child_process')

  const child = spawn('node', [tempFile], {
    stdio: 'inherit',
    cwd: process.cwd()
  })

  child.on('close', code => handleChildClose(tempFile, resolve, reject, code))
  child.on('error', reject)
}

// Função auxiliar para processar o fim do download
function handleDownloadEnd(tempFile, data, resolve, reject) {
  try {
    fs.writeFileSync(tempFile, data)
    log('✅ Script de atualização baixado', 'green')
    executeUpdateScript(tempFile, resolve, reject)
  } catch (error) {
    reject(error)
  }
}

// Função auxiliar para processar a resposta HTTP
function handleHttpResponse(response, tempFile, resolve, reject, url) {
  if (response.statusCode !== 200) {
    reject(new Error(`HTTP ${response.statusCode}: ${url}`))
    return
  }

  let data = ''
  response.on('data', chunk => (data += chunk))
  response.on('end', () => handleDownloadEnd(tempFile, data, resolve, reject))
}

// Download do update-scripts.js e execução
async function downloadAndRunUpdate() {
  return new Promise((resolve, reject) => {
    const isESModule = isESModuleProject()
    const extension = isESModule ? 'cjs' : 'js'
    const tempFile = `.infra/update-scripts-temp.${extension}`

    log('🔄 Baixando script de atualização mais recente...', 'blue')

    // Cria pasta .infra se não existir
    if (!fs.existsSync('.infra')) {
      fs.mkdirSync('.infra', { recursive: true })
    }

    const url = 'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/update-scripts.js'

    https
      .get(url, response => handleHttpResponse(response, tempFile, resolve, reject, url))
      .on('error', reject)
  })
}

async function main() {
  try {
    log('🧠 Smart Update - Atualização Inteligente da Infraestrutura', 'green')
    log('', 'reset')

    // Verifica se é projeto Node.js
    if (!fs.existsSync('package.json')) {
      log('❌ Este não é um projeto Node.js (package.json não encontrado)', 'red')
      process.exit(1)
    }

    await downloadAndRunUpdate()

    log('', 'reset')
    log('🎉 Atualização inteligente concluída!', 'green')
    log('', 'reset')
    log('💡 Agora você pode usar:', 'blue')
    log('  npm run infra:fix    # Corrigir credenciais', 'yellow')
    log('  npm run infra:debug  # Diagnosticar problemas', 'yellow')
    log('  npx prisma migrate dev  # Testar conexão', 'yellow')
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { main }
