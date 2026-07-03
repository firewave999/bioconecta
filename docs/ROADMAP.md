# Roadmap

## Etapa 0: Fundacao

Status: concluida.

- Analisar repositorio atual.
- Criar documentacao inicial.
- Definir arquitetura.
- Definir arvore de pastas.
- Modelar banco de dados inicial.
- Preparar decisao de monorepo.

## Etapa 1: Monorepo

- Configurar pnpm.
- Configurar Turborepo.
- Criar `apps/web`.
- Criar `apps/api`.
- Criar packages compartilhados.
- Configurar TypeScript estrito.
- Configurar ESLint e Prettier.

## Etapa 2: Infra Local

- Criar Docker Compose.
- Configurar PostgreSQL.
- Configurar Redis.
- Criar arquivos `.env.example`.
- Criar health checks.

## Etapa 3: Backend Base

- Criar NestJS.
- Configurar TypeORM.
- Configurar migrations.
- Configurar Swagger.
- Criar modulos base.
- Criar health endpoint.

## Etapa 4: Frontend Base

- Criar Next.js.
- Configurar Tailwind.
- Configurar shadcn/ui.
- Definir design tokens.
- Criar layout publico.
- Criar Home inicial.

## Etapa 5: Autenticacao

- Cadastro.
- Login.
- Refresh token com rotacao.
- Logout.
- Logout de todas as sessoes.
- Verificacao de e-mail em dev.
- Recuperacao de senha.

## Etapa 6: Primeiro Fluxo Completo do Biologo

- Home.
- Criar conta.
- Verificar e-mail.
- Escolher "Sou biologo".
- Preencher onboarding.
- Salvar perfil.
- Acessar dashboard.
- Editar perfil.
- Logout.
- Login novamente.

## Etapa 7: Perfil Profissional

- Identificacao profissional.
- CRBio.
- Documentos.
- Disponibilidade.
- Areas de atuacao.
- Grupos taxonomicos.
- Competencias tecnicas.
- Experiencias.
- Certificacoes.

## Etapa 8: Empresas e Vagas

- Cadastro empresarial.
- Equipe de empresa.
- Criacao de vagas.
- Requisitos profissionais.
- Logistica.
- Remuneracao.

## Etapa 9: Candidaturas e Matching

- Candidatura.
- Pipeline da empresa.
- Score transparente.
- Elegibilidade de estudantes.
- Favoritos.

## Etapa 10: Admin e Producao

- Painel admin.
- Verificacoes.
- Auditoria.
- Notificacoes.
- Testes.
- Hardening de seguranca.
- CI/CD.
- Deploy.

## Marco Atual

A proxima tarefa e configurar o monorepo com pnpm e Turborepo.
