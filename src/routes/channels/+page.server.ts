import type { PageServerLoad } from './$types';
import { apiGet } from '$lib/server/api';
import { z } from 'zod';
import type { Channel } from '$lib/types';

const ChannelSchema = z.object({
	channel_id: z.string(),
	chain_id: z.string(),
	token: z.string(),
	wallet: z.string(),
	participant: z.string(),
	amount: z.string(),
	status: z.string(),
	challenge: z.string(),
	nonce: z.string(),
	version: z.string(),
	adjudicator: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	asset: z
		.object({
			symbol: z.string(),
			decimals: z.string()
		})
		.nullable()
		.optional()
});

const ChannelsResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		items: z.array(ChannelSchema),
		hasMore: z.boolean()
	}),
	meta: z.object({
		timestamp: z.string(),
		requestId: z.string(),
		version: z.string(),
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number()
		})
	})
});

const NodeConfigResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		id: z.string(),
		broker_address: z.string(),
		updated_at: z.string()
	})
});

export const load: PageServerLoad = async (event) => {
	try {
		// Build query parameters
		const page = Number(event.url.searchParams.get('page') ?? '1');
		const limit = Number(event.url.searchParams.get('limit') ?? '25');
		const q = event.url.searchParams.get('q') ?? '';
		const status = event.url.searchParams.get('status') ?? '';
		const sort =
			event.url.searchParams.get('sort') ?? event.url.searchParams.get('sortBy') ?? 'updated_at';
		const order =
			event.url.searchParams.get('order') ?? event.url.searchParams.get('sortOrder') ?? 'desc';

		// Build the path with query parameters
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('limit', limit.toString());
		if (q) params.set('q', q);
		if (status && status !== 'all') params.set('status', status);
		if (sort) params.set('sort', sort);
		if (order) params.set('order', order);

		const path = `/api/v1/channel/list?${params.toString()}`;

		// Get ETag from request for caching
		const etag = event.request.headers.get('if-none-match') ?? undefined;

		// Fetch both channels and node config in parallel
		const [channelsResult, nodeConfigResult] = await Promise.allSettled([
			apiGet(event, path, ChannelsResponseSchema, etag, ['/channels/list']),
			apiGet(event, '/api/v1/node-config', NodeConfigResponseSchema)
		]);

		if (channelsResult.status === 'rejected') {
			throw channelsResult.reason;
		}

		const result = channelsResult.value;

		if (result.notModified) {
			// When 304 Not Modified is returned, the browser should use cached data
			// Don't return empty arrays - let the browser handle caching
			return new Response(null, { status: 304 });
		}

		// Set response headers for caching
		if (result.etag) {
			event.setHeaders({ ETag: result.etag });
		}
		event.setHeaders({
			'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=60'
		});

		const data = result.data;
		let nodeConfig = null;
		if (nodeConfigResult.status === 'fulfilled') {
			nodeConfig = nodeConfigResult.value.data.data;
		}

		return {
			channels: data.data.items as Channel[],
			total: data.meta.pagination.total,
			page: data.meta.pagination.page,
			limit: data.meta.pagination.limit,
			nodeConfig
		};
	} catch (error) {
		console.error('Failed to fetch channels:', error);
		return {
			channels: [],
			total: 0,
			page: Number(event.url.searchParams.get('page') ?? '1'),
			limit: Number(event.url.searchParams.get('limit') ?? '25'),
			nodeConfig: null
		};
	}
};
