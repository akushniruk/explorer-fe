import type { PageServerLoad } from './$types';
import { apiGet } from '$lib/server/api';
import { z } from 'zod';

const CountResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		total: z.number().optional(),
		count: z.number().optional()
	}),
	meta: z.object({
		timestamp: z.string(),
		requestId: z.string(),
		version: z.string()
	})
});

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

const NodeSchema = z.object({
	id: z.number().optional(),
	name: z.string(),
	endpoint: z.string().optional(),
	location: z.string().optional(),
	lat: z.number().optional(),
	lng: z.number().optional(),
	status: z.string(),
	latency_ms: z.number().optional(),
	available: z.boolean().optional(),
	version: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional()
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
		const qs = new URLSearchParams({
			limit: '6',
			sort: 'updated_at',
			order: 'desc'
		}).toString();

		// Use Promise.allSettled to handle individual failures gracefully
		const results = await Promise.allSettled([
			apiGet(event, '/api/v1/channel/count', CountResponseSchema),
			apiGet(event, '/api/v1/app-session/count', CountResponseSchema),
			apiGet(event, '/api/v1/network/count', CountResponseSchema),
			apiGet(event, '/api/v1/asset/count', CountResponseSchema),
			apiGet(event, `/api/v1/nodes/list?limit=1`, NodesResponseSchema), // nodes for count
			apiGet(event, `/api/v1/channel/list?${qs}`, ChannelsResponseSchema),
			apiGet(event, `/api/v1/app-session/list?${qs}`, SessionsResponseSchema)
		]);

		// Extract results with safe fallbacks
		const [
			channelsCount,
			sessionsCount,
			networksCount,
			assetsCount,
			nodesList,
			latestChannels,
			latestSessions
		] = results.map((result) =>
			result.status === 'fulfilled' && !result.value.notModified ? result.value.data : null
		);

		// Cache the whole dashboard for a short time
		event.setHeaders({
			'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=60'
		});

		const dashboardData = {
			counts: {
				channels: channelsCount?.data?.total ?? channelsCount?.data?.count ?? 0,
				sessions: sessionsCount?.data?.total ?? sessionsCount?.data?.count ?? 0,
				networks: networksCount?.data?.total ?? networksCount?.data?.count ?? 0,
				assets: assetsCount?.data?.total ?? assetsCount?.data?.count ?? 0,
				nodes: nodesList?.meta?.pagination?.total ?? 0
			},
			latest: {
				channels: latestChannels?.data ?? [],
				sessions: latestSessions?.data ?? []
			}
		};

		return dashboardData;
	} catch (error) {
		console.error('Error loading dashboard data:', error);

		// Return safe defaults on error
		return {
			counts: {
				channels: 0,
				sessions: 0,
				networks: 0,
				assets: 0,
				nodes: 0
			},
			latest: {
				channels: [],
				sessions: []
			}
		};
	}
};
