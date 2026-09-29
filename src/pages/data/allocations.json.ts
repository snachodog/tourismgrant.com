import type { APIRoute } from "astro";
import { loadGrant } from "../../utils/grant";

export const prerender = false;

/**
 * Same JSON shape the old static data/allocations.json had, so main.js and
 * project.js work unchanged. Built from the EmDash collections.
 */
export const GET: APIRoute = async () => {
	const g = await loadGrant();
	const body = {
		totalGrant: g.totalGrant,
		communityFundTotal: g.communityFundTotal,
		fiscalYear: "June 1 – May 31",
		annualAllocations: g.years.map((y) => ({ year: y.data.title, amount: y.data.amount, note: y.data.period_note })),
		projectAllocations: g.projects.map((p) => ({ name: p.data.title, amount: p.data.allocated })),
		communityFundAnnual: g.years.map((y) => ({ year: y.data.title, amount: y.data.community_amount, note: y.data.community_note })),
		projectDetails: g.projects.map((p) => ({
			id: p.id,
			name: p.data.title,
			page: `/${p.id}`,
			status: p.data.detail_status,
			totalAllocated: p.data.allocated,
			goals: p.data.goals ?? [],
			milestones: p.data.milestones ?? [],
			yearlySpend: p.data.yearly_spend ?? [],
		})),
	};
	return new Response(JSON.stringify(body), {
		headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
	});
};
