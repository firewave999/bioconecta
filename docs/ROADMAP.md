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

Status: concluida.

- Configurar pnpm.
- Configurar Turborepo.
- Criar `apps/web`.
- Criar `apps/api`.
- Criar packages compartilhados.
- Configurar TypeScript estrito.
- Configurar ESLint e Prettier.

## Etapa 2: Infra Local

Status: concluida.

- Criar Docker Compose.
- Configurar PostgreSQL.
- Configurar Redis.
- Criar arquivos `.env.example`.
- Criar health checks.

## Etapa 3: Backend Base

Status: concluida.

- Criar NestJS.
- Configurar TypeORM.
- Configurar migrations.
- Configurar Swagger.
- Criar modulos base.
- Criar health endpoint.

## Etapa 4: Frontend Base

Status: concluida.

- Criar Next.js.
- Configurar Tailwind.
- Configurar shadcn/ui.
- Definir design tokens.
- Criar layout publico.
- Criar Home inicial.

## Etapa 5: Autenticacao

Status: concluida.

- Cadastro.
- Login.
- Refresh token com rotacao.
- Logout.
- Logout de todas as sessoes.
- Verificacao de e-mail em dev.
- Recuperacao de senha. Pendente para refinamento posterior.

## Etapa 6: Primeiro Fluxo Completo do Biologo

Status: concluida.

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

Status: concluida.

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

Status: concluida.

- Cadastro empresarial.
- Equipe de empresa.
- Criacao de vagas.
- Requisitos profissionais.
- Logistica.
- Remuneracao.

## Etapa 9: Candidaturas e Matching

Status: base concluida; favoritos de vagas e filtros concluidos; favoritos de profissionais pendente para refinamento.

- Candidatura.
- Pipeline da empresa.
- Score transparente.
- Elegibilidade de estudantes.
- Favoritos.

## Etapa 10: Admin e Producao

Status: base admin concluida; producao pendente.

- Painel admin basico concluido.
- Verificacoes de empresas e biologos concluidas no admin basico.
- Controle de status de vagas concluido no admin basico.
- Auditoria pendente.
- Notificacoes pendentes.
- Testes automatizados iniciais da API concluidos para admin, auth, candidaturas, vagas e favoritos.
- Ampliar cobertura de testes automatizados pendente.
- Hardening de seguranca pendente.
- CI/CD pendente.
- Deploy pendente.

## Marco Atual

A proxima tarefa e preparar qualidade e producao: ampliar testes automatizados, auditoria, notificacoes, hardening de seguranca, CI/CD e deploy.
