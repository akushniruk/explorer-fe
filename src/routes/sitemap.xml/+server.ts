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

		// Fetch dynamic routes
		const [channelsRes, sessionsRes] = await Promise.allSettled([
			fetch(`${apiBase}/api/v1/channels?limit=1000`),
			fetch(`${apiBase}/api/v1/sessions?limit=1000`)
		]);

		const dynamicUrls: string[] = [];

		// Add channel URLs
		if (channelsRes.status === 'fulfilled' && channelsRes.value.ok) {
			const channelsData = await channelsRes.value.json();
			if (channelsData.success && channelsData.data) {
				channelsData.data.forEach((channel: any) => {
					dynamicUrls.push(`/channel/${channel.channel_id}`);
				});
			}
		}

		// Add session URLs  
		if (sessionsRes.status === 'fulfilled' && sessionsRes.value.ok) {
			const sessionsData = await sessionsRes.value.json();
			if (sessionsData.success && sessionsData.data) {
				sessionsData.data.forEach((session: any) => {
					dynamicUrls.push(`/session/${session.session_id}`);
				});
			}
		}

		// Generate XML sitemap
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `
	<url>
		<loc>${siteUrl}${route}</loc>
		<lastmod>${new Date().toISOString()}</lastmod>
		<changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
		<priority>${route === '' ? '1.0' : '0.8'}</priority>
	</url>`).join('')}
${dynamicUrls.map(url => `
	<url>
		<loc>${siteUrl}${url}</loc>
		<lastmod>${new Date().toISOString()}</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.6</priority>
	</url>`).join('')}
</urlset>`;

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		
		// Fallback static sitemap
		const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${siteUrl}</loc>
		<lastmod>${new Date().toISOString()}</lastmod>
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>
	<url>
		<loc>${siteUrl}/channels</loc>
		<lastmod>${new Date().toISOString()}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>${siteUrl}/sessions</loc>
		<lastmod>${new Date().toISOString()}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.8</priority>
	</url>
</urlset>`;

		return new Response(staticSitemap, {
			headers: {
				'Content-Type': 'application/xml'
			}
		});
	}
};