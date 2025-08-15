import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const base = locals.apiBase ?? '';
	const channelId = params.id;

	try {
		const response = await fetch(`${base}/api/v1/channel/${channelId}`);

		if (!response.ok) {
			if (response.status === 404) {
				return {
					channel: null,
					notFound: true
				};
			}
			throw error(response.status, 'Failed to load channel');
		}

		const data = await response.json();

		if (!data.success || !data.data) {
			return {
				channel: null,
				notFound: true
			};
		}

		return {
			channel: data.data
		};
	} catch (err) {
		console.error('Failed to load channel:', err);
		return {
			channel: null,
			notFound: true
		};
	}
};
