import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	site: "https://tourismgrant.com",
	redirects: {
		"/index.html": "/",
		"/weatherbeater.html": "/weatherbeater",
		"/old-trail-museum.html": "/old-trail-museum",
		"/montana-dinosaur-center.html": "/montana-dinosaur-center",
		"/community-grants.html": "/community-grants",
	},
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
		}),
	],
	devToolbar: { enabled: false },
});
