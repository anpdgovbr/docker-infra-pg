#!/usr/bin/env node

/**
 * Quick Fix - Corrige nomes de volumes Docker inválidos
 * Problema: volumes que começam com underscore (_) causam erro no Docker
 * Solução: Regenera docker-compose.yml com nomes válidos
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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

// Função para sanitizar nomes Docker
function sanitizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9]/g, '_') // Substituir caracteres especiais por underscore
    .replace(/^[^a-zA-Z0-9]+/, '') // Remover underscores, hífens do início
    .replace(/^$/, 'project') // Se vazio, usar 'project'
    .toLowerCase() // Docker prefere lowercase
}

// Lê e corrige docker-compose.yml
function fixDockerCompose() {
  const dockerComposePath = path.join('infra-db', 'docker-compose.yml')

  if (!fs.existsSync(dockerComposePath)) {
    log('❌ docker-compose.yml não encontrado em infra-db/', 'red')
    return false
  }

  let content = fs.readFileSync(dockerComposePath, 'utf8')
  log('🔍 Analisando docker-compose.yml...', 'blue')

  // Detectar volumes inválidos (que começam com underscore)
  const invalidVolumeRegex = /_\w*_postgres_data/g
  const invalidVolumes = content.match(invalidVolumeRegex) || []

  if (invalidVolumes.length === 0) {
    log('✅ Nenhum volume inválido encontrado!', 'green')
    return true
  }

  log(`🚨 Encontrados volumes inválidos: ${invalidVolumes.join(', ')}`, 'yellow')

  // Gerar nome válido baseado no projeto
  const projectName = sanitizeName(path.basename(process.cwd()))
  const validVolumeName = `${projectName}_postgres_data`
  const validNetworkName = `${projectName}_network`
  const validContainerName = `${projectName}_postgres`

  log(`🔧 Novo nome do volume: ${validVolumeName}`, 'green')
  log(`🔧 Novo nome da network: ${validNetworkName}`, 'green')
  log(`🔧 Novo nome do container: ${validContainerName}`, 'green')

  // Substituir nomes inválidos pelos válidos
  invalidVolumes.forEach(invalidName => {
    content = content.replace(new RegExp(invalidName, 'g'), validVolumeName)
  })

  // Corrigir network se necessário
  content = content.replace(/_\w*_network/g, validNetworkName)

  // Corrigir container se necessário
  content = content.replace(
    /container_name:\s*_\w*-postgres/g,
    `container_name: ${validContainerName}`
  )

  // Remover version obsoleta se existir
  content = content.replace(/^version:\s*['"][^'"]*['"]?\s*\n/, '')

  // Adicionar nome da stack se não existir
  if (!content.includes('name:')) {
    content = `name: ${projectName}-stack\n\n${content}`
  }

  // Salvar arquivo corrigido
  fs.writeFileSync(dockerComposePath, content)
  log('✅ docker-compose.yml corrigido!', 'green')

  return true
}

// Parar e remover containers/volumes antigos
function cleanupOldResources() {
  log('🧹 Limpando recursos antigos...', 'blue')

  try {
    // Parar todos os containers PostgreSQL com nomes inválidos
    const psResult = execSync('docker ps -a --format "{{.Names}}" --filter "name=postgres"', {
      encoding: 'utf8',
      stdio: 'pipe'
    })
    const containers = psResult.split('\n').filter(name => name.trim() && name.startsWith('_'))

    if (containers.length > 0) {
      log(`🛑 Parando containers inválidos: ${containers.join(', ')}`, 'yellow')
      containers.forEach(container => {
        try {
          execSync(`docker stop ${container}`, { stdio: 'pipe' })
          execSync(`docker rm ${container}`, { stdio: 'pipe' })
          log(`  ✅ ${container} removido`, 'green')
        } catch (error) {
          log(`  ⚠️ Erro ao remover ${container}: ${error.message}`, 'yellow')
        }
      })
    }

    // Remover volumes inválidos
    const volumesResult = execSync('docker volume ls --format "{{.Name}}"', {
      encoding: 'utf8',
      stdio: 'pipe'
    })
    const volumes = volumesResult
      .split('\n')
      .filter(name => name.trim() && name.startsWith('_') && name.includes('postgres'))

    if (volumes.length > 0) {
      log(`🗂️ Removendo volumes inválidos: ${volumes.join(', ')}`, 'yellow')
      volumes.forEach(volume => {
        try {
          execSync(`docker volume rm ${volume}`, { stdio: 'pipe' })
          log(`  ✅ ${volume} removido`, 'green')
        } catch (error) {
          log(`  ⚠️ Erro ao remover ${volume}: ${error.message}`, 'yellow')
        }
      })
    }

    // Remover networks inválidas
    const networksResult = execSync('docker network ls --format "{{.Name}}"', {
      encoding: 'utf8',
      stdio: 'pipe'
    })
    const networks = networksResult
      .split('\n')
      .filter(name => name.trim() && name.startsWith('_') && name.includes('network'))

    if (networks.length > 0) {
      log(`🌐 Removendo networks inválidas: ${networks.join(', ')}`, 'yellow')
      networks.forEach(network => {
        try {
          execSync(`docker network rm ${network}`, { stdio: 'pipe' })
          log(`  ✅ ${network} removida`, 'green')
        } catch (error) {
          log(`  ⚠️ Erro ao remover ${network}: ${error.message}`, 'yellow')
        }
      })
    }
  } catch (error) {
    log(`⚠️ Alguns recursos não puderam ser limpos: ${error.message}`, 'yellow')
  }
}

// Função principal
function main() {
  log('🔧 Quick Fix: Corrigindo nomes de volumes Docker inválidos...\n', 'blue')

  try {
    // Verificar se estamos na raiz do projeto
    if (!fs.existsSync('package.json')) {
      log('❌ Execute este script na raiz do projeto (onde está o package.json)', 'red')
      process.exit(1)
    }

    // Corrigir docker-compose.yml
    if (!fixDockerCompose()) {
      process.exit(1)
    }

    // Limpar recursos antigos
    cleanupOldResources()

    log('\n🎉 Correção concluída com sucesso!', 'green')
    log('\n📋 Próximos passos:', 'blue')
    log('   1. npm run infra:up', 'reset')
    log('   2. Aguarde a inicialização (~30s)', 'reset')
    log('   3. Teste: npm run infra:status', 'reset')
  } catch (error) {
    log(`❌ Erro durante a correção: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { sanitizeName, fixDockerCompose, cleanupOldResources }
