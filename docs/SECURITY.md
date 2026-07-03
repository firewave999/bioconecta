# Seguranca

## Principios

Seguranca e requisito central do BioConecta, nao uma etapa final decorativa.

## Autenticacao

- Access token curto.
- Refresh token rotacionado.
- Hash seguro de senhas.
- Logout de sessao atual.
- Logout de todas as sessoes.
- Verificacao de e-mail.
- Recuperacao de senha com token temporario.
- Estrutura preparada para 2FA futuro.

## Autorizacao

- RBAC para papeis globais.
- Permissao por recurso para dados de empresas, vagas, candidaturas e documentos.
- Guards no backend.
- O frontend pode melhorar UX, mas nunca sera fonte de permissao.

## Protecoes

- Helmet.
- CORS restrito por ambiente.
- Rate limiting em rotas sensiveis.
- Protecao contra brute force.
- Validacao de DTOs.
- Sanitizacao de entradas quando aplicavel.
- Protecao contra IDOR.
- Logs de autenticacao.
- Audit log em acoes administrativas e sensiveis.

## Uploads

- Validar MIME type.
- Validar extensao.
- Limitar tamanho.
- Gerar nomes seguros.
- Nunca servir documentos privados sem autorizacao.

## LGPD

O sistema deve suportar:

- Consentimento.
- Historico de aceite.
- Exportacao de dados.
- Correcao.
- Exclusao.
- Revogacao de consentimento.
- Restricao de acesso a dados sensiveis.

## Dados que nao devem vazar

- CPF.
- Documentos.
- Tokens.
- Hashes.
- Dados internos de auditoria.
- Dados privados de contato quando o profissional optar por ocultar.
