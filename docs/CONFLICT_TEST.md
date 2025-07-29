# 🧪 Teste de Conflitos - generate-local-sql vs Adição Sob Demanda

Este arquivo documenta os testes realizados para verificar se o `generate-local-sql.sh` quebra a funcionalidade de adição sob demanda.

## ❌ Problema Original Identificado

**ANTES da correção**, o script `generate-multi-app-sql.sh` tinha esta linha problemática:

```bash
# Remove arquivos SQL antigos
rm -f init/*-create-*-db.sql  # ❌ PERIGOSO!
```

Isso causava:

1. Adição manual de nova app → ✅ Funcionava
2. Execução de `generate-local-sql.sh` → ❌ **APAGAVA TUDO**
3. Perda de adições manuais → ❌ **CONFLITO DESTRUTIVO**

## ✅ Solução Implementada

### 1. **Preservação de Arquivos Existentes**

```bash
# SEGURANÇA: Não remove arquivos SQL existentes automaticamente
# Isso preserva adições manuais e permite adição sob demanda
```

### 2. **Detecção de Conflitos**

```bash
if [[ -f "$target_file" && "$FORCE_REGENERATE" != true ]]; then
  echo "⚠️ Arquivo $target_file já existe - pulando"
  return 0
fi
```

### 3. **Opção Force Controlada**

```bash
bash scripts/generate-multi-app-sql.sh --force  # Regenera tudo
```

### 4. **Limpeza Controlada**

```bash
bash scripts/clean-init-sql.sh --app nome_app   # Remove app específica
bash scripts/clean-init-sql.sh --all           # Remove tudo (com confirmação)
```

## 🧪 Cenários de Teste

### Cenário 1: Adição + generate-local-sql (Fluxo Seguro)

```bash
# 1. Adicionar nova app
bash scripts/add-new-app.sh teste teste_db teste_user teste_pass
# Resultado: ✅ init/XX-create-teste-db.sql criado

# 2. Executar generate-local-sql
bash scripts/generate-local-sql.sh
# Resultado: ✅ Arquivo preservado, nenhuma sobrescrita

# 3. Verificar
ls init/
# Resultado: ✅ Todos os arquivos mantidos
```

### Cenário 2: Múltiplas Adições (Fluxo Incremental)

```bash
# 1. App inicial via APPS_CONFIG
APPS_CONFIG=app1:db1:user1:pass1
bash scripts/generate-local-sql.sh
# Resultado: ✅ init/10-create-app1-db.sql

# 2. Adição manual
bash scripts/add-new-app.sh app2 db2 user2 pass2
# Resultado: ✅ init/11-create-app2-db.sql

# 3. Novo generate-local-sql
bash scripts/generate-local-sql.sh
# Resultado: ✅ Ambos arquivos preservados

# 4. Adição manual adicional
bash scripts/add-new-app.sh app3 db3 user3 pass3
# Resultado: ✅ init/12-create-app3-db.sql
```

### Cenário 3: Conflito de Nomes (Proteção)

```bash
# 1. App via APPS_CONFIG
APPS_CONFIG=conflito:db1:user1:pass1
bash scripts/generate-local-sql.sh
# Resultado: ✅ init/10-create-conflito-db.sql

# 2. Tentar adicionar mesmo nome
bash scripts/add-new-app.sh conflito db2 user2 pass2
# Resultado: ⚠️ Detecta conflito, pergunta se quer substituir

# 3. generate-local-sql subsequente
bash scripts/generate-local-sql.sh
# Resultado: ✅ Não sobrescreve, preserva última versão
```

## 📊 Resumo dos Comportamentos

| Ação                            | ANTES (Problemático)           | DEPOIS (Corrigido)     |
| ------------------------------- | ------------------------------ | ---------------------- |
| `add-new-app.sh` → `generate-local-sql.sh` | ❌ Perde adição manual         | ✅ Preserva adição     |
| `generate-local-sql.sh` repetido           | ❌ Regenera tudo               | ✅ Preserva existentes |
| Múltiplas adições manuais       | ❌ Perdidas no próximo generate-local-sql | ✅ Todas preservadas   |
| Conflito de nomes               | ❌ Sobrescreve silencioso      | ✅ Detecta e protege   |
| Limpeza necessária              | ❌ Só via rm manual            | ✅ Scripts controlados |

## 🔧 Recomendações de Uso

### ✅ Fluxos Seguros

```bash
# Adição incremental (recomendado)
bash scripts/add-new-app.sh nova_app nova_db novo_user nova_pass

# Regeneração parcial (quando necessário)
bash scripts/clean-init-sql.sh --app app_velha
bash scripts/generate-local-sql.sh

# Setup inicial completo
bash scripts/generate-local-sql.sh
```

### ⚠️ Quando Usar --force

```bash
# Apenas quando quiser recriar TUDO do zero
bash scripts/clean-init-sql.sh --all
bash scripts/generate-multi-app-sql.sh --force
```

## ✅ Conclusão

**O problema foi RESOLVIDO**. Agora:

- ✅ `generate-local-sql.sh` **NÃO quebra** adições sob demanda
- ✅ Arquivos existentes são **preservados** automaticamente
- ✅ Adições manuais **coexistem** com configuração APPS_CONFIG
- ✅ Limpeza é **controlada** e **segura**
- ✅ Conflitos são **detectados** e **protegidos**

O sistema é agora **verdadeiramente incremental** e **não-destrutivo**!
