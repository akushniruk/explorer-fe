import type { PageServerLoad } from './$types';
import type { AddressChannelData, Node } from '$lib/types';
import { getNodeByAddress } from '$lib/server/api';
import { z } from 'zod';

export const load: PageServerLoad = async ({ params, fetch, locals, url }) => {
	const base = locals.apiBase ?? '';
	const address = params.id;
	const addressType = url.searchParams.get('type');

	// Get pagination parameters for node addresses
	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = Number(url.searchParams.get('limit') ?? '25');

	try {
		let requests: Promise<Response | null>[];

		// If this is a node address, fetch all channels instead of address-specific channels
		if (addressType === 'node') {
			const params = new URLSearchParams();
			params.set('page', page.toString());
			params.set('limit', limit.toString());

			// Also get active channels count
			const activeParams = new URLSearchParams();
			activeParams.set('status', 'open');
			activeParams.set('limit', '1'); // We only need the count, not the data

			requests = [
				fetch(`${base}/api/v1/channel/list?${params.toString()}`).catch(() => null), // All channels with pagination
				fetch(`${base}/api/v1/app-session/list?participant=${address}&limit=100`).catch(() => null),
				fetch(`${base}/api/v1/nodes/${address}`).catch(() => null),
				fetch(`${base}/api/v1/channel/list?${activeParams.toString()}`).catch(() => null) // Active channels count
			];
		} else {
			// Use the normal address-specific endpoint for non-node addresses
			requests = [
				fetch(`${base}/api/v1/channel/address/${address}?limit=100`).catch(() => null),
				fetch(`${base}/api/v1/app-session/list?participant=${address}&limit=100`).catch(() => null)
			];
		}

		const responses = await Promise.all(requests);
		const [channelsRes, sessionsRes, nodeRes, activeChannelsRes] = responses;

		const channelsData = channelsRes?.ok ? await channelsRes.json() : null;
		const sessionsData = sessionsRes?.ok ? await sessionsRes.json() : null;
		const nodeData = nodeRes?.ok ? await nodeRes.json() : null;
		const activeChannelsData = activeChannelsRes?.ok ? await activeChannelsRes.json() : null;

		let channels: any[] = [];
		let lookupType: string | undefined;
		let relatedWallet: string | undefined;
		let relatedParticipants: string[] = [];
		let pagination: any = null;

		if (addressType === 'node') {
			// For node addresses, use all channels from the list endpoint
			channels = channelsData?.data?.items ?? [];
			lookupType = 'wallet'; // Set default for nodes
			pagination = channelsData?.meta?.pagination || null;
		} else {
			// For regular addresses, use the address-specific data structure
			const addressChannelData: { data?: AddressChannelData } = channelsData || { data: undefined };
			channels = addressChannelData?.data?.items ?? [];
			lookupType = addressChannelData?.data?.lookupType;
			relatedWallet = addressChannelData?.data?.wallet;
			relatedParticipants = addressChannelData?.data?.participants ?? [];
		}

		const sessions = sessionsData?.data?.items ?? [];

		// Calculate stats
		let activeChannels: number;
		let totalChannelsCount: number;

		if (addressType === 'node') {
			// For node addresses, use the total counts from API responses
			totalChannelsCount = pagination?.total ?? 0;
			activeChannels = activeChannelsData?.meta?.pagination?.total ?? 0;
		} else {
			// For regular addresses, count from the current data
			activeChannels = channels.filter((c: any) => c.status === 'open').length;
			totalChannelsCount = channels.length;
		}

		const activeSessions = sessions.filter((s: any) => s.status === 'active').length;

		return {
			address,
			lookupType,
			addressType,
			wallet: relatedWallet,
			participants: relatedParticipants,
			channels,
			sessions,
			node: nodeData?.data || null,
			pagination,
			stats: {
				totalChannels: totalChannelsCount,
				activeChannels,
				totalSessions: sessions.length,
				activeSessions
			}
		};
	} catch (error) {
		console.error('Failed to load address data:', error);
		return {
			address,
			lookupType: addressType === 'node' ? 'wallet' : undefined,
			addressType,
			wallet: undefined,
			participants: [],
			channels: [],
			sessions: [],
			node: null,
			pagination: null,
			stats: {
				totalChannels: 0,
				activeChannels: 0,
				totalSessions: 0,
				activeSessions: 0
			}
		};
	}
};
