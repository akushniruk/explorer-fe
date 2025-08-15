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
	chain_id: z.string().optional()
});

const AppSessionSchema = z.object({
	id: z.number(),
	session_id: z.string(),
	channel_id: z.string().optional(),
	participants: z.array(z.string()),
	status: z.string()
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

interface SearchSuggestion {
	id: string;
	text: string;
	type: 'channel' | 'session' | 'participant';
	description?: string;
}

export const GET: RequestHandler = async (event) => {
	const query = event.url.searchParams.get('q');

	if (!query || query.length < 2) {
		return json({ suggestions: [] });
	}

	try {
		const suggestions: SearchSuggestion[] = [];

		// Search channels and sessions in parallel
		const [channelsResult, sessionsResult] = await Promise.allSettled([
			apiGet(
				event,
				`/api/v1/channel/list?q=${encodeURIComponent(query)}&limit=5`,
				ChannelsResponseSchema
			),
			apiGet(
				event,
				`/api/v1/app-session/list?q=${encodeURIComponent(query)}&limit=5`,
				SessionsResponseSchema
			)
		]);

		// Process channel suggestions
		if (channelsResult.status === 'fulfilled' && !channelsResult.value.notModified) {
			const channels = channelsResult.value.data.data;
			channels.forEach((channel) => {
				// Add channel suggestion
				suggestions.push({
					id: channel.channel_id,
					text: channel.channel_id,
					type: 'channel',
					description: `Channel • ${channel.status}`
				});

				// Add unique participant suggestions
				const participants = [channel.wallet, channel.participant].filter(Boolean);
				participants.forEach((participant) => {
					if (!suggestions.find((s) => s.text === participant)) {
						suggestions.push({
							id: participant,
							text: participant,
							type: 'participant',
							description: 'Participant'
						});
					}
				});
			});
		}

		// Process session suggestions
		if (sessionsResult.status === 'fulfilled' && !sessionsResult.value.notModified) {
			const sessions = sessionsResult.value.data.data;
			sessions.forEach((session) => {
				// Add session suggestion
				suggestions.push({
					id: session.session_id,
					text: session.session_id,
					type: 'session',
					description: `Session • ${session.status}`
				});

				// Add unique participant suggestions from sessions
				session.participants?.forEach((participant) => {
					if (!suggestions.find((s) => s.text === participant)) {
						suggestions.push({
							id: participant,
							text: participant,
							type: 'participant',
							description: 'Participant'
						});
					}
				});
			});
		}

		// Limit and sort suggestions
		const limitedSuggestions = suggestions
			.filter(
				(suggestion, index, array) =>
					// Remove duplicates
					array.findIndex((s) => s.text === suggestion.text) === index
			)
			.slice(0, 8); // Limit to 8 suggestions

		// Set cache headers for short caching
		event.setHeaders({
			'Cache-Control': 'public, max-age=30, s-maxage=30',
			'Content-Type': 'application/json'
		});

		return json({ suggestions: limitedSuggestions });
	} catch (error) {
		console.error('Search suggestions failed:', error);
		return json({ suggestions: [] });
	}
};
