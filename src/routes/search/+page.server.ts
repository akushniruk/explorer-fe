import type { PageServerLoad } from './$types';
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

export const load: PageServerLoad = async (event) => {
	const query = event.url.searchParams.get('q') || '';
	const scope = event.url.searchParams.get('scope') || 'all';

	if (!query) {
		return {
			query: '',
			scope,
			results: {
				channels: [],
				sessions: [],
				participants: []
			},
			total: 0
		};
	}

	try {
		const results = {
			channels: [] as any[],
			sessions: [] as any[],
			participants: [] as string[]
		};

		// Search channels if scope allows
		if (scope === 'all' || scope === 'channels') {
			try {
				const channelsPath = `/api/v1/channel/list?q=${encodeURIComponent(query)}&limit=20`;
				const channelsResult = await apiGet(
					event,
					channelsPath,
					ChannelsResponseSchema,
					undefined,
					['/channels/list']
				);

				if (!channelsResult.notModified) {
					results.channels = channelsResult.data.data.items.filter(
						(channel: any) =>
							channel.channel_id.toLowerCase().includes(query.toLowerCase()) ||
							channel.wallet.toLowerCase().includes(query.toLowerCase()) ||
							channel.participant.toLowerCase().includes(query.toLowerCase())
					);
				}
			} catch (error) {
				console.error('Channel search failed:', error);
			}
		}

		// Search sessions if scope allows
		if (scope === 'all' || scope === 'sessions') {
			try {
				const sessionsPath = `/api/v1/app-session/list?q=${encodeURIComponent(query)}&limit=20`;
				const sessionsResult = await apiGet(
					event,
					sessionsPath,
					SessionsResponseSchema,
					undefined,
					['/app-sessions/list']
				);

				if (!sessionsResult.notModified) {
					results.sessions = sessionsResult.data.data.items.filter(
						(session: any) =>
							session.session_id.toLowerCase().includes(query.toLowerCase()) ||
							session.channel_id?.toLowerCase().includes(query.toLowerCase()) ||
							session.participants.some((p: string) =>
								p.toLowerCase().includes(query.toLowerCase())
							)
					);
				}
			} catch (error) {
				console.error('Session search failed:', error);
			}
		}

		// Search participants if scope allows
		if (scope === 'all' || scope === 'participants') {
			// Extract unique participants from channels and sessions that match the query
			const participantSet = new Set<string>();

			// Add participants from channels
			results.channels.forEach((channel: any) => {
				if (channel.wallet.toLowerCase().includes(query.toLowerCase())) {
					participantSet.add(channel.wallet);
				}
				if (channel.participant.toLowerCase().includes(query.toLowerCase())) {
					participantSet.add(channel.participant);
				}
			});

			// Add participants from sessions
			results.sessions.forEach((session: any) => {
				session.participants?.forEach((participant: string) => {
					if (participant.toLowerCase().includes(query.toLowerCase())) {
						participantSet.add(participant);
					}
				});
			});

			// If query looks like an address, add it directly
			if (query.startsWith('0x') && query.length >= 10) {
				participantSet.add(query);
			}

			results.participants = Array.from(participantSet).slice(0, 20);
		}

		const total = results.channels.length + results.sessions.length + results.participants.length;

		return {
			query,
			scope,
			results,
			total
		};
	} catch (error) {
		console.error('Search failed:', error);
		return {
			query,
			scope,
			results: {
				channels: [],
				sessions: [],
				participants: []
			},
			total: 0
		};
	}
};
