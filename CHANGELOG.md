# 🔄 Changelog - ANPD Docker PostgreSQL

## v2.0.0 - Formato Padronizado Multi-Database (2025-07-29)

### 🚀 **Principais Mudanças**

#### ✅ **Novo Formato Padronizado**

- **Bancos simplificados**: `backlog_dev`, `portal_dev`, `api_dev` (ao invés de `backlog_dim_dev`, `portal_anpd_dev`, `api_lgpd_dev`)
- **Configuração unificada**: `config/apps.conf` versionado para GitOps
- **Nomenclatura consistente**: Padrão `{app}_{env}` para todos os bancos

#### 🌐 **GitOps/Portainer Support**

- **docker-compose.gitops.yml**: Compose otimizado para Portainer
- **Auto-deploy**: Integração completa com GitOps workflow
- **Secrets management**: Separação de configuração estrutural e credenciais
- **Environment-based**: Senhas via environment variables ou secrets

#### 🔧 **Scripts Atualizados**

- **generate-gitops-sql.sh**: Geração de SQLs para GitOps
- **add-gitops-app.sh**: Adicionar aplicações no formato GitOps
- **Detecção automática**: Scripts detectam modo local vs GitOps

#### 📚 **Documentação Expandida**

- **PORTAINER.md**: Guia completo GitOps/Portainer
- **LOCAL_VS_GITOPS.md**: Comparação dos modos de deployment
- **EXAMPLE.md**: Exemplos práticos atualizados
- **MIGRATION.md**: Guia de migração atualizado

### 📊 **Mudanças de Nomenclatura**

| Componente        | v1.x (Antigo)     | v2.0 (Novo)                 |
| ----------------- | ----------------- | --------------------------- |
| **Backlog DB**    | `backlog_dim_dev` | `backlog_dev`               |
| **Portal DB**     | `portal_anpd_dev` | `portal_dev`                |
| **API DB**        | `api_lgpd_dev`    | `api_dev`                   |
| **Config Method** | `.env` apenas     | `.env` + `config/apps.conf` |
| **Deploy Method** | Local apenas      | Local + GitOps              |

### 🔄 **Migração Automática**

#### Para usuários existentes:

```bash
# Configuração legada ainda funciona (retrocompatibilidade)
BACKLOG_DB=backlog_dev
BACKLOG_USER=backlog_user
BACKLOG_PASS=backlog_pass

# Nova configuração recomendada
APPS_CONFIG=backlog:backlog_dev:backlog_user:backlog_pass
```

#### Para novos projetos:

```bash
# GitOps (recomendado)
config/apps.conf + Portainer environment variables

# Local (desenvolvimento)
APPS_CONFIG no .env
```

### ⚠️ **Breaking Changes**

#### 🔄 **Arquivos movidos**:

- `docs/EXAMPLE.md` → `EXAMPLE.md`
- `docs/MIGRATION.md` → `MIGRATION.md`
- `docs/CONFLICT_TEST.md` → `CONFLICT_TEST.md`

#### 📝 **Arquivos atualizados**:

- `.env.example`: Configuração padrão atualizada
- `config/apps.conf`: Nomes de bancos padronizados
- `scripts/generate-init-sql.sh`: Nomes de arquivos SQL atualizados

### 🎯 **Benefícios da v2.0**

1. **Consistência**: Nomenclatura padronizada em todo o projeto
2. **GitOps Ready**: Deploy automatizado via Portainer/Kubernetes
3. **Escalabilidade**: Fácil adição de novas aplicações
4. **Segurança**: Separação de configuração e credenciais
5. **Manutenibilidade**: Configurações versionadas
6. **Flexibilidade**: Suporte a múltiplos modos de deployment

### 🔧 **Guias de Migração**

- **[Local → GitOps](LOCAL_VS_GITOPS.md)**: Como migrar para GitOps
- **[v1.x → v2.0](MIGRATION.md)**: Migração de versões
- **[Portainer Setup](PORTAINER.md)**: Configuração completa GitOps

---

## v1.x - Multi-Database Legacy (2025-07-28)

### ✅ **Recursos Implementados**

- Multi-database básico via `APPS_CONFIG`
- Scripts de geração automática
- Compatibilidade com projetos existentes
- Docker Compose tradicional

### 📋 **Configuração v1.x**

```env
APPS_CONFIG=backlog:backlog_dim_dev:backlog_user:backlog_pass,sistema2:sistema2_dev:sistema2_user:sistema2_pass
```

---

**Nota**: A v1.x ainda é totalmente suportada via configuração legada para garantir zero impacto em projetos existentes.
