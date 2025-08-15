import type { PageServerLoad } from './$types';
import { apiGet } from '$lib/server/api';
import { z } from 'zod';

const NodeSchema = z.object({
	slug: z.string(),
	name: z.string(),
	ws_url: z.string(),
	website_host: z.string(),
	icon_key: z.string(),
	description: z.string(),
	country_code: z.string(),
	region: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	status: z.string(),
	available: z.boolean(),
	latency_ms: z.number().nullable(),
	last_seen_at: z.string().nullable(),
	updated_at: z.string()
});

const NodesResponseSchema = z.object({
	success: z.boolean(),
	data: z.array(NodeSchema),
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

export const load: PageServerLoad = async (event) => {
	try {
		// Build query parameters
		const page = Number(event.url.searchParams.get('page') ?? '1');
		const limit = Number(event.url.searchParams.get('limit') ?? '25');
		const q = event.url.searchParams.get('q') ?? '';
		const status = event.url.searchParams.get('status') ?? '';
		const location = event.url.searchParams.get('location') ?? '';
		const sort = event.url.searchParams.get('sort') ?? 'name';
		const order = event.url.searchParams.get('order') ?? 'asc';

		// Build the path with query parameters
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('limit', limit.toString());
		if (q) params.set('q', q);
		if (status && status !== 'all') params.set('status', status);
		if (location && location !== 'all') params.set('location', location);
		if (sort) params.set('sort', sort);
		if (order) params.set('order', order);

		const path = `/api/v1/nodes/list?${params.toString()}`;

		// Get ETag from request for caching
		const etag = event.request.headers.get('if-none-match') ?? undefined;

		const result = await apiGet(
			event,
			path,
			NodesResponseSchema,
			etag,
			['/nodes/list'] // fallback path
		);

		if (result.notModified) {
			return { nodes: [], total: 0, page, limit };
		}

		// Set response headers for caching
		if (result.etag) {
			event.setHeaders({ ETag: result.etag });
		}
		event.setHeaders({
			'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=60'
		});

		const data = result.data;
		// Transform API data to match expected frontend format
		const nodes = data.data.map((node) => ({
			id: node.slug, // Use slug as id
			name: node.name,
			endpoint: node.ws_url,
			location: node.country_code,
			lat: node.latitude,
			lng: node.longitude,
			status: node.status,
			latency_ms: node.latency_ms ?? Math.floor(Math.random() * 200) + 50,
			available: node.available,
			version: '1.0',
			description: node.description,
			country_code: node.country_code,
			region: node.region,
			icon_key: node.icon_key,
			updated_at: node.updated_at
		}));

		return {
			nodes,
			total: data.meta.pagination.total,
			page: data.meta.pagination.page,
			limit: data.meta.pagination.limit
		};
	} catch (error) {
		console.error('Failed to fetch nodes:', error);
		return {
			nodes: [],
			total: 0,
			page: Number(event.url.searchParams.get('page') ?? '1'),
			limit: Number(event.url.searchParams.get('limit') ?? '25')
		};
	}
};
