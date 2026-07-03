# Monorepo

## Status

Etapa 1 concluida.

## Ferramentas

- pnpm workspaces.
- Turborepo.
- TypeScript estrito.
- ESLint flat config.
- Prettier.

## Workspaces

```txt
apps/
  api/
  web/
packages/
  config/
  eslint-config/
  types/
  typescript-config/
  ui/
```

## Scripts

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
```

## Observacoes

Os apps `@bioconecta/web` e `@bioconecta/api` ainda sao placeholders compilaveis. O app web real em Next.js entra na Etapa 4. A API real em NestJS entra na Etapa 3.

Os packages internos ja existem para permitir evolucao incremental sem quebrar contratos:

- `@bioconecta/types`: enums e tipos compartilhados.
- `@bioconecta/config`: constantes compartilhadas.
- `@bioconecta/ui`: base futura do design system.
- `@bioconecta/eslint-config`: preset compartilhado de lint.
- `@bioconecta/typescript-config`: presets compartilhados de TypeScript.
