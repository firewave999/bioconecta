# Arquitetura

## Visao Geral

BioConecta sera uma aplicacao web responsiva e instalavel como PWA, organizada em monorepo com separacao clara entre interface, API, tipos compartilhados e configuracoes.

## Principios

- Backend como fonte de verdade para autenticacao, autorizacao e regras de negocio.
- Validacao duplicada: experiencia boa no frontend, seguranca real no backend.
- RBAC aplicado no backend, nunca apenas por ocultacao visual.
- Modulos pequenos, com fronteiras explicitas.
- Auditoria para acoes sensiveis.
- Dados pessoais protegidos por padrao.

## Monorepo

```txt
apps/
  web/              # Next.js
  api/              # NestJS
packages/
  ui/               # Componentes compartilhados
  types/            # Tipos e contratos compartilhados
  config/           # Configuracoes comuns
  eslint-config/    # Presets de lint
  typescript-config/# Presets de TypeScript
```

## Frontend

O app web sera construido com Next.js App Router. As rotas publicas, autenticadas, de empresa, biologo e admin devem ser separadas por grupos de rotas.

Estrutura prevista:

```txt
apps/web/src/
  app/
    (public)/
    (auth)/
    (biologist)/
    (company)/
    (admin)/
  components/
  features/
  lib/
  styles/
```

## Backend

O backend sera uma API REST em NestJS com modulos por dominio.

Modulos iniciais:

- Auth
- Users
- Sessions
- BiologistProfiles
- StudentProfiles
- Companies
- Jobs
- Applications
- Matching
- Documents
- Notifications
- Admin
- Audit

Estrutura prevista:

```txt
apps/api/src/
  main.ts
  app.module.ts
  modules/
  common/
  config/
  database/
  jobs/
```

## Comunicacao

- REST API para operacoes principais.
- Swagger/OpenAPI para documentacao e validacao de contrato.
- Redis para filas, sessoes auxiliares e tarefas assincronas.
- BullMQ para envio de e-mails, notificacoes e processamento posterior.

## Decisoes Iniciais

- O matching inicial sera baseado em regras, nao em IA.
- Categorias, areas, grupos taxonomicos, cursos e competencias serao administraveis no banco.
- Uploads serao tratados como documentos vinculados a entidades, com validacao de tipo, tamanho e permissao.
- Recursos sensiveis terao autorizacao por propriedade do recurso para evitar IDOR.
