# BioConecta

Conectando biologos as oportunidades certas.

BioConecta e uma plataforma nacional para conectar biologos, estudantes de Ciencias Biologicas, empresas, vagas, campanhas de campo, prestacao de servicos e um banco profissional de disponibilidade no Brasil.

Este repositorio esta sendo construido em etapas. A base tecnica, autenticacao, perfil profissional do biologo, empresas, vagas, candidaturas, matching inicial e admin basico ja estao implementados para desenvolvimento local.

## Objetivo do MVP

O MVP deve resolver quatro problemas centrais:

1. Permitir que biologos criem perfis profissionais especializados e verificaveis.
2. Permitir que empresas publiquem vagas exclusivas para biologos.
3. Fazer matching transparente entre profissional e oportunidade.
4. Permitir que empresas encontrem biologos disponiveis.

## Stack Planejada

- Monorepo: pnpm e Turborepo.
- Frontend: Next.js, TypeScript, App Router, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query e Lucide Icons.
- Backend: NestJS, REST API, Swagger/OpenAPI, TypeORM, PostgreSQL, Redis e BullMQ.
- Infra: Docker, Docker Compose, Nginx, HTTPS, GitHub Actions e deploy em Ubuntu 24.04.

## Estrutura Planejada

```txt
apps/
  web/
  api/
packages/
  ui/
  types/
  config/
  eslint-config/
  typescript-config/
docs/
  ARCHITECTURE.md
  DATABASE.md
  API.md
  SECURITY.md
  DEPLOYMENT.md
  ROADMAP.md
```

## Documentacao

- [Arquitetura](docs/ARCHITECTURE.md)
- [Backend](docs/BACKEND.md)
- [Banco de dados](docs/DATABASE.md)
- [API](docs/API.md)
- [Seguranca](docs/SECURITY.md)
- [Deploy](docs/DEPLOYMENT.md)
- [Frontend](docs/FRONTEND.md)
- [Infraestrutura local](docs/INFRASTRUCTURE.md)
- [Monorepo](docs/MONOREPO.md)
- [Roadmap](docs/ROADMAP.md)
- [Relatorio do repositorio](docs/REPOSITORY_REPORT.md)

## Desenvolvimento

Com Node.js e pnpm disponiveis no PATH:

```bash
pnpm install
cp .env.example .env
pnpm infra:up
pnpm web:dev
pnpm api:dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Nesta sessao do Codex, os comandos foram executados usando o runtime empacotado em `C:\Users\ACER\.cache\codex-runtimes\codex-primary-runtime\dependencies`.

## Status Atual

Etapa 10 base concluida: autenticacao real, onboarding do biologo, perfil profissional, cadastro empresarial, vagas com filtros, favoritos, candidaturas, pipeline simples da empresa, score inicial de compatibilidade, painel admin basico e primeiros testes automatizados da API.

Ainda faltam favoritos de profissionais para empresas, refinamento do matching, recuperacao de senha, ampliar testes automatizados, auditoria, notificacoes, hardening de seguranca, CI/CD e deploy. Essas partes entram nos proximos refinamentos.
