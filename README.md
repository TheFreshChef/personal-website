# Edric Irimpan — Portfolio

Personal portfolio site. Dark, single-accent design system (grey ramp + electric blue), film-grain overlay, aurora glow backdrop, spotlight glass cards, and scroll-reveal animations — no UI libraries, all hand-rolled CSS.

## Stack

- Vite + React 19 + TypeScript
- Plain CSS (`src/styles.css`) — design tokens in `:root`
- Content lives in `src/data.ts` — edit that file to update projects, experience, or skills without touching components

## Develop

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
```

Output goes to `dist/`. Deploys as a static site anywhere — for Vercel or Netlify just import the repo (framework preset: Vite). For GitHub Pages, set `base` in `vite.config.ts` to `/<repo-name>/` first.

## Notes

- ZER0 SH0T screenshots are local copies in `public/zer0shot/` (originals on [itch.io](https://redathena.itch.io/zer0-sh0t)).
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (labels) via Google Fonts.
