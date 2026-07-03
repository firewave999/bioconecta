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

A Home atual e publica e funcional como primeira tela institucional do produto. Os CTAs navegam para secoes reais da propria pagina. Fluxos de cadastro, login, vagas indexaveis e dashboard entram nas proximas etapas.
