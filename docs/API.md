# API

## Padrao

A API sera REST, documentada por Swagger/OpenAPI e versionada sob `/api/v1`.

## Status da Implementacao

Etapa 9 ja cobre autenticacao, perfil profissional do biologo, empresas, vagas, candidaturas e matching inicial.

Disponivel:

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
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/password/forgot`
- `POST /api/v1/auth/password/reset`

### Perfil do Biologo

- `GET /api/v1/biologist-profile/me`
- `PUT /api/v1/biologist-profile/me`
- `GET /api/v1/biologist-profile/me/professional`
- `PUT /api/v1/biologist-profile/me/professional`
- `POST /api/v1/biologist-profile/documents`
- `POST /api/v1/biologist-profile/submit-verification`

Implementado nesta etapa:

- `GET /api/v1/biologist-profile/me`: retorna o perfil do biologo autenticado e percentual de conclusao.
- `PUT /api/v1/biologist-profile/me`: cria ou atualiza identificacao, CRBio, localizacao, disponibilidade e dados fiscais basicos.
- `GET /api/v1/biologist-profile/me/professional`: retorna areas, grupos taxonomicos, competencias, experiencias, certificacoes e documentos.
- `PUT /api/v1/biologist-profile/me/professional`: substitui o conjunto profissional expandido do biologo autenticado.

### Empresas

- `GET /api/v1/companies/me`
- `PUT /api/v1/companies/me`
- `POST /api/v1/companies/:id/members/invite`

### Vagas

- `POST /api/v1/jobs`
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/mine`
- `PUT /api/v1/jobs/:id`
- `POST /api/v1/jobs/:id/applications`

Implementado nesta etapa:

- `GET /api/v1/companies/me`: retorna empresa da conta autenticada.
- `PUT /api/v1/companies/me`: cria ou atualiza empresa da conta autenticada.
- `GET /api/v1/jobs`: lista vagas publicadas.
- `GET /api/v1/jobs/mine`: lista vagas da empresa autenticada.
- `POST /api/v1/jobs`: cria vaga para a empresa autenticada.
- `PUT /api/v1/jobs/:id`: atualiza vaga da empresa autenticada.

### Candidaturas

- `GET /api/v1/applications/mine`
- `GET /api/v1/applications/jobs/:jobId/me`
- `POST /api/v1/applications/jobs/:jobId`
- `GET /api/v1/applications/jobs/:jobId/candidates`
- `PUT /api/v1/applications/:id/status`

Implementado nesta etapa:

- Biólogo autenticado pode se candidatar a vagas publicadas.
- API bloqueia candidatura duplicada.
- Empresa autenticada vê candidatos por vaga.
- Empresa atualiza status do pipeline.
- Candidatura recebe `matchScore` e `matchReasons` calculados a partir de áreas, grupos taxonômicos, competências, CRBio, localização e viagem.

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
