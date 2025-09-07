import type { PageServerLoad } from './$types';
import { apiGet } from '$lib/server/api';
import { z } from 'zod';
import type { AppSession } from '$lib/types';

const AppSessionSchema = z.object({
	id: z.number(),
	protocol: z.string(),
	session_id: z.string(),
	channel_id: z.string().optional(),
	nonce: z.string(),
	participants: z.array(z.string()),
	weight: z.array(z.number()).optional(),
	quorum: z.string().optional(),
	version: z.string().optional(),
	status: z.string(),
	challenge: z.string().optional(),
	session_data: z.any().nullable().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional()
});

const SessionsResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		items: z.array(AppSessionSchema),
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

export const load: PageServerLoad = async (event) => {
	try {
		// Build query parameters
		const page = Number(event.url.searchParams.get('page') ?? '1');
		const limit = Number(event.url.searchParams.get('limit') ?? '25');
		const q = event.url.searchParams.get('q') ?? '';
		const status = event.url.searchParams.get('status') ?? '';
		const protocol = event.url.searchParams.get('protocol') ?? '';
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
		if (protocol && protocol !== 'all') params.set('protocol', protocol);
		if (sort) params.set('sort', sort);
		if (order) params.set('order', order);

		const path = `/api/v1/app-session/list?${params.toString()}`;

		// Get ETag from request for caching
		const etag = event.request.headers.get('if-none-match') ?? undefined;

		const result = await apiGet(
			event,
			path,
			SessionsResponseSchema,
			etag,
			['/app-sessions/list'] // fallback path
		);

		if (result.notModified) {
			return { sessions: [], total: 0, page, limit };
		}

		// Set response headers for caching
		if (result.etag) {
			event.setHeaders({ ETag: result.etag });
		}
		event.setHeaders({
			'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=60'
		});

		const data = result.data;
		return {
			sessions: data.data.items as AppSession[],
			total: data.meta.pagination.total,
			page: data.meta.pagination.page,
			limit: data.meta.pagination.limit
		};
	} catch (error) {
		console.error('Failed to fetch sessions:', error);
		return {
			sessions: [],
			total: 0,
			page: Number(event.url.searchParams.get('page') ?? '1'),
			limit: Number(event.url.searchParams.get('limit') ?? '25')
		};
	}
};
