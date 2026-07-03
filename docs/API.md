# API

## Padrao

A API sera REST, documentada por Swagger/OpenAPI e versionada sob `/api/v1`.

## Status da Implementacao

Etapa 3 criou a base real da API em NestJS.

Disponivel:

- `GET /api/v1/health`
- Swagger UI em `/api/docs`
- OpenAPI JSON em `/api/docs-json`
- Prefixo global `/api/v1`
- Configuracao por variaveis de ambiente
- TypeORM preparado para PostgreSQL

## Convencoes

- DTOs para entrada e saida.
- Validacao com class-validator no NestJS e Zod nos contratos compartilhados quando fizer sentido.
- Respostas de erro padronizadas.
- Paginacao em listas.
- Filtros explicitos para buscas.
- Autorizacao por guard e por propriedade de recurso.

## Grupos de Rotas Iniciais

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/password/forgot`
- `POST /api/v1/auth/password/reset`

### Perfil do Biologo

- `GET /api/v1/biologist-profile/me`
- `PUT /api/v1/biologist-profile/me`
- `POST /api/v1/biologist-profile/documents`
- `POST /api/v1/biologist-profile/submit-verification`

### Empresas

- `POST /api/v1/companies`
- `GET /api/v1/companies/:id`
- `PUT /api/v1/companies/:id`
- `POST /api/v1/companies/:id/members/invite`

### Vagas

- `POST /api/v1/jobs`
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/:id`
- `PUT /api/v1/jobs/:id`
- `POST /api/v1/jobs/:id/applications`

### Matching

- `GET /api/v1/jobs/:id/match/me`
- `GET /api/v1/jobs/:id/candidates/matches`

### Admin

- `GET /api/v1/admin/verifications`
- `POST /api/v1/admin/verifications/:id/approve`
- `POST /api/v1/admin/verifications/:id/reject`

## Primeiro Fluxo Completo

O primeiro fluxo de ponta a ponta deve cobrir:

1. Cadastro de conta.
2. Verificacao de e-mail em desenvolvimento.
3. Escolha do perfil "Sou biologo".
4. Onboarding profissional.
5. Dashboard do biologo.
6. Edicao de perfil.
7. Logout.
8. Login novamente.
