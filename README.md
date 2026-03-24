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

## Structure

```
├── index.html                    # Grant overview and project summary
├── weatherbeater.html            # Weatherbeater project detail
├── old-trail-museum.html         # Old Trail Museum project detail
├── montana-dinosaur-center.html  # Montana Dinosaur Center project detail
├── style.css                     # Site-wide styles
├── main.js                       # Home page charts (Chart.js)
├── project.js                    # Shared project detail page logic
├── data/
│   └── allocations.json          # Single source of truth for all financial data
├── assets/
│   └── images/                   # Optimized .avif images
└── docs/                         # Source documents (not served)
```

## Data

All financial data lives in [`data/allocations.json`](data/allocations.json). Each project entry includes:

- `totalAllocated` – total grant allocation
- `yearlySpend` – line-item spending by fiscal year
  - `confirmed: true` – actual/verified spending
  - `confirmed: false` – planned/projected spending

Budget stats and charts on project pages reflect only confirmed (actual) spending.

## Development

This is a plain HTML/CSS/JS site — no build step required. Open any `.html` file directly in a browser, or use a local server:

```bash
npx serve .
```

## Deployment

Deployed to Cloudflare Workers via the Cloudflare GitHub integration. Pushing to `main` triggers an automatic deploy. The `wrangler.jsonc` configures Workers Assets with the project root as the asset directory.

Manual deploy (requires Cloudflare API token):

```bash
npx wrangler deploy
```

## License

[LICENSE](LICENSE)
