# Infraestrutura Local

## Status

Etapa 2 concluida em estrutura, pendente apenas de execucao real porque Docker nao estava disponivel no PATH desta sessao.

## Servicos

O arquivo `docker-compose.yml` define:

- PostgreSQL 17 Alpine.
- Redis 7.4 Alpine.
- Volumes persistentes para banco e Redis.
- Health checks para ambos os servicos.
- Scripts de inicializacao do PostgreSQL em `infra/postgres/init`.

## Variaveis

Use `.env.example` como base para `.env` local.

Principais variaveis:

- `DATABASE_URL`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `REDIS_URL`
- `REDIS_HOST`
- `REDIS_PORT`

## Comandos

```bash
pnpm infra:up
pnpm infra:ps
pnpm infra:logs
pnpm infra:down
pnpm infra:reset
```

## Observacoes

`infra:reset` remove volumes e apaga dados locais. Use apenas quando quiser recriar PostgreSQL e Redis do zero.

Os secrets em `.env.example` sao apenas placeholders de desenvolvimento. Ambientes de staging e producao devem usar valores fortes e gerenciados fora do repositorio.
