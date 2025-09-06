import type { Channel, AppSession, Asset } from '$lib/types';
import { generateWebsiteStructuredData, generateOrganizationStructuredData, generateChannelStructuredData, generateSessionStructuredData, type StructuredData } from './structured-data';

export interface SEOData {
	title: string;
	description: string;
	keywords: string;
	ogTitle: string;
	ogDescription: string;
	ogUrl?: string;
	ogImage?: string;
	twitterTitle: string;
	twitterDescription: string;
	canonical?: string;
	structuredData?: StructuredData[];
}

const baseTitle = 'ynscan';
const baseDescription = 'Explore and monitor The Yellow Network\'s channels, app sessions, and assets. Real-time network statistics and comprehensive data analysis.';
const baseKeywords = 'Yellow Network, explorer, channels, app sessions, cryptocurrency, DeFi, network scanner';
const baseUrl = 'https://ynscan.xyz';

export function createBaseSEO(): SEOData {
	return {
		title: `${baseTitle} - Yellow Network Channels & Sessions`,
		description: baseDescription,
		keywords: baseKeywords,
		ogTitle: `${baseTitle} - Yellow Network Channels & Sessions`,
		ogDescription: baseDescription,
		ogUrl: baseUrl,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `${baseTitle} - Yellow Network Channels & Sessions`,
		twitterDescription: baseDescription
	};
}

export function createHomeSEO(data: {
	channels: number;
	sessions: number;
	networks: number;
	assets: number;
	nodes: number;
}): SEOData {
	const description = baseDescription;
	
	return {
		title: `${baseTitle} - The Yellow Network Explorer`,
		description,
		keywords: `${baseKeywords}, real-time, live data`,
		ogTitle: `${baseTitle} - The Yellow Network Explorer`,
		ogDescription: description,
		ogUrl: baseUrl,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `${baseTitle} - The Yellow Network Explorer`,
		twitterDescription: description,
		canonical: baseUrl,
		structuredData: [generateWebsiteStructuredData(), generateOrganizationStructuredData()]
	};
}

export function createChannelSEO(channel: Channel): SEOData {
	const shortId = channel.channel_id.slice(0, 10) + '...';
	const amount = channel.asset?.symbol ? `${parseFloat(channel.amount)} ${channel.asset.symbol}` : channel.amount;
	const description = `Channel ${shortId} - ${amount} ${channel.status} channel between ${channel.wallet.slice(0, 10)}... and ${channel.participant.slice(0, 10)}... on Yellow Network`;
	
	return {
		title: `Channel ${shortId} | ${baseTitle}`,
		description,
		keywords: `${baseKeywords}, channel ${channel.channel_id}, ${channel.asset?.symbol || 'token'}, ${channel.status}`,
		ogTitle: `Channel ${shortId} - ${channel.status}`,
		ogDescription: description,
		ogUrl: `${baseUrl}/channel/${channel.channel_id}`,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `Channel ${shortId}`,
		twitterDescription: description,
		canonical: `${baseUrl}/channel/${channel.channel_id}`,
		structuredData: [generateChannelStructuredData(channel)]
	};
}

export function createSessionSEO(session: AppSession): SEOData {
	const shortId = session.session_id.slice(0, 10) + '...';
	const participants = session.participants.length;
	const description = `App Session ${shortId} - ${session.protocol} protocol with ${participants} participant${participants !== 1 ? 's' : ''} on Yellow Network`;
	
	return {
		title: `Session ${shortId} | ${baseTitle}`,
		description,
		keywords: `${baseKeywords}, session ${session.session_id}, ${session.protocol}, ${session.status}`,
		ogTitle: `Session ${shortId} - ${session.protocol}`,
		ogDescription: description,
		ogUrl: `${baseUrl}/session/${session.session_id}`,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `Session ${shortId}`,
		twitterDescription: description,
		canonical: `${baseUrl}/session/${session.session_id}`,
		structuredData: [generateSessionStructuredData(session)]
	};
}

export function createChannelsListSEO(total: number, page: number = 1): SEOData {
	const description = `Browse channels on Yellow Network. View active and closed channels with real-time updates.`;
	
	return {
		title: `Channels | ${baseTitle}`,
		description,
		keywords: `${baseKeywords}, all channels, channel list`,
		ogTitle: `Channels on Yellow Network`,
		ogDescription: description,
		ogUrl: `${baseUrl}/channels${page > 1 ? `?page=${page}` : ''}`,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `Channels | ${baseTitle}`,
		twitterDescription: description,
		canonical: `${baseUrl}/channels${page > 1 ? `?page=${page}` : ''}`
	};
}

export function createSessionsListSEO(total: number, page: number = 1): SEOData {
	const description = `Browse app sessions on Yellow Network. View active protocol sessions and applications.`;
	
	return {
		title: `Sessions | ${baseTitle}`,
		description,
		keywords: `${baseKeywords}, all sessions, session list`,
		ogTitle: `Sessions on Yellow Network`,
		ogDescription: description,
		ogUrl: `${baseUrl}/sessions${page > 1 ? `?page=${page}` : ''}`,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `Sessions | ${baseTitle}`,
		twitterDescription: description,
		canonical: `${baseUrl}/sessions${page > 1 ? `?page=${page}` : ''}`
	};
}

export function createSearchSEO(query: string, results?: number): SEOData {
	const description = `Search for "${query}" on Yellow Network Explorer - Find channels, sessions, addresses and tokens`;
	
	return {
		title: `Search: ${query} | ${baseTitle}`,
		description,
		keywords: `${baseKeywords}, search ${query}, find ${query}`,
		ogTitle: `Search Results: ${query}`,
		ogDescription: description,
		ogUrl: `${baseUrl}/search?q=${encodeURIComponent(query)}`,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `Search: ${query}`,
		twitterDescription: description,
		canonical: `${baseUrl}/search?q=${encodeURIComponent(query)}`
	};
}

export function createAssetsSEO(total: number): SEOData {
	const description = `Explore tokens and assets on Yellow Network. View token details, balances, and trading activity.`;
	
	return {
		title: `Assets & Tokens | ${baseTitle}`,
		description,
		keywords: `${baseKeywords}, assets, tokens`,
		ogTitle: `Assets on Yellow Network`,
		ogDescription: description,
		ogUrl: `${baseUrl}/assets`,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `Assets | ${baseTitle}`,
		twitterDescription: description,
		canonical: `${baseUrl}/assets`
	};
}

export function createNodesSEO(active: number, total: number): SEOData {
	const description = `Monitor network nodes on Yellow Network. Real-time network infrastructure status and map visualization.`;
	
	return {
		title: `Network Nodes | ${baseTitle}`,
		description,
		keywords: `${baseKeywords}, nodes, network, infrastructure, map`,
		ogTitle: `Network Nodes on Yellow Network`,
		ogDescription: description,
		ogUrl: `${baseUrl}/nodes`,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `Network Nodes | ${baseTitle}`,
		twitterDescription: description,
		canonical: `${baseUrl}/nodes`
	};
}

export function createAddressSEO(address: string, stats: { totalChannels: number; activeChannels: number; totalSessions: number; activeSessions: number }): SEOData {
	const shortAddr = address.slice(0, 10) + '...';
	const description = `View address ${shortAddr} activity on Yellow Network. Channel participation, session history, and network statistics.`;
	
	return {
		title: `Address ${shortAddr} | ${baseTitle}`,
		description,
		keywords: `${baseKeywords}, address ${address}, wallet, activity`,
		ogTitle: `Address ${shortAddr} on Yellow Network`,
		ogDescription: description,
		ogUrl: `${baseUrl}/address/${address}`,
		ogImage: `${baseUrl}/og-preview.jpg`,
		twitterTitle: `Address ${shortAddr}`,
		twitterDescription: description,
		canonical: `${baseUrl}/address/${address}`
	};
}