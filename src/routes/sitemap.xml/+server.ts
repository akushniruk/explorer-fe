import type { RequestHandler } from './$types';

const siteUrl = 'https://ynscan.xyz';

// Helper function to validate blockchain addresses (Ethereum format)
function isValidAddress(address: string): boolean {
	// Check if it's a valid Ethereum address (42 chars starting with 0x)
	if (address && typeof address === 'string') {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	}
	return false;
}

export const GET: RequestHandler = async ({ locals }) => {
	// Set a timeout for the entire sitemap generation
	const timeoutPromise = new Promise<Response>((_, reject) => {
		setTimeout(() => reject(new Error('Sitemap generation timeout')), 8000);
	});

	const sitemapPromise = (async (): Promise<Response> => {
	try {
		const apiBase = locals.apiBase;
		
		// Static routes
		const staticRoutes = [
			'',
			'/channels',
			'/sessions',
			'/assets',
			'/nodes',
			'/search'
		];

		// Fetch dynamic routes with timeout - get more comprehensive data
		const fetchWithTimeout = (url: string, timeout = 3000) => {
			return Promise.race([
				fetch(url),
				new Promise<Response>((_, reject) => 
					setTimeout(() => reject(new Error('Fetch timeout')), timeout)
				)
			]);
		};

		const [channelsRes, sessionsRes, assetsRes, nodesRes] = await Promise.allSettled([
			fetchWithTimeout(`${apiBase}/api/v1/channel/list?limit=500`),
			fetchWithTimeout(`${apiBase}/api/v1/app-session/list?limit=500`), 
			fetchWithTimeout(`${apiBase}/api/v1/asset/list?limit=500`),
			fetchWithTimeout(`${apiBase}/api/v1/nodes/list?limit=500`)
		]);

		const dynamicUrls: string[] = [];

		// Add channel URLs
		if (channelsRes.status === 'fulfilled' && channelsRes.value.ok) {
			const channelsData = await channelsRes.value.json();
			if (channelsData.success && channelsData.data) {
				const items = Array.isArray(channelsData.data) ? channelsData.data : channelsData.data.items || [];
				items.forEach((channel: any) => {
					if (channel.channel_id) {
						dynamicUrls.push(`/channel/${channel.channel_id}`);
					}
					// Add participant addresses based on actual schema - validate hex format
					if (channel.wallet && isValidAddress(channel.wallet)) {
						dynamicUrls.push(`/address/${channel.wallet}`);
					}
					if (channel.participant && isValidAddress(channel.participant)) {
						dynamicUrls.push(`/address/${channel.participant}`);
					}
				});
			}
		}

		// Add session URLs  
		if (sessionsRes.status === 'fulfilled' && sessionsRes.value.ok) {
			const sessionsData = await sessionsRes.value.json();
			if (sessionsData.success && sessionsData.data) {
				const items = Array.isArray(sessionsData.data) ? sessionsData.data : sessionsData.data.items || [];
				items.forEach((session: any) => {
					if (session.session_id) {
						dynamicUrls.push(`/session/${session.session_id}`);
					}
					// Add participant addresses from sessions - validate hex format
					if (session.participants && Array.isArray(session.participants)) {
						session.participants.forEach((participant: string) => {
							if (isValidAddress(participant)) {
								dynamicUrls.push(`/address/${participant}`);
							}
						});
					}
				});
			}
		}

		// Add asset detail URLs (using token addresses)
		if (assetsRes.status === 'fulfilled' && assetsRes.value.ok) {
			const assetsData = await assetsRes.value.json();
			if (assetsData.success && assetsData.data) {
				const items = Array.isArray(assetsData.data) ? assetsData.data : assetsData.data.items || [];
				items.forEach((asset: any) => {
					if (asset.token && isValidAddress(asset.token)) {
						dynamicUrls.push(`/address/${asset.token}`);
					}
				});
			}
		}

		// Note: Node URLs don't seem to have individual detail pages, so we skip those

		// Remove duplicates (case-insensitive) and sort URLs, limit to prevent oversized sitemaps
		const seenUrls = new Set();
		const uniqueDynamicUrls = dynamicUrls
			.filter(url => {
				const normalizedUrl = url.toLowerCase();
				if (seenUrls.has(normalizedUrl)) {
					return false;
				}
				seenUrls.add(normalizedUrl);
				return true;
			})
			.sort()
			.slice(0, 5000); // Further reduce to 5k URLs for faster GSC processing
		const currentDate = new Date().toISOString().split('T')[0]; // Use YYYY-MM-DD format only

		// Generate XML sitemap with better prioritization
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticRoutes.map(route => {
	const priority = route === '' ? '1.0' : 
					route === '/search' ? '0.9' : 
					route === '/channels' || route === '/sessions' ? '0.8' : '0.7';
	const changefreq = route === '' ? 'hourly' : 'daily';
	
	return `
	<url>
		<loc>${siteUrl}${route === '' ? '/' : route}</loc>
		<lastmod>${currentDate}</lastmod>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
	</url>`;
}).join('')}${uniqueDynamicUrls.map(url => {
	// Set priority based on URL type
	const priority = url.startsWith('/channel/') || url.startsWith('/session/') ? '0.6' : '0.5';
	const changefreq = url.startsWith('/address/') ? 'weekly' : 'daily';
	
	return `
	<url>
		<loc>${siteUrl}${url}</loc>
		<lastmod>${currentDate}</lastmod>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
	</url>`;
}).join('')}
</urlset>`;

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		
		// Fallback static sitemap with all static routes
		const fallbackDate = new Date().toISOString().split('T')[0]; // Use YYYY-MM-DD format only
		const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => {
	const priority = route === '' ? '1.0' : 
					route === '/search' ? '0.9' : 
					route === '/channels' || route === '/sessions' ? '0.8' : '0.7';
	const changefreq = route === '' ? 'hourly' : 'daily';
	
	return `	<url>
		<loc>${siteUrl}${route === '' ? '/' : route}</loc>
		<lastmod>${fallbackDate}</lastmod>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
	</url>`;
}).join('\n')}
</urlset>`;

		return new Response(staticSitemap, {
			headers: {
				'Content-Type': 'application/xml'
			}
		});
	}
	})();

	try {
		return await Promise.race([sitemapPromise, timeoutPromise]);
	} catch (error) {
		console.error('Sitemap generation failed:', error);
		
		// Emergency fallback with minimal static sitemap
		const staticRoutes = ['', '/channels', '/sessions', '/assets', '/nodes', '/search'];
		const fallbackDate = new Date().toISOString().split('T')[0]; // Use YYYY-MM-DD format only
		const emergencyFallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => {
	const priority = route === '' ? '1.0' : route === '/search' ? '0.9' : '0.8';
	return `	<url>
		<loc>https://ynscan.xyz${route}</loc>
		<lastmod>${fallbackDate}</lastmod>
		<changefreq>daily</changefreq>
		<priority>${priority}</priority>
	</url>`;
}).join('\n')}
</urlset>`;

		return new Response(emergencyFallback, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=300' // Cache for 5 minutes only
			}
		});
	}
};