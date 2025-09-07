import type { RequestHandler } from './$types';

const siteUrl = 'https://ynscan.xyz';

export const GET: RequestHandler = async ({ locals }) => {
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

		// Fetch dynamic routes - get more comprehensive data
		const [channelsRes, sessionsRes, assetsRes, nodesRes] = await Promise.allSettled([
			fetch(`${apiBase}/api/v1/channel/list?limit=1000`),
			fetch(`${apiBase}/api/v1/app-session/list?limit=1000`),
			fetch(`${apiBase}/api/v1/asset/list?limit=1000`),
			fetch(`${apiBase}/api/v1/nodes/list?limit=1000`)
		]);

		const dynamicUrls: string[] = [];

		// Add channel URLs
		if (channelsRes.status === 'fulfilled' && channelsRes.value.ok) {
			const channelsData = await channelsRes.value.json();
			if (channelsData.success && channelsData.data) {
				const items = Array.isArray(channelsData.data) ? channelsData.data : channelsData.data.items || [];
				items.forEach((channel: any) => {
					dynamicUrls.push(`/channel/${channel.channel_id}`);
					// Add participant addresses based on actual schema
					if (channel.wallet) {
						dynamicUrls.push(`/address/${channel.wallet}`);
					}
					if (channel.participant) {
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
					dynamicUrls.push(`/session/${session.session_id}`);
					// Add participant addresses from sessions
					if (session.participants && Array.isArray(session.participants)) {
						session.participants.forEach((participant: string) => {
							dynamicUrls.push(`/address/${participant}`);
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
					if (asset.token) {
						dynamicUrls.push(`/address/${asset.token}`);
					}
				});
			}
		}

		// Note: Node URLs don't seem to have individual detail pages, so we skip those

		// Remove duplicates and sort URLs
		const uniqueDynamicUrls = [...new Set(dynamicUrls)].sort();
		const currentDate = new Date().toISOString();

		// Generate XML sitemap with better prioritization
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => {
	const priority = route === '' ? '1.0' : 
					route === '/search' ? '0.9' : 
					route === '/channels' || route === '/sessions' ? '0.8' : '0.7';
	const changefreq = route === '' ? 'hourly' : 'daily';
	
	return `
	<url>
		<loc>${siteUrl}${route}</loc>
		<lastmod>${currentDate}</lastmod>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
	</url>`;
}).join('')}
${uniqueDynamicUrls.map(url => {
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
		const fallbackDate = new Date().toISOString();
		const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => {
	const priority = route === '' ? '1.0' : 
					route === '/search' ? '0.9' : 
					route === '/channels' || route === '/sessions' ? '0.8' : '0.7';
	const changefreq = route === '' ? 'hourly' : 'daily';
	
	return `	<url>
		<loc>${siteUrl}${route}</loc>
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
};