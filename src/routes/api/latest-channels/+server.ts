import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiGet } from '$lib/server/api';
import { z } from 'zod';

const ChannelSchema = z.object({
	channel_id: z.string(),
	wallet: z.string(),
	participant: z.string(),
	amount: z.string(),
	status: z.string(),
	chain_id: z.string().optional(),
	updated_at: z.string().optional(),
	created_at: z.string().optional()
});

const ChannelsResponseSchema = z.object({
	success: z.boolean(),
	data: z.array(ChannelSchema),
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

		const path = `/channel/list?limit=${limit}&sort=${sort}&order=${order}`;
		const result = await apiGet(event, path, ChannelsResponseSchema);

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
		console.error('Latest channels API failed:', error);
		return json({ data: [], total: 0 });
	}
};
