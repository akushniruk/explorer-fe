import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	const base = locals.apiBase ?? '';

	// Get pagination params from URL
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const limit = parseInt(url.searchParams.get('limit') ?? '50');
	const sortBy = url.searchParams.get('sortBy') ?? 'updated_at';
	const order = url.searchParams.get('order') ?? 'desc';

	const qs = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		sortBy,
		order
	});

	try {
		const response = await fetch(`${base}/api/v1/app-session/list?${qs}`);
		const data = response.ok ? await response.json() : null;

		return {
			sessions: data?.data ?? [],
			total: data?.meta?.pagination?.total ?? 0,
			page,
			limit
		};
	} catch (error) {
		console.error('Failed to load sessions:', error);
		return {
			sessions: [],
			total: 0,
			page,
			limit
		};
	}
};
