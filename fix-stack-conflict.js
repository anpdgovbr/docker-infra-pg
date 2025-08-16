#!/usr/bin/env node

/**
 * Fix Stack Conflict - Corrige conflitos de stack entre projetos
 * Problema: Múltiplos projetos usando "infra-db" sobrepõem containers
 * Solução: Adiciona nome único da stack no docker-compose.yml
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
  cyan: '\x1b[36m',
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

// Detecta conflitos de stack
function detectStackConflicts() {
  log('🔍 Detectando conflitos de stack Docker...', 'blue')

  try {
    // Listar todas as stacks Docker Compose ativas
    const result = execSync(
      'docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Ports}}" --filter "name=postgres"',
      {
        encoding: 'utf8',
        stdio: 'pipe'
      }
    )

    const lines = result.split('\n').filter(line => line.trim() && !line.startsWith('NAMES'))
    const postgresContainers = lines.map(line => {
      const [name, image, ports] = line.split('\t')
      const port = ports ? ports.match(/:(\d+)->/)?.[1] || 'N/A' : 'N/A'
      return { name: name.trim(), image: image.trim(), port }
    })

    if (postgresContainers.length === 0) {
      log('✅ Nenhum container PostgreSQL ativo encontrado', 'green')
      return false
    }

    log(`📊 Containers PostgreSQL ativos: ${postgresContainers.length}`, 'cyan')
    postgresContainers.forEach(container => {
      log(`   📦 ${container.name} (porta: ${container.port})`, 'reset')
    })

    // Verificar se há containers com nomes genéricos (indicando conflito de stack)
    const genericNames = postgresContainers.filter(
      c => c.name.includes('infra-db') || c.name === 'postgres' || c.name.startsWith('infra_')
    )

    if (genericNames.length > 0) {
      log('🚨 Detectados containers com nomes genéricos (possível conflito):', 'yellow')
      genericNames.forEach(container => {
        log(`   ⚠️  ${container.name} (porta: ${container.port})`, 'yellow')
      })
      return true
    }

    return false
  } catch (error) {
    log(`⚠️  Erro ao detectar conflitos: ${error.message}`, 'yellow')
    // Opcional: log detalhado para depuração
    // log(error.stack, 'yellow')
    return false
  }
}

// Corrige o docker-compose.yml adicionando nome único da stack
function fixStackName() {
  const dockerComposePath = path.join('infra-db', 'docker-compose.yml')

  if (!fs.existsSync(dockerComposePath)) {
    log('❌ docker-compose.yml não encontrado em infra-db/', 'red')
    return false
  }

  let content = fs.readFileSync(dockerComposePath, 'utf8')
  log('🔧 Analisando docker-compose.yml...', 'blue')

  // Verificar se já tem nome da stack
  if (content.includes('name:') && content.match(/^name:\s*.+-stack\s*$/m)) {
    log('✅ Stack já tem nome único configurado!', 'green')
    return true
  }

  // Gerar nome único baseado no projeto
  const projectName = sanitizeName(path.basename(process.cwd()))
  const stackName = `${projectName}-stack`

  log(`🏷️  Configurando nome da stack: ${stackName}`, 'cyan')

  // Remover version obsoleta se existir
  content = content.replace(/^version:\s*['"][^'"]*['"]?\s*\n/m, '')

  // Adicionar nome da stack
  if (content.includes('name:')) {
    // Substituir nome existente
    content = content.replace(/^name:\s*.*$/m, `name: ${stackName}`)
  } else {
    // Adicionar nome no início
    content = `name: ${stackName}\n\n${content}`
  }

  // Salvar arquivo corrigido
  fs.writeFileSync(dockerComposePath, content)
  log('✅ docker-compose.yml corrigido com nome único da stack!', 'green')

  return true
}

// Para containers conflitantes e os reconstrói
async function recreateInfrastructure() {
  log('🔄 Recriando infraestrutura com isolamento...', 'blue')

  try {
    // Parar infraestrutura atual
    log('🛑 Parando infraestrutura atual...', 'yellow')
    try {
      execSync('npm run infra:down', { stdio: 'pipe', cwd: process.cwd() })
    } catch {
      // Tentar parar manualmente
      try {
        execSync('cd infra-db && docker-compose down', { stdio: 'pipe' })
      } catch (manualError) {
        log('⚠️  Infraestrutura já estava parada', 'yellow')
        log(`Detalhe do erro: ${manualError.message}`, 'yellow')
        // Tratar explicitamente o erro: interromper o fluxo se necessário
        return
      }
    }

    // Aguardar um pouco
    log('⏳ Aguardando limpeza...', 'blue')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Subir com novo nome
    log('🚀 Subindo infraestrutura com nome único...', 'green')
    execSync('npm run infra:up', { stdio: 'inherit', cwd: process.cwd() })

    log('✅ Infraestrutura recriada com sucesso!', 'green')
    return true
  } catch (error) {
    log(`❌ Erro ao recriar infraestrutura: ${error.message}`, 'red')

    // Tentar método manual
    log('🔧 Tentando método manual...', 'blue')
    try {
      execSync('cd infra-db && docker-compose up -d', { stdio: 'inherit' })
      log('✅ Infraestrutura criada via método manual!', 'green')
      return true
    } catch (manualError) {
      log(`❌ Método manual também falhou: ${manualError.message}`, 'red')
      return false
    }
  }
}

// Função principal
async function main() {
  log('🔧 Fix Stack Conflict: Resolvendo conflitos entre projetos...\n', 'cyan')

  try {
    // Verificar se estamos na raiz do projeto
    if (!fs.existsSync('package.json')) {
      log('❌ Execute este script na raiz do projeto (onde está o package.json)', 'red')
      process.exit(1)
    }

    const projectName = sanitizeName(path.basename(process.cwd()))
    log(`📦 Projeto atual: ${projectName}`, 'blue')

    // Detectar conflitos
    const hasConflicts = detectStackConflicts()

    // Corrigir docker-compose.yml
    if (!fixStackName()) {
      process.exit(1)
    }

    // Se havia conflitos, recriar infraestrutura
    if (hasConflicts) {
      log('\n🔄 Conflitos detectados. Recriando infraestrutura...', 'yellow')
      if (!(await recreateInfrastructure())) {
        process.exit(1)
      }
    } else {
      log('\n🎯 Nenhum conflito detectado, mas docker-compose.yml foi atualizado', 'green')
      log('💡 Reinicie a infraestrutura para aplicar as mudanças:', 'blue')
      log('   npm run infra:down && npm run infra:up', 'reset')
    }

    log('\n🎉 Correção de conflitos concluída!', 'green')
    log('\n📋 Verificação final:', 'blue')
    log('   1. npm run infra:status - Ver se está rodando', 'reset')
    log('   2. docker ps --filter "name=postgres" - Ver containers únicos', 'reset')
    log('   3. npm run infra:logs - Ver logs se houver problemas', 'reset')

    // Mostrar resumo da configuração
    log('\n📊 Configuração atual:', 'cyan')
    try {
      const envContent = fs.readFileSync('.env', 'utf8')
      const port = envContent.match(/DATABASE_URL.*localhost:(\d+)/)?.[1] || '5432'
      log(`   🎯 Porta: ${port}`, 'reset')
      log(`   🏷️  Stack: ${projectName}-stack`, 'reset')
      log(`   📦 Container: ${projectName}_postgres`, 'reset')
    } catch {
      log('   ⚠️  Não foi possível ler configuração do .env', 'yellow')
    }
  } catch (error) {
    log(`❌ Erro durante a correção: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { sanitizeName, detectStackConflicts, fixStackName }
