import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals, setHeaders }) => {
	const base = locals.apiBase ?? '';

	console.log('API Base URL:', base); // Debug log

	try {
		const qs = new URLSearchParams({ limit: '6', sortBy: 'updated_at', order: 'desc' }).toString();

		const [
			chCountRes,
			asCountRes,
			netCountRes,
			assetsCountRes,
			nodesListRes,
			latestChannelsRes,
			latestSessionsRes
		] = await Promise.all([
			fetch(`${base}/api/v1/channel/count`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			fetch(`${base}/api/v1/app-session/count`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			fetch(`${base}/api/v1/network/count`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			fetch(`${base}/api/v1/asset/count`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			// nodes do not have /count; grab total from pagination meta with limit=1
			fetch(`${base}/api/v1/nodes/list?limit=1`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			fetch(`${base}/api/v1/channel/list?${qs}`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null),
			fetch(`${base}/api/v1/app-session/list?${qs}`)
				.then((r) => (r.ok ? r.json() : null))
				.catch(() => null)
		]);

		const nodesTotal = nodesListRes?.meta?.pagination?.total ?? 0;

		// Cache the whole dashboard for a short time; lists will also CSR-refresh
		setHeaders({
			'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=60'
		});

		const result = {
			counts: {
				channels: chCountRes?.data?.total ?? chCountRes?.data?.count ?? 0,
				sessions: asCountRes?.data?.total ?? asCountRes?.data?.count ?? 0,
				networks: netCountRes?.data?.total ?? netCountRes?.data?.count ?? 0,
				assets: assetsCountRes?.data?.total ?? assetsCountRes?.data?.count ?? 0,
				nodes: nodesTotal
			},
			latest: {
				channels: latestChannelsRes?.data ?? [],
				sessions: latestSessionsRes?.data ?? []
			}
		};

		console.log('Load function result:', JSON.stringify(result, null, 2));
		return result;
	} catch (error) {
		console.error('Error in load function:', error);
		throw error;
	}
};
