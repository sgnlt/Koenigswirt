<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Königswirt website

Rebuild of https://www.koenigswirt.de/ (Königswirt, a historic country inn in Germany), replacing the current Wix site.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4: tokens live in `@theme` in `app/globals.css`; there is no `tailwind.config.js`
- pnpm only; do not add `package-lock.json` or `yarn.lock`

## Commands

- `pnpm dev`: start the dev server
- `pnpm lint`: run ESLint
- `pnpm build`: production build and type check

Run `pnpm lint` and `pnpm build` before calling work done.

## Conventions

- Default to Server Components; add `"use client"` only for browser APIs or interactivity.
- Use `next/image`, `next/font`, and the Metadata API rather than raw tags.
- Prefer static rendering. The site is content-led, so keep client JavaScript small.
- Build mobile-first and to WCAG 2.1 AA, with semantic HTML.
- Use `@/` imports.

## Content

- The site language is German (`<html lang="de">`). User-facing copy is German unless asked otherwise.
- Take facts from the live site or the owner. Never invent opening hours, prices, menu items, contact details, or legal text.
- The live site renders client-side, so plain page fetches may return almost no text. Use a real browser to read it.

## Migrating from the live site

Keep these paths, or add a permanent redirect in `next.config.ts` when one changes, to preserve search rankings:

- `/`, `/menus`, `/salettl`, `/festsaal-mit-buehne`, `/service-uebersicht`, `/presse`, `/impressum`
- `/terms-and-conditions`, `/accessibility-statement`
- `/blank`, `/blank-3`: content not yet reviewed; decide their final paths before launch

Live integrations to carry over:

- Table reservations use Gastronaut: `https://gastronaut.ai/reservations/koenigswirt-historischer-landgasthof`
- Some documents are PDFs under `/_files/ugd/`. Wix hosts these, so copy any still in use into this repo before the Wix site is shut down.

The live site uses Playfair Display, Fraunces, and Helvetica Neue. Use them as reference for the visual direction, not as a fixed brand spec.

## Skills

Project skills live in `.agents/skills/` (symlinked into `.claude/skills/`) and are pinned in `skills-lock.json`:

- `frontend-design`: visual direction for new UI
- `tailwind-css-v4`: Tailwind v4 reference. Third-party skill; if it conflicts with the installed version, the installed version wins.
- `vercel-react-best-practices`: React and Next.js performance
- `web-design-guidelines`: UI and accessibility review
- `next-dev-loop`: verify changes in the running app; requires `agent-browser` >= 0.31.1
- `next-bundle-optimizer`: analyse and reduce bundle size
