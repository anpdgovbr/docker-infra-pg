#!/usr/bin/env node

/**
 * Diagnóstico de Configuração - Debug de credenciais
 * Compara configurações do projeto com a infraestrutura
 */

const fs = require('fs')
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

// Lê variáveis de um arquivo .env
function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const vars = {}

    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/"/g, '').trim()
        vars[key.trim()] = value
      }
    })

    return vars
  } catch (error) {
    return null
  }
}

function main() {
  log('🔍 Diagnóstico de Configuração PostgreSQL', 'blue')
  log('', 'reset')

  // Verifica arquivos
  const projectEnvPath = path.join(process.cwd(), '.env')
  const infraEnvPath = path.join(process.cwd(), 'infra-db', '.env')

  log('📁 Verificando arquivos de configuração:', 'blue')

  // .env do projeto
  const projectEnv = readEnvFile(projectEnvPath)
  if (projectEnv) {
    log('✅ .env (projeto) encontrado', 'green')
  } else {
    log('❌ .env (projeto) não encontrado', 'red')
  }

  // .env da infraestrutura
  const infraEnv = readEnvFile(infraEnvPath)
  if (infraEnv) {
    log('✅ infra-db/.env encontrado', 'green')
  } else {
    log('❌ infra-db/.env não encontrado', 'red')
  }

  log('', 'reset')

  if (projectEnv) {
    log('📄 Configuração do projeto (.env):', 'blue')
    const projectDbVars = ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'DATABASE_URL']
    projectDbVars.forEach(key => {
      const value = projectEnv[key]
      if (value) {
        // Oculta senha parcialmente
        const displayValue = key.includes('PASSWORD')
          ? value.replace(/(.{2}).+(.{2})/, '$1***$2')
          : value
        log(`  ${key}: ${displayValue}`, 'reset')
      } else {
        log(`  ${key}: (não definido)`, 'yellow')
      }
    })
  }

  log('', 'reset')

  if (infraEnv) {
    log('🏗️  Configuração da infraestrutura (infra-db/.env):', 'blue')
    const infraDbVars = ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'DATABASE_URL']
    infraDbVars.forEach(key => {
      const value = infraEnv[key]
      if (value) {
        // Oculta senha parcialmente
        const displayValue = key.includes('PASSWORD')
          ? value.replace(/(.{2}).+(.{2})/, '$1***$2')
          : value
        log(`  ${key}: ${displayValue}`, 'reset')
      } else {
        log(`  ${key}: (não definido)`, 'yellow')
      }
    })
  }

  log('', 'reset')

  // Comparação
  if (projectEnv && infraEnv) {
    log('🔍 Comparação de credenciais:', 'blue')

    const compareVars = ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD']
    let mismatches = 0

    compareVars.forEach(key => {
      const projectVal = projectEnv[key]
      const infraVal = infraEnv[key]

      if (projectVal && infraVal) {
        if (projectVal === infraVal) {
          log(`  ✅ ${key}: Sincronizado`, 'green')
        } else {
          log(`  ❌ ${key}: Diferente!`, 'red')
          log(
            `    Projeto: ${
              key.includes('PASSWORD')
                ? projectVal.replace(/(.{2}).+(.{2})/, '$1***$2')
                : projectVal
            }`,
            'yellow'
          )
          log(
            `    Infra:   ${
              key.includes('PASSWORD') ? infraVal.replace(/(.{2}).+(.{2})/, '$1***$2') : infraVal
            }`,
            'yellow'
          )
          mismatches++
        }
      } else {
        log(`  ⚠️  ${key}: Faltando em um dos arquivos`, 'yellow')
        mismatches++
      }
    })

    log('', 'reset')

    if (mismatches === 0) {
      log('🎉 Todas as credenciais estão sincronizadas!', 'green')
    } else {
      log(`❌ ${mismatches} diferenças encontradas`, 'red')
      log('', 'reset')
      log('💡 Solução recomendada:', 'blue')
      log('  npm run infra:setup:force  # Regenera e sincroniza tudo', 'yellow')
      log('  OU', 'reset')
      log('  Copie as credenciais da infra-db/.env para .env', 'yellow')
    }
  }

  log('', 'reset')
  log('🐳 Status dos containers:', 'blue')

  // Verifica containers
  const infraDbPath = path.join(process.cwd(), 'infra-db')
  if (fs.existsSync(infraDbPath)) {
    try {
      const { execSync } = require('child_process')
      const output = execSync('docker-compose ps', {
        cwd: infraDbPath,
        encoding: 'utf8',
        stdio: 'pipe'
      })
      log(output.trim(), 'reset')
    } catch (error) {
      log('❌ Erro ao verificar containers:', 'red')
      log(error.message, 'yellow')
    }
  } else {
    log('❌ Pasta infra-db/ não encontrada', 'red')
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { readEnvFile, main }
