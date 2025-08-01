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
          // Criar pasta .infra se não existir
          const infraDir = path.join(process.cwd(), '.infra')
          if (!fs.existsSync(infraDir)) {
            fs.mkdirSync(infraDir, { recursive: true })
          }

          // Salvar script na pasta .infra em vez da raiz
          const scriptPath = path.join(infraDir, 'setup-infra.sh')
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

// Converte caminho Windows para formato Unix (para Git Bash)
function convertToUnixPath(windowsPath) {
  if (!isWindows) return windowsPath

  // Converte C:\path\to\file para /c/path/to/file
  return windowsPath
    .replace(/^([A-Z]):\\/, '/$1/')
    .replace(/\\/g, '/')
    .toLowerCase()
}

// Executa comandos Docker diretamente (sem bash)
function executeDockerCommands(args = []) {
  return new Promise((resolve, reject) => {
    try {
      log('🐳 Executando comandos Docker diretamente...', 'yellow')

      // Verifica se Docker está disponível
      execSync('docker --version', { stdio: 'ignore' })
      log('✅ Docker encontrado', 'green')

      // Verifica se Docker Compose está disponível
      execSync('docker compose version', { stdio: 'ignore' })
      log('✅ Docker Compose encontrado', 'green')

      // Cria pasta infra-db se não existir
      const infraDbPath = path.join(process.cwd(), 'infra-db')
      if (!fs.existsSync(infraDbPath)) {
        fs.mkdirSync(infraDbPath, { recursive: true })
        log('✅ Pasta infra-db criada', 'green')
      }

      // Cria docker-compose.yml
      const dockerComposeContent = `version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: postgres-dev
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-dev_db}
      POSTGRES_USER: \${POSTGRES_USER:-dev_user}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-dev_password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - dev_network

volumes:
  postgres_data:

networks:
  dev_network:
    driver: bridge
`

      const dockerComposePath = path.join(infraDbPath, 'docker-compose.yml')
      fs.writeFileSync(dockerComposePath, dockerComposeContent)
      log('✅ docker-compose.yml criado', 'green')

      // Cria .env
      const envContent = `# PostgreSQL Configuration
POSTGRES_DB=dev_db
POSTGRES_USER=dev_user
POSTGRES_PASSWORD=dev_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/dev_db"
`

      const envPath = path.join(infraDbPath, '.env')
      if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envContent)
        log('✅ .env criado', 'green')
      } else {
        log('✅ .env já existe', 'green')
      }

      log('✅ Infraestrutura configurada com sucesso!', 'green')
      resolve()
    } catch (error) {
      if (error.message.includes('docker')) {
        reject(
          new Error(
            'Docker não encontrado. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop'
          )
        )
      } else {
        reject(error)
      }
    }
  })
}

// Executa o script
function executeScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    // No Windows, usar comandos Docker diretos em vez de bash
    if (isWindows) {
      executeDockerCommands(args).then(resolve).catch(reject)
      return
    }

    // Para macOS e Linux, usar o método original com bash
    let command, commandArgs

    // macOS e Linux
    command = 'bash'
    commandArgs = [scriptPath, ...args]

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

    if (isWindows) {
      // No Windows, usar comandos Docker diretos
      log('🔧 Executando configuração...', 'yellow')
      await executeScript(null, args)
      log('✅ Configuração concluída!', 'green')
    } else {
      // Para macOS e Linux, usar o método original com bash
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
    }
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
