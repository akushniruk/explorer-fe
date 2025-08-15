import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiGet } from '$lib/server/api';
import { z } from 'zod';

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
	data: z.array(AppSessionSchema),
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

export const GET: RequestHandler = async (event) => {
	try {
		const limit = Number(event.url.searchParams.get('limit') ?? '6');
		const sort = event.url.searchParams.get('sort') ?? 'updated_at';
		const order = event.url.searchParams.get('order') ?? 'desc';

		const path = `/api/v1/app-session/list?limit=${limit}&sort=${sort}&order=${order}`;
		const result = await apiGet(event, path, SessionsResponseSchema);

		if (result.notModified) {
			return json({ data: [] });
		}

		// Set cache headers
		event.setHeaders({
			'Cache-Control': 'public, max-age=15, s-maxage=15',
			'Content-Type': 'application/json'
		});

		return json({
			data: result.data.data,
			total: result.data.meta.pagination.total
		});
	} catch (error) {
		console.error('Latest sessions API failed:', error);
		return json({ data: [], total: 0 });
	}
};
