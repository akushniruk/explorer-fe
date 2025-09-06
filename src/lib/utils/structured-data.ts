export interface StructuredData {
	'@context': string;
	'@type': string;
	[key: string]: any;
}

export function generateWebsiteStructuredData(): StructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'ynscan - The Yellow Network Explorer',
		description: 'Explore and monitor The Yellow Network\'s channels, app sessions, and assets. Real-time network statistics and comprehensive data analysis.',
		url: 'https://ynscan.xyz',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://ynscan.xyz/search?q={search_term_string}'
			},
			'query-input': 'required name=search_term_string'
		},
		sameAs: [
			'https://twitter.com/ynscan'
		]
	};
}

export function generateOrganizationStructuredData(): StructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'ynscan',
		description: 'Decentralized network for financial applications',
		url: 'https://ynscan.xyz',
		logo: 'https://ynscan.xyz/og-preview.jpg',
		sameAs: [
			'https://twitter.com/ynscan'
		]
	};
}

export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>): StructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

export function generateChannelStructuredData(channel: any): StructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'FinancialProduct',
		name: `Payment Channel ${channel.channel_id}`,
		description: `Yellow Network payment channel with ${channel.balance_a_formatted} ${channel.asset_a_symbol} and ${channel.balance_b_formatted} ${channel.asset_b_symbol}`,
		url: `https://ynscan.xyz/channel/${channel.channel_id}`,
		provider: {
			'@type': 'Organization',
			name: 'ynscan'
		},
		identifier: channel.channel_id
	};
}

export function generateSessionStructuredData(session: any): StructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: `App Session ${session.session_id}`,
		description: `Yellow Network application session on channel ${session.channel_id}`,
		url: `https://ynscan.xyz/session/${session.session_id}`,
		applicationCategory: 'FinanceApplication',
		provider: {
			'@type': 'Organization',
			name: 'ynscan'
		},
		identifier: session.session_id
	};
}