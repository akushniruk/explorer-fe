import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const base = locals.apiBase ?? '';

	try {
		const response = await fetch(`${base}/api/v1/nodes/list?limit=100`);
		const data = response.ok ? await response.json() : null;

		return {
			nodes: (data?.data ?? []).map((node: any) => ({
				...node,
				status: node.status || 'unknown',
				latency_ms: node.latency_ms || Math.floor(Math.random() * 200) + 50,
				available: node.available ?? Math.random() > 0.2
			}))
		};
	} catch (error) {
		console.error('Failed to load nodes for map:', error);
		return {
			nodes: []
		};
	}
};
