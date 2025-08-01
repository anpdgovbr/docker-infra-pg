# 📝 Atualizações na Documentação

## ✅ **Principais Correções Realizadas**

### 1. **Comandos `curl` corrigidos**

❌ **Problema**: Comando antigo criava pasta `-p` no PowerShell

```bash
mkdir -p .infra 2>/dev/null || mkdir .infra 2>nul && curl -sSL url > arquivo
```

✅ **Solução**: Usar parâmetro `-o` do curl

```bash
curl -sSL url -o .infra/arquivo.js
```

### 2. **ES Modules suportados**

❌ **Problema**: Projetos com `"type": "module"` falhavam

```
Error [ERR_REQUIRE_ESM]: require() of ES modules is not supported
```

✅ **Solução**: Auto-detecção e uso de extensão `.cjs`

```bash
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node
```

### 3. **Migração de bash para Node.js**

❌ **Antigo**: Dependia de bash/Git Bash

```bash
curl -sSL url/setup-infra.sh | bash
```

✅ **Novo**: 100% Node.js cross-platform

```bash
# Projetos CommonJS (padrão)
curl -sSL url/auto-setup.js | node

# Projetos ES Module (type: "module")
curl -sSL url/auto-setup.js -o temp-setup.cjs && node temp-setup.cjs && del temp-setup.cjs
```

### 4. **Problema `curl | node` em ES Modules**

❌ **Problema**: `curl | node` falha em projetos ES Module

```
To load an ES module, set "type": "module" in package.json
```

✅ **Solução**: Usar arquivo temporário com extensão `.cjs`

```bash
curl -sSL url -o temp-setup.cjs && node temp-setup.cjs && del temp-setup.cjs
```

## 🎯 **Status da Documentação**

### ✅ **Arquivos Atualizados**

- `README.md` - Comando principal corrigido
- `SCRIPTS-PACKAGE-JSON.md` - Comandos curl corrigidos + seção de problemas
- `REPLICAR-EM-PROJETOS.md` - Migração para auto-setup.js

### ⚠️ **Arquivos que precisam de revisão completa**

- `CI-CD.md` - Ainda referencia setup-infra.sh
- `CROSS-PLATFORM.md` - Menciona bash em várias seções
- Outros arquivos .md com referências antigas

## 🚀 **Comando Recomendado Atual**

```bash
# Setup automático - funciona em qualquer OS
curl -sSL https://raw.githubusercontent.com/anpdgovbr/docker-infra-pg/main/auto-setup.js | node

# Depois usar:
npm run infra:setup  # Configura infraestrutura
npm run dev          # Desenvolvimento
```

## 📋 **TODO - Próximas Atualizações**

1. [ ] Atualizar CI-CD.md com comandos Node.js
2. [ ] Revisar CROSS-PLATFORM.md
3. [ ] Verificar outros arquivos .md
4. [ ] Criar exemplos específicos para ES Modules
5. [ ] Documentar troubleshooting PowerShell

---

_Documento criado em 01/08/2025 após correções dos scripts cross-platform_
