import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const base = locals.apiBase ?? '';
	const participantId = params.id;

	try {
		// Fetch channels where this participant is involved
		const [channelsRes, sessionsRes] = await Promise.all([
			fetch(`${base}/api/v1/channel/list?participant=${participantId}&limit=100`).catch(() => null),
			fetch(`${base}/api/v1/app-session/list?participant=${participantId}&limit=100`).catch(
				() => null
			)
		]);

		const channelsData = channelsRes?.ok ? await channelsRes.json() : null;
		const sessionsData = sessionsRes?.ok ? await sessionsRes.json() : null;

		const channels = channelsData?.data ?? [];
		const sessions = sessionsData?.data ?? [];

		// Calculate stats
		const activeChannels = channels.filter((c: any) => c.status === 'open').length;
		const activeSessions = sessions.filter((s: any) => s.status === 'active').length;

		return {
			participantId,
			channels,
			sessions,
			stats: {
				totalChannels: channels.length,
				activeChannels,
				totalSessions: sessions.length,
				activeSessions
			}
		};
	} catch (error) {
		console.error('Failed to load participant data:', error);
		return {
			participantId,
			channels: [],
			sessions: [],
			stats: {
				totalChannels: 0,
				activeChannels: 0,
				totalSessions: 0,
				activeSessions: 0
			}
		};
	}
};
