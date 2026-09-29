import { getEmDashCollection } from "emdash";

const BY_ORDER = { orderBy: { sort_order: "asc" } } as const;

export const badgeClass = (status?: string | null) =>
	status === "Complete" ? "badge-complete" : status === "In Progress" ? "badge-in-progress" : "badge-planning";

export const dollars = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export async function loadGrant() {
	const [projects, community, years] = await Promise.all([
		getEmDashCollection("projects", BY_ORDER),
		getEmDashCollection("community_projects", BY_ORDER),
		getEmDashCollection("fiscal_years", BY_ORDER),
	]);
	const totalGrant = years.entries.reduce((s, y) => s + Number(y.data.amount ?? 0), 0);
	const communityFundTotal = years.entries.reduce((s, y) => s + Number(y.data.community_amount ?? 0), 0);
	return {
		projects: projects.entries,
		community: community.entries,
		years: years.entries,
		totalGrant,
		communityFundTotal,
		cacheHints: [projects.cacheHint, community.cacheHint, years.cacheHint],
	};
}
