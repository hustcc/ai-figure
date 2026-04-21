# ai-figure site

Documentation and gallery site for [ai-figure](https://github.com/hustcc/ai-figure), deployed to [figure.ling.pub](https://figure.ling.pub).

Built with **Next.js App Router** + **Tailwind CSS 4**, statically exported and published to GitHub Pages via GitHub Actions.

## Pages

- **`/`** — Homepage: hero, feature overview, live diagram example, install + usage
- **`/docs`** — Full documentation: Getting Started, Markdown Syntax, all 10 diagram types (with live SVG previews), Framework Integration (HTML, React, Vue, Node.js), AI Skill
- **`/gallery`** — 80 diagram examples (10 types × 8 each), copy-link per card
- **`/s`** — Hash-based shareable diagram preview page

## Development

```bash
# Install library first (site imports from the package)
cd ..
npm install
npm run build

# Run the dev server
cd site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Export

```bash
npm run build   # outputs static files to site/out/
```

The `next.config.ts` sets `output: 'export'` so `npm run build` produces a fully static site under `site/out/`.

## Deploy

Deployment is handled automatically by `.github/workflows/deploy.yml` on every push to `main`:

1. Builds the library (`npm run build` in repo root)
2. Builds and exports the site (`npm run build` in `site/`)
3. Writes `figure.ling.pub` as the CNAME
4. Publishes `site/out/` to the `gh-pages` branch
