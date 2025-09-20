import type { PageServerLoad } from './$types';
import type { Node } from '$lib/types';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const base = locals.apiBase ?? '';
	const slug = params.slug;

	try {
		// Get node by slug
		const nodeResponse = await fetch(`${base}/api/v1/nodes/slug/${slug}`);
		const nodeData = nodeResponse.ok ? await nodeResponse.json() : null;
		const node: Node | null = nodeData?.data || null;

		if (!node) {
			// Try to find by address if slug lookup fails
			const addressResponse = await fetch(`${base}/api/v1/nodes/${slug}`);
			const addressData = addressResponse.ok ? await addressResponse.json() : null;
			const nodeByAddress: Node | null = addressData?.data || null;

			if (nodeByAddress) {
				// Redirect to proper slug URL if found by address
				throw new Response('', {
					status: 302,
					headers: {
						location: `/node/${nodeByAddress.slug}`
					}
				});
			}

			// Node not found
			throw new Response('Node not found', { status: 404 });
		}

		// Get channel statistics for this node
		const channelsResponse = await fetch(`${base}/api/v1/channel/list?limit=1`);
		const channelsData = channelsResponse.ok ? await channelsResponse.json() : null;
		const totalChannels = channelsData?.meta?.pagination?.total || 0;

		const activeChannelsResponse = await fetch(`${base}/api/v1/channel/list?status=open&limit=1`);
		const activeChannelsData = activeChannelsResponse.ok
			? await activeChannelsResponse.json()
			: null;
		const activeChannels = activeChannelsData?.meta?.pagination?.total || 0;

		return {
			node,
			stats: {
				totalChannels,
				activeChannels
			}
		};
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}

		console.error('Failed to load node data:', error);
		throw new Response('Internal server error', { status: 500 });
	}
};
