# 📚 Documentação Completa - Docker PostgreSQL Infrastructure

## 🚀 Início Rápido

- **[README Principal](../README.md)** - Configuração rápida e visão geral
- **[Setup em 1 Comando](../README.md#-setup-rápido-universal)** - Configuração automática
- **[Múltiplos Projetos](#-múltiplos-projetos-na-mesma-vm)** - Gerenciamento de portas inteligente

## 📖 Guias de Uso

- **[Como Usar](./guia-completo.md)** - Tutorial completo passo a passo
- **[Comandos Disponíveis](./comandos.md)** - Referência de todos os scripts NPM
- **[Solução de Problemas](./troubleshooting.md)** - Problemas comuns e soluções

## 🔧 Recursos Avançados

- **[Detecção Inteligente de Porta](./port-management.md)** - Sistema de portas automático
- **[Cross-Platform](./cross-platform.md)** - Windows, macOS, Linux
- **[CI/CD](./ci-cd.md)** - Integração com pipelines

## 🏗️ Para Desenvolvedores

- **[Arquitetura](./arquitetura.md)** - Como funciona internamente
- **[Contribuindo](./contribuindo.md)** - Como colaborar com o projeto
- **[API Reference](./api-reference.md)** - Referência das funções internas

## 🔐 Segurança

- **[Políticas de Segurança](./seguranca.md)** - Práticas de segurança implementadas
- **[Gerenciamento de Credenciais](./credenciais.md)** - Como são geradas e armazenadas

## 📋 Referência Rápida

### 🆕 Novidades v2.0

- ✅ **Detecção Inteligente de Porta** - Sem mais conflitos entre projetos
- ✅ **Smart Update** - Atualização que adiciona comandos novos ao package.json
- ✅ **Gerenciamento de Credenciais** - `infra:fix` e `infra:debug`
- ✅ **Nomes Únicos** - Containers e redes isolados por projeto

### 🔌 Múltiplos Projetos na Mesma VM

O sistema automaticamente detecta portas em uso e atribui uma porta livre para cada projeto:

```bash
# Projeto 1: backlog-dim
PORT: 5432 (primeira instalação)

# Projeto 2: controladores-api
PORT: 5433 (detecta 5432 em uso, usa próxima disponível)

# Projeto 3: outro-projeto
PORT: 5434 (detecta 5432, 5433 em uso)
```

**Configuração automática:**

- ✅ Containers com nomes únicos: `projeto-postgres`
- ✅ Redes isoladas: `projeto_network`
- ✅ Portas salvas: `.infra/port-config.json`
- ✅ Restauração automática da porta após restart

### 📦 Comandos Essenciais

```bash
# Setup inicial
npm run infra:setup

# Múltiplos projetos (detecção automática)
npm run infra:setup        # Projeto 1: porta 5432
npm run infra:setup        # Projeto 2: porta 5433 (auto)

# Atualização inteligente (nova!)
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/smart-update.js | node

# Solução de problemas
npm run infra:debug        # Diagnosticar problemas
npm run infra:fix          # Corrigir credenciais

# Gerenciamento diário
npm run infra:up           # Subir banco
npm run infra:down         # Parar banco
npm run infra:logs         # Ver logs
```

## 🤝 Suporte

- **[Issues](https://github.com/anpdgovbr/docker-infra-pg/issues)** - Reportar bugs ou sugerir melhorias
- **[Discussões](https://github.com/anpdgovbr/docker-infra-pg/discussions)** - Tirar dúvidas e discutir ideias
