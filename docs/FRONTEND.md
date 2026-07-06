# Frontend

## Status

Etapa 10 base concluida.

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
      admin/
      dashboard/
      candidaturas/
      empresa/
      favoritos/
      onboarding/
      perfil/
      vagas/
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
- `/admin`
- `/onboarding/biologo`
- `/dashboard`
- `/candidaturas`
- `/favoritos`
- `/perfil/editar`
- `/perfil/profissional`
- `/empresa`
- `/empresa/vagas`
- `/empresa/vagas/nova`
- `/empresa/vagas/:id/candidatos`
- `/vagas`
- `/vagas/:id`
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

A Home atual e publica e funcional como primeira tela institucional do produto. Os CTAs principais navegam para cadastro e login.

Atualizacao: `/cadastro`, `/login`, `/admin`, `/onboarding/biologo`, `/dashboard`, `/candidaturas`, `/favoritos`, `/perfil/editar`, `/perfil/profissional`, `/empresa`, `/empresa/vagas`, `/empresa/vagas/nova`, `/empresa/vagas/:id/candidatos`, `/vagas` e `/vagas/:id` ja chamam a API real. Em desenvolvimento, os tokens sao guardados no `localStorage` ate a etapa de sessao segura com cookies httpOnly.
