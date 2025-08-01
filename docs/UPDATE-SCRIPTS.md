# 🔄 Atualizando Scripts da Infraestrutura

## ❓ **Quando usar?**

Sempre que **atualizarmos scripts** no repositório da infraestrutura e você quiser ter as **últimas melhorias** no seu projeto.

## 🎯 **Comando**:

```bash
npm run infra:update
```

## 💡 **O que faz?**

1. ✅ **Detecta o tipo** do projeto (CommonJS ou ES Module)
2. ✅ **Baixa versões mais recentes** dos scripts:
   - `setup-cross-platform.js` (ou `.cjs`)
   - `docker-helper.js` (ou `.cjs`)
   - `db-helper.js` (ou `.cjs`)
3. ✅ **Preserva compatibilidade** usando extensão correta
4. ✅ **Atualiza apenas** os scripts, mantém configurações

## 📋 **Exemplo de uso**:

```bash
# No seu projeto que já tem infraestrutura configurada
cd meu-projeto

# Atualizar para última versão dos scripts
npm run infra:update

# Agora pode usar melhorias mais recentes
npm run infra:up
```

## 🔍 **Output esperado**:

```
🔄 Atualizando scripts da infraestrutura...
📦 Projeto ES Module detectado - usando .cjs
✅ Atualizado: setup-cross-platform.cjs
✅ Atualizado: docker-helper.cjs
✅ Atualizado: db-helper.cjs

🎉 Todos os scripts foram atualizados!

📋 Scripts atualizados:
  ✅ .infra/setup-cross-platform.cjs
  ✅ .infra/docker-helper.cjs
  ✅ .infra/db-helper.cjs

💡 Agora você pode usar os comandos com as últimas melhorias!
```

## ⚠️ **Requisitos**:

- ✅ Projeto Node.js com `package.json`
- ✅ Pasta `.infra/` já existir (criada pelo `infra:setup`)
- ✅ Conexão com internet para baixar scripts

## 🆚 **Diferença dos comandos**:

| Comando                     | Quando usar                                 |
| --------------------------- | ------------------------------------------- |
| `npm run infra:setup`       | **Primeira vez** - configura tudo           |
| `npm run infra:update`      | **Atualizar scripts** - mantém configuração |
| `npm run infra:setup:force` | **Recriar tudo** - nova configuração        |

---

**💡 Dica**: Execute `npm run infra:update` periodicamente para ter sempre as últimas melhorias e correções!
