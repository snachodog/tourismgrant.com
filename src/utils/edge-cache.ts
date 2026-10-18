/**
 * Cache policy for Workers Cache (`cache.enabled` in wrangler.jsonc).
 *
 * Cloudflare checks the cache before the Worker runs, so a hit costs no CPU.
 * That matters on the Free plan, where a cold SSR render can pass the 10 ms
 * CPU limit and come back as a 503.
 *
 * Workers Cache stores any 200 that has no Cache-Control for 2 hours, and its
 * key ignores cookies. So this marks public responses cacheable and everything
 * else no-store, which keeps the admin UI, API and signed-in pages out.
 */

// Edge only (Cloudflare-CDN-Cache-Control is not sent to browsers).
const EDGE_CACHE_CONTROL = "max-age=120, stale-while-revalidate=86400";
const BROWSER_CACHE_CONTROL = "public, max-age=60";

const CACHEABLE_STATUSES = new Set([200, 301, 308, 404]);
const PRIVATE_PREFIXES = ["/_emdash", "/_actions"];

function isCacheable(request: Request, response: Response): boolean {
	if (request.method !== "GET" && request.method !== "HEAD") return false;
	if (!CACHEABLE_STATUSES.has(response.status)) return false;

	// A signed-in request can get a different page (edit toolbar, drafts).
	if (request.headers.has("cookie") || request.headers.has("authorization")) return false;

	const url = new URL(request.url);
	// Query strings carry preview tokens and tracking params.
	if (url.search) return false;
	if (PRIVATE_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return false;

	if (response.headers.has("set-cookie")) return false;
	if (/\b(private|no-store)\b/i.test(response.headers.get("cache-control") ?? "")) return false;
	return true;
}

export function applyCachePolicy(request: Request, response: Response): Response {
	if (response.status === 101) return response;

	const out = new Response(response.body, response);
	if (isCacheable(request, response)) {
		out.headers.set("Cloudflare-CDN-Cache-Control", EDGE_CACHE_CONTROL);
		out.headers.set("Cache-Control", BROWSER_CACHE_CONTROL);
	} else if (!out.headers.has("cache-control")) {
		out.headers.set("Cache-Control", "private, no-store");
	}
	return out;
}
