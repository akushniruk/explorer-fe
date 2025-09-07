import type { PageServerLoad } from './$types';
import { apiGet } from '$lib/server/api';
import { getTokenInfo } from '$lib/tokens';
import { z } from 'zod';

const AssetSchema = z.object({
	token: z.string(),
	chain_id: z.string(),
	symbol: z.string(),
	decimals: z.string(),
	name: z.string().optional(),
	total_supply: z.string().optional(),
	logo_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional()
});

const AssetsResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		items: z.array(AssetSchema),
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
		const chain = event.url.searchParams.get('chain') ?? '';
		const sort = event.url.searchParams.get('sort') ?? 'symbol';
		const order = event.url.searchParams.get('order') ?? 'asc';

		// Build the path with query parameters
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('limit', limit.toString());
		if (q) params.set('q', q);
		if (chain && chain !== 'all') params.set('chain', chain);
		if (sort) params.set('sort', sort);
		if (order) params.set('order', order);

		const path = `/api/v1/asset/list?${params.toString()}`;

		// Get ETag from request for caching
		const etag = event.request.headers.get('if-none-match') ?? undefined;

		const result = await apiGet(
			event,
			path,
			AssetsResponseSchema,
			etag,
			['/assets/list'] // fallback path
		);

		if (result.notModified) {
			return { assets: [], total: 0, page, limit };
		}

		// Set response headers for caching
		if (result.etag) {
			event.setHeaders({ ETag: result.etag });
		}
		event.setHeaders({
			'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=60'
		});

		const data = result.data;
		// Transform API data to match expected format with Uniswap token enrichment
		const assets = await Promise.all(
			data.data.items.map(async (asset) => {
				const tokenInfo = await getTokenInfo(parseInt(asset.chain_id), asset.token, asset.symbol);

				return {
					id: asset.token,
					symbol: asset.symbol,
					name: tokenInfo?.name || asset.name || asset.symbol.toUpperCase(),
					contract_address: asset.token,
					chain_id: asset.chain_id,
					decimals: parseInt(asset.decimals),
					total_supply: asset.total_supply,
					logo_url: tokenInfo?.logoUrl || ''
				};
			})
		);

		return {
			assets,
			total: data.meta.pagination.total,
			page: data.meta.pagination.page,
			limit: data.meta.pagination.limit
		};
	} catch (error) {
		console.error('Failed to fetch assets:', error);
		return {
			assets: [],
			total: 0,
			page: Number(event.url.searchParams.get('page') ?? '1'),
			limit: Number(event.url.searchParams.get('limit') ?? '25')
		};
	}
};
