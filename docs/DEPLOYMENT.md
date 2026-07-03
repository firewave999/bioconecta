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
