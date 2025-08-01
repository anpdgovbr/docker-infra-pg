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
async function executeDockerCommands(args = []) {
  try {
    log('🐳 Executando comandos Docker diretamente...', 'yellow')

    // Processa argumentos
    const isManual = args.includes('--manual')
    const isForce = args.includes('--force')
    const isAuto = args.includes('--auto')

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

    // Lê .env do projeto para detectar valores existentes
    const projectEnvPath = path.join(process.cwd(), '.env')
    let existingEnvVars = {}

    if (fs.existsSync(projectEnvPath)) {
      const envContent = fs.readFileSync(projectEnvPath, 'utf8')
      envContent.split('\n').forEach((line) => {
        const [key, value] = line.split('=')
        if (key && value) {
          existingEnvVars[key.trim()] = value.replace(/"/g, '').trim()
        }
      })
      log('📖 Lendo variáveis existentes do .env do projeto', 'blue')
    }

    // Valores padrão baseados no nome do projeto
    const projectName = path
      .basename(process.cwd())
      .replace(/[@\/]/g, '')
      .replace(/-/g, '_')
    let dbName = existingEnvVars.POSTGRES_DB || `${projectName}_dev`
    let dbUser = existingEnvVars.POSTGRES_USER || 'dev_user'
    let dbPassword = existingEnvVars.POSTGRES_PASSWORD || 'dev_password'

    // Modo manual: perguntar ao usuário
    if (isManual && !isAuto) {
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      const question = (prompt) =>
        new Promise((resolve) => rl.question(prompt, resolve))

      log(
        '\n🔧 Modo manual ativado - Configure as variáveis do banco:',
        'yellow'
      )

      const inputDbName = await question(`📁 Nome do banco [${dbName}]: `)
      if (inputDbName.trim()) dbName = inputDbName.trim()

      const inputDbUser = await question(`👤 Usuário do banco [${dbUser}]: `)
      if (inputDbUser.trim()) dbUser = inputDbUser.trim()

      const inputDbPassword = await question(
        `🔒 Senha do banco [${dbPassword}]: `
      )
      if (inputDbPassword.trim()) dbPassword = inputDbPassword.trim()

      rl.close()

      log('\n✅ Configuração manual concluída!', 'green')
    } else {
      // Modo automático
      if (!isForce && !existingEnvVars.POSTGRES_DB) {
        log(
          '⚠️  Usando valores padrão. Use --manual para configurar ou --force para continuar',
          'yellow'
        )
      }
    }

    // Cria docker-compose.yml
    const dockerComposeContent = `version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: postgres-dev
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-${dbName}}
      POSTGRES_USER: \${POSTGRES_USER:-${dbUser}}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-${dbPassword}}
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

    // Cria/atualiza .env da infraestrutura
    const infraEnvContent = `# PostgreSQL Configuration
POSTGRES_DB=${dbName}
POSTGRES_USER=${dbUser}
POSTGRES_PASSWORD=${dbPassword}
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL="postgresql://${dbUser}:${dbPassword}@localhost:5432/${dbName}"
`

    const infraEnvPath = path.join(infraDbPath, '.env')
    fs.writeFileSync(infraEnvPath, infraEnvContent)
    log('✅ .env da infraestrutura criado', 'green')

    // Sincroniza com .env do projeto (preserva outras variáveis)
    let projectEnvContent = ''
    if (fs.existsSync(projectEnvPath)) {
      projectEnvContent = fs.readFileSync(projectEnvPath, 'utf8')
    }

    // Atualiza ou adiciona variáveis do PostgreSQL
    const updateEnvVar = (content, key, value) => {
      const regex = new RegExp(`^${key}=.*$`, 'm')
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`)
      } else {
        return content + `\n${key}=${value}`
      }
    }

    projectEnvContent = updateEnvVar(projectEnvContent, 'POSTGRES_DB', dbName)
    projectEnvContent = updateEnvVar(projectEnvContent, 'POSTGRES_USER', dbUser)
    projectEnvContent = updateEnvVar(
      projectEnvContent,
      'POSTGRES_PASSWORD',
      dbPassword
    )
    projectEnvContent = updateEnvVar(
      projectEnvContent,
      'POSTGRES_HOST',
      'localhost'
    )
    projectEnvContent = updateEnvVar(projectEnvContent, 'POSTGRES_PORT', '5432')
    projectEnvContent = updateEnvVar(
      projectEnvContent,
      'DATABASE_URL',
      `"postgresql://${dbUser}:${dbPassword}@localhost:5432/${dbName}"`
    )

    fs.writeFileSync(projectEnvPath, projectEnvContent)
    log('✅ .env do projeto sincronizado', 'green')

    log('✅ Infraestrutura configurada com sucesso!', 'green')
  } catch (error) {
    if (error.message.includes('docker')) {
      throw new Error(
        'Docker não encontrado. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop'
      )
    } else {
      throw error
    }
  }
}

// Executa o script
async function executeScript(scriptPath, args = []) {
  // No Windows, usar comandos Docker diretos em vez de bash
  if (isWindows) {
    await executeDockerCommands(args)
    return
  }

  // Para macOS e Linux, usar o método original com bash
  return new Promise((resolve, reject) => {
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
