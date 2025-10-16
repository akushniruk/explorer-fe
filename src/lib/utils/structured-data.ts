export interface StructuredData {
	'@context': string;
	'@type': string;
	[key: string]: any;
}

export function generateWebsiteStructuredData(): StructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'yellowscan - The Yellow Network Explorer',
		description:
			"Explore and monitor The Yellow Network's channels, app sessions, and assets. Real-time network statistics and comprehensive data analysis.",
		url: 'https://yellowscan.io',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://yellowscan.io/search?q={search_term_string}'
			},
			'query-input': 'required name=search_term_string'
		},
		sameAs: []
	};
}

export function generateOrganizationStructuredData(): StructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'yellowscan',
		description: 'Decentralized network for financial applications',
		url: 'https://yellowscan.io',
		logo: 'https://yellowscan.io/og-preview.jpg',
		sameAs: []
	};
}

export function generateBreadcrumbStructuredData(
	items: Array<{ name: string; url: string }>
): StructuredData {
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
		name: `Channel ${channel.channel_id}`,
		description: `Yellow Network channel with ${channel.balance_a_formatted} ${channel.asset_a_symbol} and ${channel.balance_b_formatted} ${channel.asset_b_symbol}`,
		url: `https://yellowscan.io/channel/${channel.channel_id}`,
		provider: {
			'@type': 'Organization',
			name: 'yellowscan'
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
		url: `https://yellowscan.io/session/${session.session_id}`,
		applicationCategory: 'FinanceApplication',
		provider: {
			'@type': 'Organization',
			name: 'yellowscan'
		},
		identifier: session.session_id
	};
}
