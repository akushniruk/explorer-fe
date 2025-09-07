import type { PageServerLoad } from './$types';
import type { AddressChannelData } from '$lib/types';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const base = locals.apiBase ?? '';
	const address = params.id;

	try {
		// Use the new universal address endpoint
		const [channelsRes, sessionsRes] = await Promise.all([
			fetch(`${base}/api/v1/channel/address/${address}?limit=100`).catch(() => null),
			fetch(`${base}/api/v1/app-session/list?participant=${address}&limit=100`).catch(() => null)
		]);

		const channelsData: { data?: AddressChannelData } = channelsRes?.ok ? await channelsRes.json() : { data: undefined };
		const sessionsData = sessionsRes?.ok ? await sessionsRes.json() : null;

		const channels = channelsData?.data?.items ?? [];
		const sessions = sessionsData?.data?.items ?? [];
		const lookupType = channelsData?.data?.lookupType;
		const relatedWallet = channelsData?.data?.wallet;
		const relatedParticipants = channelsData?.data?.participants ?? [];

		// Calculate stats
		const activeChannels = channels.filter((c: any) => c.status === 'open').length;
		const activeSessions = sessions.filter((s: any) => s.status === 'active').length;

		return {
			address,
			lookupType,
			wallet: relatedWallet,
			participants: relatedParticipants,
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
		console.error('Failed to load address data:', error);
		return {
			address,
			lookupType: undefined,
			wallet: undefined,
			participants: [],
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
