# Banco de Dados

## Banco Principal

PostgreSQL sera o banco relacional principal. Redis sera usado para cache, filas e controles temporarios.

## Status da Implementacao

Etapa 3 configurou TypeORM no backend com:

- `synchronize: false`
- migrations em `apps/api/src/database/migrations`
- tabela de migrations `typeorm_migrations`
- DataSource em `apps/api/src/database/data-source.ts`

Etapa 5 adicionou a primeira migration de autenticacao:

- `users`
- `sessions`
- `email_verification_tokens`

Etapa 6 adicionou o perfil profissional inicial:

- `biologist_profiles`

## Entidades Minimas

### Identidade e Acesso

- User
- Session
- PasswordResetToken
- EmailVerificationToken
- Consent
- AuditLog

### Perfis

- BiologistProfile
- StudentProfile
- Availability
- Experience
- Education
- Certification
- Document
- VerificationRequest

### Taxonomia Profissional

- PracticeArea
- PracticeAreaCategory
- Skill
- TaxonomicGroup
- CourseCatalogItem
- BiologistSkill
- BiologistTaxonomicGroup
- BiologistPracticeArea

### Empresas

- Company
- CompanyMember
- CompanyInvitation

### Vagas e Candidaturas

- Job
- JobRequirement
- JobSkillRequirement
- JobTaxonomicRequirement
- Application
- ApplicationAttachment
- SavedJob
- SavedProfessional
- JobAlert

### Comunicacao e Reputacao

- Notification
- Conversation
- Message
- Review
- Report

### Comercial Futuro

- Subscription

## Relacionamentos Principais

- User possui zero ou um BiologistProfile.
- User possui zero ou um StudentProfile.
- Company possui muitos CompanyMembers.
- Company possui muitas Jobs.
- Job possui muitas Applications.
- User pode se candidatar a muitas Jobs, respeitando regras de elegibilidade.
- BiologistProfile se relaciona com Skills, TaxonomicGroups e PracticeAreas por tabelas intermediarias.
- VerificationRequest referencia documentos e registra decisoes administrativas.

## Enums Iniciais

Roles:

- BIOLOGIST
- STUDENT
- COMPANY
- RECRUITER
- ADMIN
- MODERATOR

VerificationStatus:

- UNVERIFIED
- PENDING
- VERIFIED
- REJECTED
- SUSPENDED

ApplicationStatus:

- APPLIED
- UNDER_REVIEW
- SHORTLISTED
- INTERVIEW
- OFFER
- HIRED
- REJECTED
- WITHDRAWN

## Regras de Modelagem

- Evitar JSON quando houver necessidade de filtro, relacionamento ou auditoria.
- Usar soft delete em dados de negocio relevantes.
- Usar migrations versionadas.
- Restringir CPF, documentos e dados pessoais por permissao.
- Indexar campos de busca: cidade, estado, area, disponibilidade, status e datas.
