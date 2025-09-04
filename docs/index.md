# 📚 Documentação - Docker PostgreSQL Infrastructure ANPD

> **Infraestrutura PostgreSQL moderna, automatizada e multiplataforma para projetos da ANPD**

## 🚀 Como Navegar Nesta Documentação

### 🟢 **Iniciante** - Primeiros Passos

**Comece aqui se é sua primeira vez com a infraestrutura**

- [`inicio-rapido.md`](inicio-rapido.md) - **Setup em 5 minutos** com exemplos práticos
- [`instalacao-projetos.md`](instalacao-projetos.md) - **Integrar em projetos existentes** sem quebrar nada

### 🟡 **Intermediário** - Uso Cotidiano

**Para quem já usa e quer dominar as funcionalidades**

- [`comandos.md`](comandos.md) - **Referência completa** de todos os comandos disponíveis
- [`gerenciamento-portas.md`](gerenciamento-portas.md) - **Como funciona** a detecção inteligente de portas
- [`compatibilidade.md`](compatibilidade.md) - **Windows, macOS, Linux** e projetos ES Modules

### 🔴 **Avançado** - Domínio Completo

**Para casos complexos, CI/CD e troubleshooting**

- [`guia-completo.md`](guia-completo.md) - **Guia técnico aprofundado** com todos os recursos
- [`ci-cd.md`](ci-cd.md) - **Pipelines** e automação (GitHub Actions, GitLab CI, Jenkins)
- [`solucao-problemas.md`](solucao-problemas.md) - **Troubleshooting** para resolver qualquer problema

## 🎯 Acesso Rápido por Necessidade

### 💡 "Quero começar agora"

→ [`inicio-rapido.md`](inicio-rapido.md)

### 🔧 "Tenho um projeto e quero adicionar a infra"

→ [`instalacao-projetos.md`](instalacao-projetos.md)

### ❓ "Esqueci como usar um comando"

→ [`comandos.md`](comandos.md)

### 🐛 "Algo não está funcionando"

→ [`solucao-problemas.md`](solucao-problemas.md)

### 🚀 "Quero configurar no CI/CD"

→ [`ci-cd.md`](ci-cd.md)

### 🔌 "Múltiplos projetos na mesma VM"

→ [`gerenciamento-portas.md`](gerenciamento-portas.md)

### 🌍 "Problemas no Windows/macOS"

→ [`compatibilidade.md`](compatibilidade.md)

## ⭐ Recursos Destacados

### 🤖 **Setup Automático**

```bash
# Um comando configura tudo
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

### 🔌 **Múltiplos Projetos**

```bash
Projeto A: localhost:5432 ✅
Projeto B: localhost:5433 ✅ (auto-detectado)
Projeto C: localhost:5434 ✅ (auto-detectado)
```

### 🌍 **100% Cross-Platform**

- Windows (PowerShell, CMD, Git Bash)
- macOS (Terminal, iTerm2)
- Linux (bash, zsh, fish)
- CI/CD (GitHub Actions, GitLab CI)

## 💡 Dicas de Leitura

- **Resumos executivos**: Cada guia começa com um resumo do que você vai aprender
- **Exemplos práticos**: Todos os comandos têm exemplos reais de uso
- **Links cruzados**: Seções conectadas para aprofundamento natural
- **Nível de complexidade**: 🟢 Básico | 🟡 Intermediário | 🔴 Avançado

## 🆘 Precisa de Ajuda?

- 🐛 **Bug ou problema**: [GitHub Issues](https://github.com/anpdgovbr/docker-infra-pg/issues)
- 💬 **Dúvidas gerais**: [GitHub Discussions](https://github.com/anpdgovbr/docker-infra-pg/discussions)
- 📖 **Documentação**: Você está aqui! Use a navegação acima

---

**Comece por [`inicio-rapido.md`](inicio-rapido.md) e em 5 minutos você terá a infraestrutura funcionando!** 🚀
