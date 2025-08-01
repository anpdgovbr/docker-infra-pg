#!/usr/bin/env node

/**
 * Cross-Platform Setup Script
 * Funciona em Windows, macOS e Linux
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync, spawn } = require('child_process')
const os = require('os')

const SCRIPT_URL =
  'https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/setup-infra.sh'

// Detecta a plataforma
const isWindows = os.platform() === 'win32'
const isMacOS = os.platform() === 'darwin'
const isLinux = os.platform() === 'linux'

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

// Download do script
function downloadScript() {
  return new Promise((resolve, reject) => {
    https
      .get(SCRIPT_URL, (response) => {
        let data = ''
        response.on('data', (chunk) => (data += chunk))
        response.on('end', () => {
          const scriptPath = path.join(process.cwd(), 'setup-infra.sh')
          fs.writeFileSync(scriptPath, data)

          // No Unix, dar permissão de execução
          if (!isWindows) {
            try {
              execSync(`chmod +x "${scriptPath}"`)
            } catch (error) {
              log(
                `Aviso: Não foi possível dar permissão de execução: ${error.message}`,
                'yellow'
              )
            }
          }

          resolve(scriptPath)
        })
      })
      .on('error', reject)
  })
}

// Executa o script
function executeScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    let command, commandArgs

    if (isWindows) {
      // No Windows, usar Git Bash se disponível, senão WSL
      try {
        execSync('bash --version', { stdio: 'ignore' })
        command = 'bash'
        commandArgs = [scriptPath, ...args]
      } catch {
        try {
          execSync('wsl --version', { stdio: 'ignore' })
          command = 'wsl'
          commandArgs = ['bash', scriptPath, ...args]
        } catch {
          reject(new Error('Bash não encontrado. Instale Git Bash ou WSL.'))
          return
        }
      }
    } else {
      // macOS e Linux
      command = 'bash'
      commandArgs = [scriptPath, ...args]
    }

    log(`Executando: ${command} ${commandArgs.join(' ')}`, 'blue')

    const child = spawn(command, commandArgs, {
      stdio: 'inherit',
      shell: isWindows
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Script falhou com código: ${code}`))
      }
    })

    child.on('error', reject)
  })
}

// Limpeza
function cleanup(scriptPath) {
  try {
    fs.unlinkSync(scriptPath)
  } catch (error) {
    log(
      `Aviso: Não foi possível remover script temporário: ${error.message}`,
      'yellow'
    )
  }
}

// Sleep cross-platform
function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

// Função principal
async function main() {
  const args = process.argv.slice(2)

  try {
    log('🚀 Configurando infraestrutura PostgreSQL (Cross-Platform)', 'green')
    log(`📊 Plataforma detectada: ${os.platform()} ${os.arch()}`, 'blue')

    // Download do script
    log('⬇️  Baixando script de setup...', 'yellow')
    const scriptPath = await downloadScript()
    log('✅ Script baixado com sucesso!', 'green')

    // Execução
    log('🔧 Executando configuração...', 'yellow')
    await executeScript(scriptPath, args)
    log('✅ Configuração concluída!', 'green')

    // Limpeza
    cleanup(scriptPath)
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
  executeScript,
  sleep,
  isWindows,
  isMacOS,
  isLinux
}
