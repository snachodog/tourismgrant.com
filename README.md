# Choteau Area Community Tourism Grant

Public-facing website for the Choteau Area Community Tourism Grant program, tracking funded projects in the Choteau and Bynum, Montana area.

**Live site:** [tourismgrant.com](https://tourismgrant.com)

## About

This site provides transparency into how grant funds are allocated and spent across major tourism infrastructure projects funded through the Montana Department of Commerce and administered by the Choteau Area Port Authority.

Funded projects include:

- **Weatherbeater Renovation** – Year-round fairgrounds event facility upgrades
- **Old Trail Museum – Rocky Mountain Front Interpretive Center** – New multi-purpose interpretive building
- **Montana Dinosaur Center Gallery Expansion** – New gallery space for the seismosaurus model and specimen storage
- **Choteau Lions Club Swim Pool** – Sandblasting, repainting, and structural repairs

## Stack

The site runs on [EmDash](https://github.com/emdash-cms/emdash) (Astro 7 on Cloudflare Workers, content in D1). Content is edited in the admin UI at `/_emdash/admin`.

```
├── seed/seed.json          # Collections, menu, site settings, and the initial content
├── src/
│   ├── layouts/Site.astro  # Header, footer, nav (from the "primary" menu), SEO tags
│   ├── pages/index.astro   # Grant overview
│   ├── pages/[slug].astro  # Major project detail pages (projects collection)
│   ├── pages/community-grants.astro
│   ├── pages/data/allocations.json.ts   # Builds the JSON that main.js/project.js chart
│   └── utils/grant.ts      # Shared queries and totals
├── public/                 # style.css, main.js, project.js, images, deadline.html, robots.txt, sitemap.xml
└── wrangler.jsonc          # Worker "pctgp-website", D1 (DB) binding
```

## Content model

- `projects`: the three major projects, with allocation, goals, milestones, and yearly spend.
- `community_projects`: community cards on the overview and the 2026 recipients list.
- `fiscal_years`: annual grant amount and community fund amount. The $2.75M and $265.8K totals are sums of these rows.

## Develop

Needs Node 22.12 or newer.

```bash
npm install
npm run dev     # then open /_emdash/admin
npm run deploy  # astro build && wrangler deploy
```

## Data

Financial data lives in the EmDash `projects` and `fiscal_years` collections (initial values in [`seed/seed.json`](seed/seed.json)). In each project's `yearly_spend`:

- `confirmed: true` is actual, verified spending.
- `confirmed: false` is planned spending.

Budget stats and charts on project pages count only confirmed spending.

## Deployment

The Cloudflare GitHub integration deploys `main`. The D1 database `pctgp-website` (binding `DB`) already exists. Media uploads in the admin are off because no R2 storage is configured; add `storage: r2({ binding: "MEDIA" })` and an R2 bucket to turn them on. On first request against an empty database, EmDash runs the setup wizard and applies `seed/seed.json`. Old `*.html` URLs redirect to the new paths.

## License

[LICENSE](LICENSE)
