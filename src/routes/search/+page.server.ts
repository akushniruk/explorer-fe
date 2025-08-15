import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	const base = locals.apiBase ?? '';
	const query = url.searchParams.get('q') || '';
	const scope = url.searchParams.get('scope') || 'all';

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
			channels: [],
			sessions: [],
			participants: []
		};

		// Search channels if scope allows
		if (scope === 'all' || scope === 'channels') {
			try {
				const channelsRes = await fetch(
					`${base}/api/v1/channel/list?search=${encodeURIComponent(query)}&limit=20`
				);
				const channelsData = channelsRes.ok ? await channelsRes.json() : null;
				results.channels =
					channelsData?.data?.filter(
						(channel: any) =>
							channel.channel_id.toLowerCase().includes(query.toLowerCase()) ||
							channel.wallet.toLowerCase().includes(query.toLowerCase()) ||
							channel.participant.toLowerCase().includes(query.toLowerCase())
					) ?? [];
			} catch (error) {
				console.error('Channel search failed:', error);
			}
		}

		// Search sessions if scope allows
		if (scope === 'all' || scope === 'sessions') {
			try {
				const sessionsRes = await fetch(
					`${base}/api/v1/app-session/list?search=${encodeURIComponent(query)}&limit=20`
				);
				const sessionsData = sessionsRes.ok ? await sessionsRes.json() : null;
				results.sessions =
					sessionsData?.data?.filter(
						(session: any) =>
							session.session_id.toLowerCase().includes(query.toLowerCase()) ||
							session.channel_id.toLowerCase().includes(query.toLowerCase()) ||
							session.participants.some((p: string) =>
								p.toLowerCase().includes(query.toLowerCase())
							)
					) ?? [];
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
