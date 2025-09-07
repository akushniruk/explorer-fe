import type { PageServerLoad } from './$types';
import { apiGet } from '$lib/server/api';
import { z } from 'zod';

const CountResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		total: z.number()
	}),
	meta: z.object({
		timestamp: z.string(),
		requestId: z.string(),
		version: z.string()
	})
});

const ActiveNodesResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		total: z.number()
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
	token: z.string(),
	adjudicator: z.string(),
	amount: z.string(),
	status: z.string(),
	chain_id: z.string().optional(),
	updated_at: z.string().optional(),
	created_at: z.string().optional(),
	asset: z
		.object({
			symbol: z.string(),
			decimals: z.string()
		})
		.nullable()
		.optional()
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
			apiGet(event, '/api/v1/nodes/count-active', ActiveNodesResponseSchema), // active nodes count
			apiGet(event, `/api/v1/channel/list?${qs}`, ChannelsResponseSchema),
			apiGet(event, `/api/v1/app-session/list?${qs}`, SessionsResponseSchema),
			apiGet(event, '/api/v1/node-config', NodeConfigResponseSchema)
		]);

		// Extract results with safe fallbacks
		const [
			channelsCountResult,
			sessionsCountResult,
			networksCountResult,
			assetsCountResult,
			activeNodesCountResult,
			latestChannelsResult,
			latestSessionsResult,
			nodeConfigResult
		] = results;

		// Type-safe data extraction
		const channelsCount = channelsCountResult.status === 'fulfilled' ? channelsCountResult.value : null;
		const sessionsCount = sessionsCountResult.status === 'fulfilled' ? sessionsCountResult.value : null;
		const networksCount = networksCountResult.status === 'fulfilled' ? networksCountResult.value : null;
		const assetsCount = assetsCountResult.status === 'fulfilled' ? assetsCountResult.value : null;
		const activeNodesCount = activeNodesCountResult.status === 'fulfilled' ? activeNodesCountResult.value : null;
		const latestChannels = latestChannelsResult.status === 'fulfilled' ? latestChannelsResult.value : null;
		const latestSessions = latestSessionsResult.status === 'fulfilled' ? latestSessionsResult.value : null;

		// Extract actual data, handling cache state properly  
		const getApiData = (result: any) => {
			if (!result) return null;
			console.log('getApiData result keys:', Object.keys(result));
			console.log('getApiData result.data:', result.data);
			// Don't filter based on notModified - we want the actual data
			return result.data;
		};

		const dashboardData = {
			counts: {
				channels: getApiData(channelsCount)?.data?.total ?? 0,
				sessions: getApiData(sessionsCount)?.data?.total ?? 0,
				networks: getApiData(networksCount)?.data?.total ?? 0,
				assets: getApiData(assetsCount)?.data?.total ?? 0,
				nodes: getApiData(activeNodesCount)?.data?.total ?? 0
			},
			latest: {
				channels: getApiData(latestChannels)?.data?.items ?? [],
				sessions: getApiData(latestSessions)?.data?.items ?? []
			},
			nodeConfig: nodeConfigResult?.value?.data?.data ?? null
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
			},
			nodeConfig: null
		};
	}
};
