import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const base = locals.apiBase ?? '';
	const channelId = params.id;

	try {
		// Fetch both channel and node config in parallel
		const [channelResponse, nodeConfigResponse] = await Promise.all([
			fetch(`${base}/api/v1/channel/${channelId}`),
			fetch(`${base}/api/v1/node-config`).catch(() => null) // Don't fail if node-config is unavailable
		]);

		if (!channelResponse.ok) {
			if (channelResponse.status === 404) {
				return {
					channel: null,
					nodeConfig: null,
					notFound: true
				};
			}
			throw error(channelResponse.status, 'Failed to load channel');
		}

		const channelData = await channelResponse.json();

		if (!channelData.success || !channelData.data) {
			return {
				channel: null,
				nodeConfig: null,
				notFound: true
			};
		}

		// Parse node config if available
		let nodeConfig = null;
		if (nodeConfigResponse?.ok) {
			const nodeConfigData = await nodeConfigResponse.json();
			if (nodeConfigData.success && nodeConfigData.data) {
				nodeConfig = nodeConfigData.data;
			}
		}

		return {
			channel: channelData.data,
			nodeConfig
		};
	} catch (err) {
		console.error('Failed to load channel:', err);
		return {
			channel: null,
			nodeConfig: null,
			notFound: true
		};
	}
};
