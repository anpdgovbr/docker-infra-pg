#!/usr/bin/env node

/**
 * Quick Setup - Cross-Platform Auto-Detect
 * Detecta o SO automaticamente e executa o comando correto
 */

const { execSync } = require('child_process')
const os = require('os')
const fs = require('fs')

// Detecta o sistema operacional
const isWindows = os.platform() === 'win32'
const deleteCommand = isWindows ? 'del' : 'rm'

console.log(`🚀 Quick Setup Cross-Platform`)
console.log(`📊 SO detectado: ${os.platform()} ${os.arch()}`)

// Verifica se há package.json no diretório atual
if (!fs.existsSync('package.json')) {
  console.log(`⚠️  Nenhum package.json encontrado no diretório atual`)
  console.log(`💡 Este comando deve ser executado na raiz de um projeto Node.js`)
  console.log(`📂 Diretório atual: ${process.cwd()}`)
  process.exit(1)
}

try {
  // URL do script
  const scriptUrl = 'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js'

  // Comando cross-platform
  const command = `curl -sSL ${scriptUrl} -o temp-setup.cjs && node temp-setup.cjs && ${deleteCommand} temp-setup.cjs`

  console.log(`💻 Executando: ${command}`)

  // Executa o comando
  execSync(command, {
    stdio: 'inherit',
    shell: true
  })

  console.log(`✅ Setup concluído!`)
} catch (error) {
  console.error(`❌ Erro durante setup:`, error.message)
  process.exit(1)
}
