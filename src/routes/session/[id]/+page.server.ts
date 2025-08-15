import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const base = locals.apiBase ?? '';
	const sessionId = params.id;

	try {
		const response = await fetch(`${base}/api/v1/session/${sessionId}`);

		if (!response.ok) {
			if (response.status === 404) {
				return {
					session: null,
					notFound: true
				};
			}
			throw error(response.status, 'Failed to load session');
		}

		const data = await response.json();

		if (!data.success || !data.data) {
			return {
				session: null,
				notFound: true
			};
		}

		return {
			session: data.data
		};
	} catch (err) {
		console.error('Failed to load session:', err);
		return {
			session: null,
			notFound: true
		};
	}
};
