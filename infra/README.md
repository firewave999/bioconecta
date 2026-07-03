# Infra Local

Esta pasta concentra configuracoes de infraestrutura do BioConecta.

## Servicos da Etapa 2

- PostgreSQL 17.
- Redis 7.4.

## Inicializacao do PostgreSQL

Scripts em `infra/postgres/init` rodam apenas na primeira criacao do volume do PostgreSQL.

Extensoes iniciais:

- `pgcrypto`: suporte a UUIDs e funcoes criptograficas uteis.
- `citext`: suporte a campos textuais case-insensitive, util para e-mails.
