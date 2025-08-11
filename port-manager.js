#!/usr/bin/env node

/**
 * Port Manager - Gerenciamento inteligente de portas
 * Detecta portas em uso e sugere portas disponíveis para PostgreSQL
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const net = require('net')

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

// Testa se uma porta está disponível
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.listen(port, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })

    server.on('error', () => {
      resolve(false)
    })
  })
}

// Busca portas PostgreSQL já em uso por outros projetos ANPD
function findUsedPostgresPorts() {
  const usedPorts = new Set()

  try {
    // Busca containers Docker PostgreSQL ativos
    const dockerOutput = execSync(
      'docker ps --format "table {{.Names}}\\t{{.Ports}}" --filter "ancestor=postgres"',
      { encoding: 'utf8', stdio: 'pipe' }
    )

    const lines = dockerOutput.split('\n')
    for (const line of lines) {
      const portMatch = line.match(/(\d+)->5432\/tcp/)
      if (portMatch) {
        usedPorts.add(parseInt(portMatch[1]))
      }
    }
  } catch (error) {
    // Ignora erro se Docker não estiver disponível ou não houver containers
  }

  // Busca em arquivos de configuração de outros projetos ANPD
  try {
    const homeDir = require('os').homedir()
    const possiblePaths = [
      path.join(homeDir, 'anpdgovbr'),
      path.join(homeDir, 'projects'),
      path.join(homeDir, 'workspace'),
      '/home/anpdadmin',
      process.cwd().replace(/[^/\\]+$/, '') // Diretório pai
    ]

    for (const basePath of possiblePaths) {
      if (fs.existsSync(basePath)) {
        const projects = fs
          .readdirSync(basePath, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name)

        for (const project of projects) {
          const projectPath = path.join(basePath, project)
          const envPath = path.join(projectPath, '.env')
          const dockerComposePath = path.join(
            projectPath,
            'infra-db',
            'docker-compose.yml'
          )

          // Verifica .env
          if (fs.existsSync(envPath)) {
            try {
              const envContent = fs.readFileSync(envPath, 'utf8')
              const portMatch = envContent.match(/DATABASE_URL="[^"]*:(\d+)\//)
              if (portMatch) {
                usedPorts.add(parseInt(portMatch[1]))
              }
            } catch (error) {
              // Ignora erro de leitura
            }
          }

          // Verifica docker-compose.yml
          if (fs.existsSync(dockerComposePath)) {
            try {
              const dockerContent = fs.readFileSync(dockerComposePath, 'utf8')
              const portMatch = dockerContent.match(/- "(\d+):5432"/)
              if (portMatch) {
                usedPorts.add(parseInt(portMatch[1]))
              }
            } catch (error) {
              // Ignora erro de leitura
            }
          }
        }
      }
    }
  } catch (error) {
    // Ignora erro de busca em diretórios
  }

  return Array.from(usedPorts).sort((a, b) => a - b)
}

// Encontra a próxima porta disponível
async function findAvailablePort(startPort = 5432) {
  const usedPorts = findUsedPostgresPorts()
  log(
    `🔍 Portas PostgreSQL já em uso: ${
      usedPorts.length > 0 ? usedPorts.join(', ') : 'nenhuma'
    }`,
    'blue'
  )

  let testPort = startPort
  const maxAttempts = 100

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    if (!usedPorts.includes(testPort)) {
      const available = await isPortAvailable(testPort)
      if (available) {
        return testPort
      }
    }
    testPort++
  }

  throw new Error(
    `Não foi possível encontrar uma porta disponível após ${maxAttempts} tentativas`
  )
}

// Lê configuração de porta salva
function getSavedPort(projectName) {
  try {
    const configPath = path.join(process.cwd(), '.infra', 'port-config.json')
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      return config.port
    }
  } catch (error) {
    // Ignora erro de leitura
  }
  return null
}

// Salva configuração de porta
function savePortConfig(port, projectName) {
  try {
    const infraDir = path.join(process.cwd(), '.infra')
    if (!fs.existsSync(infraDir)) {
      fs.mkdirSync(infraDir, { recursive: true })
    }

    const configPath = path.join(infraDir, 'port-config.json')
    const config = {
      port: port,
      project: projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    log(`💾 Configuração de porta salva: ${port}`, 'green')
  } catch (error) {
    log(`⚠️  Não foi possível salvar configuração: ${error.message}`, 'yellow')
  }
}

// Detecta nome do projeto
function getProjectName() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      return packageJson.name || path.basename(process.cwd())
    }
  } catch (error) {
    // Ignora erro
  }

  return path.basename(process.cwd())
}

// Função principal para obter porta inteligente
async function getSmartPort(forceNew = false) {
  const projectName = getProjectName()
  log(`🏗️  Projeto: ${projectName}`, 'blue')

  // Se não forçar nova porta, tenta usar a salva
  if (!forceNew) {
    const savedPort = getSavedPort(projectName)
    if (savedPort) {
      const available = await isPortAvailable(savedPort)
      if (available) {
        log(`✅ Usando porta salva: ${savedPort}`, 'green')
        return savedPort
      } else {
        log(
          `⚠️  Porta salva ${savedPort} não está mais disponível, buscando nova...`,
          'yellow'
        )
      }
    }
  }

  // Busca nova porta disponível
  const port = await findAvailablePort()
  log(`🎯 Nova porta encontrada: ${port}`, 'green')

  // Salva a nova configuração
  savePortConfig(port, projectName)

  return port
}

// Interface CLI
async function main() {
  try {
    const args = process.argv.slice(2)
    const forceNew = args.includes('--force') || args.includes('-f')
    const showUsed = args.includes('--show-used') || args.includes('-s')

    if (showUsed) {
      log('🔍 Analisando portas PostgreSQL em uso...', 'blue')
      const usedPorts = findUsedPostgresPorts()
      if (usedPorts.length > 0) {
        log(`📊 Portas em uso: ${usedPorts.join(', ')}`, 'yellow')
      } else {
        log('✅ Nenhuma porta PostgreSQL em uso detectada', 'green')
      }
      return
    }

    log('🤖 Port Manager - Detecção Inteligente de Porta PostgreSQL', 'blue')
    log('', 'reset')

    const port = await getSmartPort(forceNew)

    log('', 'reset')
    log(`🎉 Porta recomendada: ${port}`, 'green')
    log('', 'reset')
    log('💡 Esta porta será usada automaticamente na configuração!', 'yellow')

    // Exporta a porta para uso em scripts
    process.stdout.write(`${port}`)
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
  getSmartPort,
  findAvailablePort,
  findUsedPostgresPorts,
  isPortAvailable,
  getSavedPort,
  savePortConfig,
  getProjectName
}
