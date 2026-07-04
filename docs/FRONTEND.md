# Frontend

## Status

Etapa 4 concluida.

## Stack

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Estrutura compativel com shadcn/ui.
- Lucide Icons.

## Estrutura

```txt
apps/web/
  components.json
  next.config.mjs
  postcss.config.mjs
  public/
    images/
      hero-bioconecta.png
  src/
    app/
      globals.css
      layout.tsx
      page.tsx
      robots.ts
      sitemap.ts
    components/
      ui/
        button.tsx
    lib/
      utils.ts
```

## Rotas Atuais

- `/`
- `/cadastro`
- `/login`
- `/robots.txt`
- `/sitemap.xml`

## Comandos

```bash
pnpm --filter @bioconecta/web dev
pnpm --filter @bioconecta/web build
pnpm --filter @bioconecta/web start
pnpm --filter @bioconecta/web typecheck
```

Atalho raiz:

```bash
pnpm web:dev
```

## Observacoes

A Home atual e publica e funcional como primeira tela institucional do produto. Os CTAs principais navegam para cadastro e login. Vagas indexaveis, dashboard e onboarding entram nas proximas etapas.

Atualizacao: `/cadastro` e `/login` ja chamam a API real de autenticacao. Em desenvolvimento, os tokens sao guardados no `localStorage` ate a etapa de dashboard/onboarding definir a estrategia final de sessao no frontend.
