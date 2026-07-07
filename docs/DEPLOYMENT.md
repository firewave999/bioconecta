# Deployment

## Ambiente Alvo

- Ubuntu 24.04.
- Docker e Docker Compose.
- PostgreSQL.
- Redis.
- Nginx como proxy reverso.
- HTTPS com certificado gerenciado.

## Ambientes

- `development`: execucao local com Docker Compose.
- `staging`: ambiente de homologacao antes de producao.
- `production`: ambiente publico.

## Variaveis Previstas

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `APP_WEB_URL`
- `APP_API_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `UPLOAD_STORAGE_PATH`

## CI/CD

GitHub Actions deve executar:

1. Install.
2. Lint.
3. Typecheck.
4. Tests.
5. Build.
6. Migrations em ambiente controlado.
7. Deploy.

## Estrategia Inicial

Durante o MVP, usar Docker Compose para padronizar desenvolvimento e facilitar deploy inicial. A arquitetura deve permitir evoluir para containers separados e orquestracao mais robusta no futuro.

## Deploy Isolado no VPS do Rifasaas

O BioConecta deve subir como projeto Docker Compose separado. Nao reutilizar containers, banco, volumes, network ou portas do Rifasaas.

Arquivos preparados:

- `infra/docker-compose.production.yml`
- `infra/Dockerfile.api`
- `infra/Dockerfile.web`
- `infra/.env.production.example`
- `infra/nginx.bioconecta.example.conf`

Isolamento definido:

- Projeto Compose: `bioconecta`
- Containers: `bioconecta-api`, `bioconecta-web`, `bioconecta-postgres`, `bioconecta-redis`
- Network: `bioconecta_internal`
- Volumes: `bioconecta_postgres_data`, `bioconecta_redis_data`
- Portas host padrao: web `3100`, API `4100`
- PostgreSQL e Redis nao expoem portas no host em producao.

Fluxo sugerido no VPS:

```bash
git clone git@github.com:firewave999/bioconecta.git /opt/bioconecta
cd /opt/bioconecta/infra
cp .env.production.example .env.production
# editar senhas, dominios e secrets
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
docker compose -f docker-compose.production.yml --env-file .env.production exec bioconecta-api pnpm migration:run
```

Nginx deve apontar:

- `bioconecta.seudominio.com` -> `127.0.0.1:3100`
- `api-bioconecta.seudominio.com` -> `127.0.0.1:4100`

Antes de subir no mesmo VPS do Rifasaas, conferir:

```bash
docker ps
docker network ls
docker volume ls
ss -tulpn | grep -E '3100|4100'
```

Se alguma porta conflitar, alterar `BIOCONECTA_WEB_HOST_PORT` e `BIOCONECTA_API_HOST_PORT` no `.env.production` e ajustar o Nginx.

## Infra Local Criada

O arquivo `docker-compose.yml` sobe PostgreSQL e Redis para desenvolvimento.

Comandos:

```bash
pnpm infra:up
pnpm infra:ps
pnpm infra:logs
pnpm infra:down
```
