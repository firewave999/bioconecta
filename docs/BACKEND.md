# Backend

## Status

Etapa 3 concluida.

## Stack

- NestJS.
- TypeScript.
- REST API.
- Swagger/OpenAPI.
- TypeORM.
- PostgreSQL.
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
  health/
    health.controller.ts
    health.module.ts
```

## Comandos

```bash
pnpm api:dev
pnpm --filter @bioconecta/api build
pnpm --filter @bioconecta/api start
pnpm --filter @bioconecta/api migration:run
pnpm --filter @bioconecta/api migration:revert
pnpm --filter @bioconecta/api schema:log
```

## Rotas Atuais

- `GET /api/v1/health`
- `/api/docs`
- `/api/docs-json`

## Observacoes

A API depende de variaveis de ambiente validas e de PostgreSQL acessivel para iniciar com TypeORM.

Para desenvolvimento local:

```bash
cp .env.example .env
pnpm infra:up
pnpm api:dev
```

Nesta sessao, Docker nao estava disponivel no PATH, entao a subida real de PostgreSQL e Redis segue pendente de execucao em ambiente com Docker.
