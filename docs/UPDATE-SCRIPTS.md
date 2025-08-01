# 🔄 Atualizando Scripts da Infraestrutura

## ❓ **Quando usar?**

Sempre que **atualizarmos scripts** no repositório da infraestrutura e você quiser ter as **últimas melhorias** no seu projeto.

**🆕 Funciona automaticamente** mesmo se for a primeira vez em projetos que já tinham infraestrutura antiga!

## 🎯 **Comando**:

```bash
npm run infra:update
```

## 💡 **O que faz?**

1. ✅ **Detecta o tipo** do projeto (CommonJS ou ES Module)
2. ✅ **Cria pasta `.infra/`** se não existir (mas pasta `infra-db/` existe)
3. ✅ **Baixa versões mais recentes** dos scripts:
   - `setup-cross-platform.js` (ou `.cjs`)
   - `docker-helper.js` (ou `.cjs`)
   - `db-helper.js` (ou `.cjs`)
4. ✅ **Atualiza package.json** se necessário (adiciona script `infra:update`)
5. ✅ **Corrige extensões** nos scripts existentes (.js ↔ .cjs)
6. ✅ **Preserva configurações** (não toca em .env, docker-compose.yml)## 📋 **Cenários de uso**:

### 🆕 **Primeira vez em projeto com infraestrutura antiga**:

```bash
cd meu-projeto-que-ja-tinha-infra
# Tem pasta infra-db/ mas não tem .infra/

npm run infra:update
# ✅ Detecta pasta infra-db/
# ✅ Cria pasta .infra/
# ✅ Baixa scripts atualizados
# ✅ Adiciona script infra:update ao package.json
```

### 🔄 **Atualização normal**:

```bash
cd meu-projeto

# Atualizar para última versão dos scripts
npm run infra:update
# ✅ Atualiza scripts existentes
# ✅ Corrige extensões se necessário

# Agora pode usar melhorias mais recentes
npm run infra:up
```

## 🔍 **Output esperado**:

### **Primeira vez (migração)**:

```
🔄 Atualizando scripts da infraestrutura...
🔄 Infraestrutura antiga detectada (pasta infra-db/ existe)
📦 Criando pasta .infra/ e baixando scripts...
✅ Pasta .infra/ criada
📦 Projeto ES Module detectado - usando .cjs
✅ Atualizado: setup-cross-platform.cjs
✅ Atualizado: docker-helper.cjs
✅ Atualizado: db-helper.cjs
📦 Adicionando script infra:update ao package.json...
✅ Script infra:update adicionado!

🎉 Todos os scripts foram atualizados!
```

### **Atualização normal**:

````
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
```## ⚠️ **Requisitos**:

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
````
