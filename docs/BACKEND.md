# Backend

## Status

Etapa 10 base concluida.

## Stack

- NestJS.
- TypeScript.
- REST API.
- Swagger/OpenAPI.
- TypeORM.
- PostgreSQL.
- Autenticacao com access token e refresh token opaco rotacionavel.
- Helmet.
- ValidationPipe global.
- Configuracao por variaveis de ambiente validada com Zod.

## Estrutura

```txt
apps/api/src/
  app.module.ts
  main.ts
  config/
    env.validation.ts
  database/
    data-source.ts
    database.module.ts
    typeorm.options.ts
    migrations/
  auth/
    auth.controller.ts
    auth.guard.ts
    auth.module.ts
    auth.service.ts
  admin/
    admin.controller.ts
    admin.guard.ts
    admin.module.ts
    admin.service.ts
    dto/
  applications/
    applications.controller.ts
    applications.module.ts
    applications.service.ts
    application.entity.ts
  favorites/
    favorites.controller.ts
    favorites.module.ts
    favorites.service.ts
    saved-job.entity.ts
  biologist-profile/
    biologist-profile.controller.ts
    biologist-profile.entity.ts
    biologist-profile.module.ts
    biologist-profile.service.ts
    dto/
    entities/
  companies/
    companies.controller.ts
    companies.module.ts
    companies.service.ts
    company.entity.ts
  jobs/
    jobs.controller.ts
    jobs.module.ts
    jobs.service.ts
    job.entity.ts
  users/
    user.entity.ts
    users.module.ts
  health/
    health.controller.ts
    health.module.ts
```

## Comandos

```bash
pnpm api:dev
pnpm --filter @bioconecta/api build
pnpm --filter @bioconecta/api start
pnpm --filter @bioconecta/api test
pnpm --filter @bioconecta/api migration:run
pnpm --filter @bioconecta/api migration:revert
pnpm --filter @bioconecta/api schema:log
```

## Rotas Atuais

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `POST /api/v1/auth/verify-email`
- `GET /api/v1/auth/me`
- `GET /api/v1/biologist-profile/me`
- `PUT /api/v1/biologist-profile/me`
- `GET /api/v1/biologist-profile/me/professional`
- `PUT /api/v1/biologist-profile/me/professional`
- `GET /api/v1/companies/me`
- `PUT /api/v1/companies/me`
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/mine`
- `POST /api/v1/jobs`
- `PUT /api/v1/jobs/:id`
- `GET /api/v1/applications/mine`
- `GET /api/v1/applications/jobs/:jobId/me`
- `POST /api/v1/applications/jobs/:jobId`
- `GET /api/v1/applications/jobs/:jobId/candidates`
- `PUT /api/v1/applications/:id/status`
- `GET /api/v1/favorites/jobs`
- `GET /api/v1/favorites/jobs/:jobId`
- `POST /api/v1/favorites/jobs/:jobId`
- `DELETE /api/v1/favorites/jobs/:jobId`
- `GET /api/v1/admin/overview`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/companies`
- `GET /api/v1/admin/biologists`
- `GET /api/v1/admin/jobs`
- `GET /api/v1/admin/applications`
- `PUT /api/v1/admin/companies/:id/verification`
- `PUT /api/v1/admin/biologists/:id/verification`
- `PUT /api/v1/admin/jobs/:id/status`
- `/api/docs`
- `/api/docs-json`

## Observacoes

A API depende de variaveis de ambiente validas e de PostgreSQL acessivel para iniciar com TypeORM. O admin basico usa `AuthGuard` mais `AdminGuard` e exige role `ADMIN` no token.

Os primeiros testes automatizados usam Vitest e cobrem:

- `AdminGuard`: permite `ADMIN` e bloqueia usuarios sem essa role.
- `AdminService`: contadores operacionais, sanitizacao de `passwordHash`, atualizacao de verificacao de empresa e publicacao de vaga.

Para desenvolvimento local:

```bash
cp .env.example .env
pnpm infra:up
pnpm api:dev
```

Nesta sessao, Docker nao estava disponivel no PATH, entao a subida real de PostgreSQL e Redis segue pendente de execucao em ambiente com Docker.
