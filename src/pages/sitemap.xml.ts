import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

export const prerender = false;

const esc = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Built from the database on each request, so a newly published project shows
 * up without a deploy. The two fixed pages are not collection entries, so they
 * are listed here by hand.
 */
export const GET: APIRoute = async ({ site, url }) => {
	const origin = (site ?? url).origin;
	const { entries } = await getEmDashCollection("projects", { orderBy: { sort_order: "asc" } });

	const urls: { path: string; priority: string; lastmod?: Date }[] = [
		{ path: "/", priority: "1.0" },
		...entries.map((p) => ({ path: `/${p.id}`, priority: "0.8", lastmod: p.data.updatedAt })),
		{ path: "/community-grants", priority: "0.7" },
	];

	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls.map(
			(u) =>
				`  <url>\n    <loc>${esc(origin + u.path)}</loc>\n${
					u.lastmod ? `    <lastmod>${u.lastmod.toISOString()}</lastmod>\n` : ""
				}    <changefreq>monthly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
		),
		"</urlset>",
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
	});
};
